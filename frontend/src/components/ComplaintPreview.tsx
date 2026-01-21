"use client";

import AISummaryCard from "./AISummaryCard";
import VerificationStatus from "./VerificationStatus";
import BrandLogo from "./BrandLogo";

interface ComplaintPreviewProps {
  complaint: {
    brand: string;
    brandLogoUrl?: string; // Added field
    issue: string;
    files: File[];
    aiSummary?: string;
    status?: string;
  };
}

export default function ComplaintPreview({ complaint }: ComplaintPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 border border-border rounded-2xl bg-card shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-2xl text-foreground">
          Complaint Preview
        </h2>
        {complaint.status && (
          <VerificationStatus status={complaint.status as any} />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground tracking-wide">
            Brand
          </label>
          <div className="flex items-center gap-3 mt-1">
            <BrandLogo
              brandName={complaint.brand}
              brandLogoUrl={complaint.brandLogoUrl}
              className="w-14 h-14 rounded-2xl object-contain bg-white border border-border shadow-sm"
            />
            <p className="text-base font-medium">{complaint.brand}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground tracking-wide">
            Issue Description
          </label>
          <p className="text-sm mt-1 leading-relaxed text-foreground/90">
            {complaint.issue}
          </p>
        </div>

        {complaint.aiSummary && <AISummaryCard summary={complaint.aiSummary} />}

        {complaint.files && complaint.files.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground tracking-wide mb-2 block">
              Attached Files ({complaint.files.length})
            </label>
            <div className="space-y-2">
              {Array.from(complaint.files).map((file, i) => (
                <a
                  key={i}
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-muted text-sm border border-border text-primary hover:underline group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-muted-foreground text-lg group-hover:scale-110 transition-transform">
                      attachment
                    </span>
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Review your complaint carefully before submission
        </p>
      </div>
    </div>
  );
}
