"use client";

interface AISummaryCardProps {
  summary: string;
  editable?: boolean;
  onEdit?: (newSummary: string) => void;
}

export default function AISummaryCard({
  summary,
  editable = false,
  onEdit,
}: AISummaryCardProps) {
  return (
    <div className="border-2 border-primary/30 rounded-2xl p-5 bg-primary/5 dark:bg-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-xl">
          auto_awesome
        </span>
        <h3 className="font-semibold text-sm text-primary tracking-wide">
          AI Enhanced Summary
        </h3>
      </div>

      {editable ? (
        <textarea
          value={summary}
          onChange={(e) => onEdit?.(e.target.value)}
          className="w-full text-sm text-foreground dark:text-gray-200 leading-relaxed bg-transparent border border-primary/20 rounded-xl p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <p className="text-sm text-foreground dark:text-gray-200 leading-relaxed">
          {summary}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="material-symbols-outlined text-xs">info</span>
        <span>AI-generated content • Review for accuracy</span>
      </div>
    </div>
  );
}
