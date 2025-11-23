import { parseJwt } from "@/lib/utils";
import { AccessTokenPayload } from "@/types/next-auth";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const apiBase =
  process.env.NESTJS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/Api";

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
          const res = await fetch(`${apiBase}/Authentication/Login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) return null;

          const tokens = await res.json();

          const decoded = await parseJwt<AccessTokenPayload>(
            tokens.result.accessToken
          );

          return {
            id: decoded.id,
            name: decoded.fullName ?? email,
            email,
            accessToken: tokens.result.accessToken,
            refreshToken: tokens.result.refreshToken,
          } as any;
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
      if ((user as any)?.accessToken) {
        (token as any).accessToken = (user as any).accessToken;
        (token as any).refreshToken = (user as any).refreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      if ((token as any)?.accessToken)
        (session as any).accessToken = (token as any).accessToken;
      if ((token as any)?.refreshToken)
        (session as any).refreshToken = (token as any).refreshToken;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
