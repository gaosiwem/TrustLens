"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SocialLoginButtonProps {
  provider: string;
}

function SocialLoginButtonContent({ provider }: SocialLoginButtonProps) {
  const searchParams = useSearchParams();
  const handleSocialLogin = async () => {
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    await signIn(provider, { callbackUrl });
  };

  return (
    <button
      onClick={handleSocialLogin}
      className="btn-base btn-secondary w-full"
    >
      <span className="text-sm font-semibold">
        {provider === "google" ? "Google" : provider}
      </span>
    </button>
  );
}

export default function SocialLoginButton(props: SocialLoginButtonProps) {
  return (
    <Suspense
      fallback={
        <div className="h-12 w-full animate-pulse bg-muted rounded-xl" />
      }
    >
      <SocialLoginButtonContent {...props} />
    </Suspense>
  );
}
