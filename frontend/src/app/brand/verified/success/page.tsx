"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

export default function VerificationSuccessPage() {
  useEffect(() => {
    toast.success("Payment successful! Your verification is being processed.");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-20">
      <div className="max-w-xl w-full mx-auto px-4 text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10 mx-auto" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">
            Payment <span className="text-emerald-500 italic">Successful!</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Thank you for your purchase. Your payment has been received! Our
            team is now ready to verify your documents. Your verified badge will
            be activated as soon as the review is complete.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl shadow-foreground/5 space-y-4">
          <p className="text-sm font-bold text-muted-foreground tracking-widest">
            Next Steps
          </p>
          <ul className="text-left space-y-3 font-medium text-foreground italic">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black">
                1
              </span>
              Our team will review your uploaded documents.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black">
                2
              </span>
              You will receive an email confirmation once finalized.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black">
                3
              </span>
              The verified badge will appear on your brand profile.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/brand/verified" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 rounded-2xl px-10 font-black text-xl border-2 hover:bg-muted"
            >
              Verification Center
            </Button>
          </Link>
          <Link href="/brand/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full h-16 rounded-2xl px-10 font-black text-xl shadow-2xl shadow-primary/20 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
