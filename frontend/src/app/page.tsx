import Link from "next/link";
import {
  Shield,
  Search,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Users,
} from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import PublicHeader from "../components/PublicHeader";
import BrandSearch from "../components/BrandSearch";
import BrandTrustPreview from "../components/landing/BrandTrustPreview";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <PublicHeader transparent={false} />

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary">
              <TrendingUp className="w-4 h-4" />
              Consumer Trust & Complaint Management Platform
            </div>

            <h1 className="heading-1 text-5xl sm:text-6xl lg:text-7xl">
              Your Voice, <span className="text-primary">Amplified</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TrustLens empowers consumers to hold brands accountable while
              helping businesses build trust through transparent complaint
              management and verified responses.
            </p>

            {/* Global Search */}
            <div className="py-6 w-full relative z-30">
              <BrandSearch />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto btn-base btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
              >
                Start Free Today
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/complaints"
                className="w-full sm:w-auto btn-base btn-secondary px-8 py-4 text-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Browse Complaints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-1 text-4xl mb-4">Why Choose TrustLens?</h2>
            <p className="text-lg text-muted-foreground">
              The most comprehensive platform for consumer advocacy and brand
              reputation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Verified Trust"
              description="AI-powered verification system ensures authentic complaints and legitimate brand responses"
              gradient="from-primary to-cyan-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Data-Driven Insights"
              description="Comprehensive analytics help brands identify trends and improve customer satisfaction"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={CheckCircle}
              title="Resolution Tracking"
              description="Real-time status updates keep everyone informed throughout the complaint lifecycle"
              gradient="from-primary/60 to-primary"
            />
            <FeatureCard
              icon={Users}
              title="Community Power"
              description="Join thousands of consumers making their voices heard and brands more accountable"
              gradient="from-warning to-error"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Brand Reputation"
              description="Transparent complaint handling builds customer trust and improves brand image"
              gradient="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={Search}
              title="Smart Search"
              description="Find complaints by brand, category, or status with powerful filtering and sorting"
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 lg:items-center gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary">
                <Shield className="w-4 h-4" />
                For Brand Owners & Managers
              </div>
              <h2 className="heading-1 text-4xl lg:text-5xl leading-tight">
                Empower Your <span className="text-primary italic">Brand</span>{" "}
                reputation
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                TrustLens provides businesses with professional tools to manage
                customer complaints, build transparent trust, and showcase
                verified status to millions of consumers.
              </p>
              <ul className="space-y-4">
                {[
                  "Respond officially to customer complaints",
                  "Gain a 'Verified Brand' badge for credibility",
                  "Access detailed reputation & sentiment analytics",
                  "Manage multi-brand portfolios from one dashboard",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-4">
                <Link
                  href="/brand/claim"
                  className="btn-base btn-primary px-10 py-4 text-lg"
                >
                  Claim Your Brand
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-base btn-secondary px-10 py-4 text-lg"
                >
                  Brand Login
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
              <div className="relative p-8 bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden group">
                <BrandTrustPreview />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 rotate-12 opacity-5 pointer-events-none">
                  <Shield className="w-64 h-64 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
            <div className="relative z-10 text-center space-y-6">
              <h2 className="heading-1 text-4xl text-white">
                Ready to Make Your Voice Heard?
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Join TrustLens today and be part of a community that values
                transparency, accountability, and consumer rights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto btn-base px-8 py-4 bg-white text-primary font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto btn-base px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 font-bold text-lg hover:bg-white/20 transition-all"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">TrustLens</span>
            </div>
            <p
              className="text-sm text-muted-foreground"
              suppressHydrationWarning
            >
              © {new Date().getFullYear()} TrustLens. Building trust through
              transparency.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/brand/claim"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                For Businesses
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: FeatureCardProps) {
  return (
    <div className="group card-base hover:shadow-xl">
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`}
      />
      <div className="relative space-y-4">
        <div
          className={`p-3 rounded-xl bg-linear-to-br ${gradient} w-fit shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="heading-3">{title}</h3>
        <p className="text-small text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
