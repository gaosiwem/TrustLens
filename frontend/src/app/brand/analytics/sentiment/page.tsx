"use client";

import BrandHeader from "@/components/brand/BrandHeader";
import SentimentDashboard from "./sentimentDashboard";

export default function BrandSentimentPage() {
  return (
    <>
      <BrandHeader
        title="Sentiment Analytics"
        subtitle="Track customer emotions, urgency, and topic trends with AI"
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <SentimentDashboard />
      </div>
    </>
  );
}
