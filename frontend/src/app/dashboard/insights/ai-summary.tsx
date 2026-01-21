"use client";

export default function AiSummary({ summary }: { summary?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card text-card-foreground">
      <h3 className="font-semibold text-sm mb-2">AI Summary</h3>
      <p className="text-sm text-muted-foreground">
        {summary || "Loading AI insights..."}
      </p>
    </div>
  );
}
