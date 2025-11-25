import { parseJwt } from "@/lib/utils";
import { authenticationApiFactory } from "@/Service/Factories";
import Instance from "@/Service/Instance";
import { AccessTokenPayload } from "@/types/next-auth";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = (credentials ?? {}) as {
          email: string;
          password: string;
        };

        try {
          const res = await authenticationApiFactory.login({
            authenticationSignInRequestModel: {
              email,
              password,
            },
          });

          const tokens = res.data;

          const decoded = await parseJwt<AccessTokenPayload>(
            tokens.result.accessToken
          );

          return {
            id: decoded.id,
            name: decoded.fullName ?? email,
            email,
            accessToken: tokens.result.accessToken,
            refreshToken: tokens.result.refreshToken,
          };
        } catch (error) {
          console.error("Authorize err", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.refreshToken) session.refreshToken = token.refreshToken;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
