"use client";

import PublicHeader from "../../components/PublicHeader";

export default function VerifiedExplainedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />

      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <span className="material-symbols-outlined text-white text-4xl">
                verified
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verified Business
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              What does the blue checkmark mean?
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-green-500 text-3xl">
                  business
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Confirmed Identity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TrustLens has verified that this business is a registered
                  legal entity. We check registration documents (CIPC/CK) to
                  ensure you are dealing with a real company.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-blue-500 text-3xl">
                  admin_panel_settings
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Active Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This brand has an active team managing their profile. They are
                  committed to responding to customer feedback and resolving
                  complaints.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-purple-500 text-3xl">
                  shield_lock
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Communication</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verified brands use secure channels to communicate with
                  customers, ensuring your data and privacy are protected during
                  dispute resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
