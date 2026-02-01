import {
  accountApiFactory,
  authenticationApiFactory,
} from "@/Service/Factories";
import type { AuthResponseModel } from "@/Service/Generates/api";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Types
type RawCredentials = {
  email?: string;
  password?: string;
};

// Error normalization
const normalizeAuthError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  // Enhance this to look into Axios error response if available
  // @ts-ignore - Check if it's an axios error
  if (error?.response?.data?.message) {
    // @ts-ignore
    return new Error(error.response.data.message);
  }
  return new Error(fallback);
};

export const authOptions: NextAuthOptions = {
  // Use JWT strategy because we need to persist the opaque session ID in the cookie
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const creds = (credentials ?? {}) as RawCredentials & {
            passkey?: string;
          };

          // Passkey login flow: frontend handles WebAuthn and sends credential JSON
          if (creds.passkey) {
            if (!creds.email) {
              throw new Error(
                "E-posta (Email) passkey ile giriş için gerekli.",
              );
            }
            const parsed =
              typeof creds.passkey === "string"
                ? JSON.parse(creds.passkey)
                : creds.passkey;
            const res = await authenticationApiFactory.passkeyLoginFinish({
              passkeyLoginFinishRequestModel: {
                Email: creds.email,
                Credential: parsed,
              },
            });

            const authData = res.data?.Result as unknown as
              | AuthResponseModel
              | undefined;
            if (!authData || !authData.SessionId) {
              throw new Error("Passkey ile giriş başarısız.");
            }

            return {
              id: authData.SessionId,
              sessionId: authData.SessionId,
              expiresAt: authData.ExpiresAt,
              requiresTwoFactor: authData.RequiresTwoFactor,
            };
          }

          if (!creds.email || !creds.password) {
            throw new Error("E-posta ve şifre gereklidir.");
          }

          // Call the new Login endpoint
          const response = await authenticationApiFactory.login({
            loginRequestModel: {
              Email: creds.email,
              Password: creds.password,
            },
          });

          const baseResponse = response.data;

          if (!baseResponse.Result) {
            throw new Error("Sunucudan geçerli bir yanıt alınamadı.");
          }

          const authData = baseResponse.Result as unknown as AuthResponseModel;

          if (!authData.SessionId) {
            throw new Error("Oturum kimliği alınamadı.");
          }

          return {
            id: authData.SessionId,
            sessionId: authData.SessionId,
            expiresAt: authData.ExpiresAt,
            requiresTwoFactor: authData.RequiresTwoFactor,
          };
        } catch (error: any) {
          console.error("Login failed:", error);
          throw normalizeAuthError(error, "Giriş işlemi başarısız oldu.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Allow updating session from client (e.g. after 2FA verification if we handle it client-side)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // Initial sign in - properties come from the object returned by authorize()
      if (user) {
        token.sessionId = user.sessionId;
        token.expiresAt = user.expiresAt;
        token.requiresTwoFactor = user.requiresTwoFactor;
        // User.id is already set
      }

      return token;
    },
    async session({ session, token }) {
      // Pass token data to session
      session.sessionId = token.sessionId;
      session.expiresAt = token.expiresAt;
      session.requiresTwoFactor = token.requiresTwoFactor;

      // If we have a session ID and NOT requiresTwoFactor, try to fetch profile
      // If requiresTwoFactor is true, the user is technically not fully logged in yet
      if (session.sessionId && !session.requiresTwoFactor) {
        try {
          // Fetch user profile using the session ID in header
          const profileRes = await accountApiFactory.profile({
            headers: {
              "X-Session-Id": session.sessionId,
            },
          });

          // profileRes.data is AccountProfileResponseBaseModel { Result: AccountProfileResponseModel, ... }
          const profile = profileRes.data.Result as any; // Cast if needed

          if (profile) {
            session.user = {
              id: profile.Id,
              name: profile.FullName,
              email: profile.Email,
              image: profile.Image,
              role: profile.Role,
            };
          }
        } catch (error) {
          console.error("Failed to fetch profile in session callback", error);
          // Don't fail the session entirely, but user info might be missing
        }
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.sessionId) {
        try {
          await authenticationApiFactory.logout({
            headers: {
              "X-Session-Id": token.sessionId,
            },
          });
        } catch (error) {
          // Ignore logout errors
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
