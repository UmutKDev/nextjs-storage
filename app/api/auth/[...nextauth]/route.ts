import { parseJwt } from "@/lib/utils";
import {
  accountApiFactory,
  authenticationApiFactory,
} from "@/Service/Factories";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
      },
      async authorize(credentials) {
        const { accessToken, refreshToken } = (credentials ?? {}) as {
          accessToken?: string;
          refreshToken?: string;
        };

        if (!accessToken) return null;

        try {
          const decoded = await parseJwt<{
            id: string;
            fullName?: string;
            email?: string;
            image?: string;
          }>(accessToken);

          return {
            id: decoded.id,
            name: decoded.fullName ?? decoded.email ?? "Kullanıcı",
            email: decoded.email,
            image: decoded.image,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("Authorize err", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // on initial sign in, store tokens and expiration
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        try {
          const decoded = await parseJwt<{ exp?: number }>(user.accessToken);
          token.accessTokenExpires = decoded.exp
            ? decoded.exp * 1000
            : undefined;
        } catch (err) {
          console.warn("Failed to decode access token expiration", err);
          token.accessTokenExpires = undefined;
        }

        return token;
      }

      if (token.accessToken && token.accessTokenExpires) {
        const now = Date.now();
        if (now < (token.accessTokenExpires as number) - 60 * 1000) {
          return token;
        }
      }

      // access token expired - try to refresh using refreshToken
      try {
        if (!token.refreshToken) {
          token.error = "NoRefreshToken";
          return token;
        }

        const res = await authenticationApiFactory.refreshToken({
          authenticationRefreshTokenRequestModel: {
            refreshToken: token.refreshToken,
          },
        });

        const tokens = res.data.result;

        // set new tokens
        token.accessToken = tokens.accessToken;
        token.refreshToken = tokens.refreshToken ?? token.refreshToken;

        try {
          const decoded = await parseJwt<{ exp?: number }>(tokens.accessToken);
          token.accessTokenExpires = decoded.exp
            ? decoded.exp * 1000
            : undefined;
        } catch (err) {
          console.warn("Failed to decode refreshed access token", err);
          token.accessTokenExpires = undefined;
        }

        delete token.error;

        return token;
      } catch (error) {
        console.error("Refresh access token error", error);
        token.error = "RefreshAccessTokenError";
        return token;
      }
    },
    async session({ session, token }) {
      // Provide access token to client but do NOT expose refresh token
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.accessTokenExpires)
        session.accessTokenExpires = token.accessTokenExpires;

      // propagate token errors to session so client can react (e.g., force logout)
      if (token?.error) session.error = token.error as string;

      try {
        const account = await accountApiFactory.profile({
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });

        session.user = {
          id: account.data.result.id,
          name: account.data.result.fullName,
          email: account.data.result.email,
          image: account.data.result.image,
        };
      } catch (err) {
        // If profile lookup fails, return session with whatever we have — the token may be invalid
        console.warn("Failed to fetch profile in session callback", err);
      }

      return session;
    },
    // when the user signs out, try to revoke refresh token on the backend
  },
  events: {
    async signOut({ token }) {
      try {
        const refreshToken = token?.refreshToken;
        if (!refreshToken) return;

        await authenticationApiFactory.logout({
          authenticationRefreshTokenRequestModel: {
            refreshToken,
          },
        });
      } catch (err) {
        console.warn("Failed to revoke refresh token on signOut", err);
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
