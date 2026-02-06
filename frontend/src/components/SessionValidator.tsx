"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";

export function SessionValidator() {
  const { data: session, status } = useSession();
  const hasValidated = useRef(false);

  useEffect(() => {
    // 1. Setup Axios Interceptor for 401 Handling
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn(
            "[SessionValidator] Global 401 detected. Signing out...",
          );
          signOut({ callbackUrl: "/auth/login?reason=session_expired" });
        }
        return Promise.reject(error);
      },
    );

    // 2. Perform initial validation on reload if authenticated
    if (
      status === "authenticated" &&
      session?.accessToken &&
      !hasValidated.current
    ) {
      const validate = async () => {
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
          console.log(
            `[SessionValidator] Validating session with ${apiUrl}/users/me...`,
          );
          await axios.get(`${apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          console.log("[SessionValidator] Session is valid.");
          hasValidated.current = true;
        } catch (error: any) {
          // If we detect a 401 or 404, we must sign out
          const statusCode = error.response?.status;
          if (statusCode === 401) {
            console.warn(
              "[SessionValidator] 401 Unauthorized from /users/me. Signing out...",
            );
            signOut({ callbackUrl: "/auth/login?reason=session_expired" });
          } else if (statusCode === 404) {
            console.warn(
              "[SessionValidator] 404 User not found in database. Signing out...",
            );
            signOut({ callbackUrl: "/auth/login?reason=account_deleted" });
          } else {
            console.error(
              `[SessionValidator] Validation failed with status ${statusCode}:`,
              error.message,
            );
            // On other errors (500, network), we don't kick the user out
            // to avoid false positives during minor backend downtime.
            hasValidated.current = true; // Still mark as validated to prevent spamming
          }
        }
      };

      validate();
    } else if (status === "unauthenticated") {
      hasValidated.current = false;
    }

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [status, session?.accessToken]);

  return null;
}
