"use client";

import { ShieldCheck, Clock, CheckCircle2, Building2 } from "lucide-react";
import Link from "next/link";
import PublicHeader from "../../../components/PublicHeader";
import { Button } from "../../../components/ui/button";

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 text-primary font-black tracking-widest uppercase text-xs">
              <span className="w-8 h-[2px] bg-primary"></span>
              Onboarding Process
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
                Establishing <span className="text-primary italic">Trust</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your brand ownership claim is currently being meticulously
                reviewed by our TrustLens Verification Team.
              </p>
            </div>

            <div className="space-y-6 bg-card/50 backdrop-blur-md border border-border p-8 rounded-4xl shadow-xl shadow-primary/5">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Current Status: Under Review
              </h3>

              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Application Received</h4>
                    <p className="text-xs text-muted-foreground">
                      Your documentation has been successfully uploaded.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pulse shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Identity Verification</h4>
                    <p className="text-xs text-muted-foreground">
                      Our team is verifying your affiliation with the brand.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Dashboard Access</h4>
                    <p className="text-xs text-muted-foreground">
                      Access will be granted immediately upon approval.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="h-14 px-8 rounded-2xl font-bold border-2"
                >
                  Return to Home
                </Button>
              </Link>
              <Button
                disabled
                className="h-14 px-8 rounded-2xl font-bold bg-muted text-muted-foreground cursor-not-allowed"
              >
                View Draft Dashboard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground italic">
              * Verification typically takes 24-48 business hours. We'll notify
              you via email as soon as the process is complete.
            </p>
          </div>

          {/* Right Column: Visual Element */}
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-3xl group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="relative aspect-square rounded-[4rem] bg-linear-to-br from-card to-background border-2 border-border p-12 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent" />

              <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-ping opacity-20" />
                <ShieldCheck className="w-16 h-16 text-primary" />
              </div>

              <h2 className="text-2xl font-black text-center mb-2">
                Trust Service
              </h2>
              <p className="text-sm text-center text-muted-foreground max-w-[240px]">
                Building a reliable bridge between brands and consumers.
              </p>

              <div className="mt-12 grid grid-cols-3 gap-4 w-full opacity-50">
                <div className="h-2 bg-muted rounded-full" />
                <div className="h-2 bg-primary/40 rounded-full" />
                <div className="h-2 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-xs text-muted-foreground border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} TrustLens Technologies. All rights
        reserved.
      </footer>
    </div>
  );
}
