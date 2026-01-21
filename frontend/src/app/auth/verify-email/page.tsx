"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (token) {
      // Mock verification process
      setTimeout(() => {
        setStatus("success");
      }, 2000);
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 p-8 max-w-md w-full bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-[#dce0e5] dark:border-[#2c3e46] text-center">
        <h1 className="text-3xl font-bold text-[#111618] dark:text-white">
          Email Verification
        </h1>

        {status === "loading" && (
          <div className="flex flex-col gap-4 items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#637588] dark:text-[#93a2b7]">
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium text-lg">
              Your email has been successfully verified!
            </p>
            <p className="text-[#637588] dark:text-[#93a2b7] text-sm">
              You can now access all features of TrustLens.
            </p>
            <Link href="/auth/login" className="w-full">
              <Button>Continue to Sign In</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              !
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium text-lg">
              Invalid or expired token
            </p>
            <p className="text-[#637588] dark:text-[#93a2b7] text-sm">
              The verification link is no longer valid or has already been used.
            </p>
            <Link href="/auth/register" className="w-full">
              <Button>Try Registering Again</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
