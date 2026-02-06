import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

        console.log(
          `[Auth] Attempting login to ${apiUrl}/auth/login with email: ${credentials.email}`,
        );

        try {
          const response = await axios.post(`${apiUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log(
            `[Auth] Backend response status: ${response.status}`,
            response.data,
          );

          const user = response.data.user;
          const token = response.data.token;

          if (user && token) {
            console.log("[Auth] Login successful for:", user.email);
            return { ...user, accessToken: token };
          }

          console.warn("[Auth] Login response missing user or token");
          return null;
        } catch (error: any) {
          console.error("[Auth] Backend login request failed:");
          if (error.response) {
            console.error("[Auth] Status:", error.response.status);
            console.error("[Auth] Data:", error.response.data);
          } else if (error.request) {
            console.error("[Auth] No response received from backend");
          } else {
            console.error("[Auth] Request Setup Error:", error.message);
          }
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.brandId = user.brandId;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.brandId = token.brandId;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: { signIn: "/auth/login" },
};
