import { parseJwt } from "@/lib/utils";
import {
  accountApiFactory,
  authenticationApiFactory,
} from "@/Service/Factories";
import type { AuthenticationTokenResponseModel } from "@/Service/Generates/api";
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

type DecodedAccessToken = {
  id: string;
  fullName?: string;
  email?: string;
  image?: string;
  exp?: number;
};

type RawCredentials = {
  email?: string;
  password?: string;
};

type UserWithTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires?: number;
};

const isUserWithTokens = (u: unknown): u is UserWithTokens =>
  !!u && typeof u === "object" && "accessToken" in u;

const ACCESS_TOKEN_GRACE_PERIOD_MS = 60 * 1000;

const normalizeAuthError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error(fallback);
};

const ensureTokens = (tokens?: AuthenticationTokenResponseModel | null) => {
  if (!tokens?.accessToken) {
    throw new Error("Erişim tokenı yok veya geçersiz.");
  }
  if (!tokens.refreshToken) {
    throw new Error("Refresh token zorunludur.");
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

const decodeUserFromToken = async (accessToken: string) => {
  const decoded = await parseJwt<DecodedAccessToken>(accessToken);
  if (!decoded?.id) {
    throw new Error("Token içerisinde kullanıcı bilgisi bulunamadı.");
  }

  return {
    id: decoded.id,
    name: decoded.fullName ?? decoded.email ?? "Kullanıcı",
    email: decoded.email,
    image: decoded.image,
    accessTokenExpires: decoded.exp ? decoded.exp * 1000 : undefined,
  };
};

const mapTokensToUser = async (
  tokens?: AuthenticationTokenResponseModel | null,
) => {
  const { accessToken, refreshToken } = ensureTokens(tokens);
  try {
    const decoded = await decodeUserFromToken(accessToken);
    const expiresFromResponse = tokens?.expiresIn
      ? Date.now() + tokens.expiresIn * 1000
      : undefined;
    const accessTokenExpires =
      expiresFromResponse ??
      decoded.accessTokenExpires ??
      Date.now() + 5 * 60 * 1000;

    return {
      ...decoded,
      accessToken,
      refreshToken,
      accessTokenExpires,
    };
  } catch (error) {
    throw normalizeAuthError(error, "Kullanıcı bilgileri çözümlenemedi.");
  }
};

const authenticateWithBackend = async (credentials: RawCredentials) => {
  if (!credentials.email || !credentials.password) {
    throw new Error("E-posta ve şifre gerekli.");
  }

  try {
    const loginRes = await authenticationApiFactory.login({
      authenticationSignInRequestModel: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    console.log(loginRes);

    const tokens = loginRes.data?.result;
    if (!tokens) {
      throw new Error("Kimlik doğrulama yanıtı alınamadı.");
    }

    return tokens;
  } catch (error) {
    throw normalizeAuthError(error, "Kimlik doğrulama başarısız oldu.");
  }
};

const refreshSessionToken = async (token: JWT) => {
  if (typeof token.refreshToken !== "string" || !token.refreshToken) {
    token.error = "NoRefreshToken";
    return token;
  }

  try {
    const res = await authenticationApiFactory.refreshToken({
      authenticationRefreshTokenRequestModel: {
        refreshToken: token.refreshToken,
      },
    });

    const tokens = res.data.result;

    if (!tokens?.accessToken) {
      throw new Error("Yeni erişim tokenı alınamadı.");
    }

    token.accessToken = tokens.accessToken;
    token.refreshToken = tokens.refreshToken ?? token.refreshToken;

    try {
      const decoded = await parseJwt<{ exp?: number }>(tokens.accessToken);
      const fromExp = decoded.exp ? decoded.exp * 1000 : undefined;
      const fromResponse = tokens.expiresIn
        ? Date.now() + tokens.expiresIn * 1000
        : undefined;
      token.accessTokenExpires =
        fromResponse ?? fromExp ?? Date.now() + 5 * 60 * 1000;
    } catch (err) {
      console.warn("Failed to decode refreshed access token", err);
      token.accessTokenExpires = tokens?.expiresIn
        ? Date.now() + tokens.expiresIn * 1000
        : undefined;
    }

    delete token.error;
    return token;
  } catch (error) {
    console.error("Refresh access token error", error);
    token.error = "RefreshAccessTokenError";
    return token;
  }
};

export const authOptions: NextAuthOptions = {
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
          const normalized = (credentials ?? {}) as RawCredentials;

          const tokens = await authenticateWithBackend(normalized);
          return await mapTokensToUser(tokens);
        } catch (error) {
          throw normalizeAuthError(error, "Kimlik doğrulama başarısız oldu.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (isUserWithTokens(user)) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;

        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === "number"
      ) {
        const now = Date.now();
        if (now < token.accessTokenExpires - ACCESS_TOKEN_GRACE_PERIOD_MS) {
          return token;
        }
      }

      return refreshSessionToken(token);
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.accessTokenExpires)
        session.accessTokenExpires = token.accessTokenExpires;

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
