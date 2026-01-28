"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import BrandClaimForm from "../../../components/BrandClaimForm";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { isPersonalEmail } from "../../../utils/email";
import UserProfileMenu from "../../../components/UserProfileMenu";

import { useRouter } from "next/navigation";

// Helper: Local Badge component
function Badge({ children, variant, className }: any) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        variant === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default function BrandClaimPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if user already manages a brand (Claim Approved)
  useEffect(() => {
    if (session?.user?.brandId) {
      router.replace("/brand/verified");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="mt-4 text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">
                shield
              </span>
              <span className="text-xl font-black tracking-tighter">
                TrustLens
              </span>
            </Link>

            {/* Profile Menu - Show when logged in */}
            {session && <UserProfileMenu />}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 font-bold tracking-widest text-[10px]"
          >
            FOR BRAND OWNERS
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Take Control of Your Reputation
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Claim your brand verified profile to respond to customers and build
            lasting trust.
          </p>
        </div>

        {session && !isPersonalEmail(session.user?.email || "") ? (
          <BrandClaimForm />
        ) : (
          <div className="max-w-4xl w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side: Educational Content */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-4">
                    Why verify your brand?
                  </h2>
                  <p className="text-muted-foreground">
                    Verifying your brand on TrustLens allows you to take control
                    of your public narrative and build direct relationships with
                    your customers.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      title: "Direct Response Channel",
                      desc: "Respond to customer complaints officially. Your responses are marked with a 'Verified' badge for authenticity.",
                      icon: "chat_bubble",
                    },
                    {
                      title: "Reputation Analytics",
                      desc: "Track your sentiment trends and resolution efficiency with our AI-powered sentiment engine.",
                      icon: "analytics",
                    },
                    {
                      title: "Trust Badge",
                      desc: "Showcase your commitment to accountability with a persistent TrustLens verification badge on your website.",
                      icon: "verified",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Action Card */}
              <div className="bg-white dark:bg-[#1a2c34] rounded-[2.5rem] p-10 shadow-2xl border border-border text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    business
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-2">
                  Business Account Required
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  {session
                    ? "To claim a brand, you must use an official business email address. Your current account uses a personal email."
                    : "Sign in with your official business account to begin your brand verification application."}
                </p>
                <div className="flex flex-col gap-3">
                  {!session ? (
                    <>
                      <Link href="/auth/register?callbackUrl=/brand/claim">
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg">
                          Register Business Account
                        </Button>
                      </Link>
                      <Link href="/auth/login?callbackUrl=/brand/claim">
                        <Button
                          variant="ghost"
                          className="w-full h-14 rounded-2xl font-bold"
                        >
                          Sign In
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        (window.location.href =
                          "mailto:support@trustlens.co.za?subject=Business Verification Request")
                      }
                      className="btn-base btn-primary w-full h-14 rounded-2xl font-bold text-lg"
                    >
                      Contact Support
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-8 tracking-widest font-bold uppercase">
                  South African Business Standard
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
