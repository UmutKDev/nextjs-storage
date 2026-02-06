import {
  accountApiFactory,
  authenticationApiFactory,
} from "@/Service/Factories";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Authentication Flow:
 *
 * 1. POST /Authentication/Login/Check
 *    - Check if user exists and has 2FA enabled
 *    - Response: { Exists, HasPasskey, HasTwoFactor, TwoFactorMethod, AvailableMethods }
 *
 * 2. POST /Authentication/Login (or Passkey/Login/Finish)
 *    - Authenticate with credentials
 *    - Response: { SessionId, ExpiresAt, RequiresTwoFactor }
 *    - If RequiresTwoFactor=true, session is pending 2FA verification
 *
 * 3. POST /Authentication/Verify2FA (if RequiresTwoFactor=true)
 *    - Verify TOTP or backup code
 *    - Response: { SessionId, ExpiresAt, RequiresTwoFactor: false }
 */

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/authentication",
    error: "/authentication",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
        passkey: { label: "Passkey", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Giriş bilgileri eksik.");
        }

        const { email, password, twoFactorCode, passkey } = credentials;

        // --- Passkey Login Flow ---
        if (passkey) {
          if (!email) {
            throw new Error("Passkey girişi için e-posta gereklidir.");
          }

          const credentialJson =
            typeof passkey === "string" ? JSON.parse(passkey) : passkey;

          const res = await authenticationApiFactory.passkeyLoginFinish({
            passkeyLoginFinishRequestModel: {
              Email: email,
              Credential: credentialJson,
            },
          });

          const result = res.data?.Result;
          if (!result?.SessionId) {
            throw new Error("Passkey doğrulaması başarısız.");
          }

          return {
            id: result.SessionId,
            sessionId: result.SessionId,
            expiresAt: result.ExpiresAt,
          };
        }

        // --- Standard Email/Password Login Flow ---
        if (!email || !password) {
          throw new Error("E-posta ve şifre zorunludur.");
        }

        const res = await authenticationApiFactory.login({
          loginRequestModel: {
            Email: email,
            Password: password,
          },
        });

        const result = res.data?.Result;
        if (!result?.SessionId) {
          throw new Error(
            "Giriş yapılamadı, lütfen bilgilerinizi kontrol edin.",
          );
        }

        // If 2FA is required and code is provided, verify it
        if (
          !!twoFactorCode &&
          twoFactorCode.length > 0 &&
          twoFactorCode !== "undefined"
        ) {
          const verifyRes = await authenticationApiFactory.verify2FA(
            {
              twoFactorVerifyRequestModel: { Code: twoFactorCode },
            },
            {
              headers: { "X-Session-Id": result.SessionId },
            },
          );

          const verifyResult = verifyRes.data?.Result;
          if (!verifyResult.SessionId) {
            throw new Error("2FA kodu hatalı.");
          }

          // 2FA verified successfully
          return {
            id: verifyResult.SessionId,
            sessionId: verifyResult.SessionId,
            expiresAt: verifyResult.ExpiresAt,
            requiresTwoFactor: false,
          };
        }

        // Return session - if RequiresTwoFactor is true, user will be redirected to /authentication/2fa
        return {
          id: result.SessionId,
          sessionId: result.SessionId,
          expiresAt: result.ExpiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session.update() calls (e.g., after 2FA verification)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // Initial sign in - copy user data to token
      if (user) {
        token.sessionId = user.sessionId;
        token.expiresAt = user.expiresAt;
        token.requiresTwoFactor = user.requiresTwoFactor;
      }

      return token;
    },
    async session({ session, token }) {
      session.sessionId = token.sessionId;
      session.expiresAt = token.expiresAt;
      session.requiresTwoFactor = token.requiresTwoFactor;

      // Only fetch profile if session is fully authenticated (2FA passed or not required)
      if (session.sessionId && !session.requiresTwoFactor) {
        try {
          const profileRes = await accountApiFactory.profile({
            headers: { "X-Session-Id": session.sessionId },
          });

          const profile = profileRes.data.Result;
          if (profile) {
            session.user = {
              id: profile.Id,
              name: profile.FullName,
              email: profile.Email,
              image: profile.Image,
              role: profile.Role,
            };
          }
        } catch {
          // Profile fetch failed - session might be invalid
        }
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Notify backend to invalidate session
      if (token.sessionId) {
        try {
          await authenticationApiFactory.logout({
            headers: { "X-Session-Id": token.sessionId },
          });
        } catch {
          // Backend logout failed - ignore
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
