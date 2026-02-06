// TrustLens Middleware - Fixed Imports
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth",
  "/api/auth",
  "/api/public",
  "/widgets",
  "/brand",
  "/brands",
  "/categories",
  "/complaints",
  "/reviews",
  "/verified-explained",
  "/help",
  "/logo.png",
  "/favicon.ico",
];

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 1. Exclude static assets and internal paths
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/"
        ) {
          return true;
        }

        // 2. Token Expiration Check
        if (token) {
          const accessToken = token.accessToken as string | undefined;
          if (accessToken) {
            try {
              const payloadBase64 = accessToken.split(".")[1];
              if (payloadBase64) {
                const base64 = payloadBase64
                  .replace(/-/g, "+")
                  .replace(/_/g, "/");
                const padding = "=".repeat((4 - (base64.length % 4)) % 4);
                const decodedJson = atob(base64 + padding);
                const payload = JSON.parse(decodedJson);
                if (payload.exp && Date.now() >= payload.exp * 1000) {
                  return false; // Redirect to login
                }
              }
            } catch (error) {
              return false;
            }
          }
        }

        // 3. Public Path Access
        const isPublicPath = PUBLIC_PATHS.some(
          (path) => pathname === path || pathname.startsWith(path + "/"),
        );

        return isPublicPath ? true : !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: ["/:path*"],
};
