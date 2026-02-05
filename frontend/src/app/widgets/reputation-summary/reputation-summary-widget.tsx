import { Quote, Star } from "lucide-react";

type Props = {
  summary: any;
  feed: any;
};

export default function ReputationSummaryWidget({ summary, feed }: Props) {
  const brandName = summary?.brand?.name || "Brand";
  const k = summary?.kpis;
  const trustScore = k ? parseFloat(k.trustScore) : 0;
  // Convert trust score (0-100) to 5-star scale
  const rating = (trustScore / 20).toFixed(1);

  const styles = summary.widgetStyles || {};
  const primaryColor = styles.primaryColor || "#0F172A";
  const starColor = styles.starColor || "#E11D48";
  const fontFamily = styles.fontFamily || "Inter";
  const isFree = summary.plan === "FREE";

  return (
    <div
      className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen p-8"
      style={{ fontFamily }}
    >
      <style>{`
         .text-primary-custom { color: ${primaryColor} !important; }
         .fill-star-custom { fill: ${starColor} !important; color: ${starColor} !important; }
      `}</style>
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 items-start mb-16">
          {/* Left: Heading */}
          <div className="flex flex-col justify-center h-full">
            <h2
              className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl text-slate-900 dark:text-slate-50"
              style={{ color: primaryColor }}
            >
              What do customers say about{" "}
              <span className="text-primary">{brandName}</span>?
            </h2>
          </div>

          {/* Right: Summary Card */}
          <div className="flex justify-start lg:justify-end">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm w-full max-w-md">
              <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-4">
                Our customers are{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  'Very likely'
                </span>{" "}
                to recommend us
              </h3>

              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-8 h-8 fill-star-custom" />
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                    Rated {rating}/5
                  </div>
                  {isFree && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      based on recent activity on
                    </div>
                  )}
                </div>
                {(isFree || summary.widgetWatermarkText) && (
                  <div className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1">
                    {summary.widgetWatermarkText || "TrustLens"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(feed?.items || []).map((i: any) => (
            <div
              key={i.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <Quote className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-4 transform -scale-x-100" />
              <div className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                {i.title || "Excellent Service"}
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                {i.outcomeTag ? `Resolution: ${i.outcomeTag}. ` : ""}
                {i.description ||
                  "We successfully resolved this inquiry to the customer's satisfaction within our target SLA timeframes."}
              </p>

              <div className="mt-auto">
                <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {i.customerName || "Verified Customer"}
                </div>
                {(isFree || summary.widgetWatermarkText) && (
                  <div className="text-xs text-slate-500 mb-3">
                    on {summary.widgetWatermarkText || "TrustLens"}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (i.stars || 0)
                            ? "fill-star-custom"
                            : "fill-slate-200 dark:fill-slate-800 text-slate-200 dark:text-slate-800 opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-medium text-slate-400">
                    {i.resolvedAt
                      ? new Date(i.resolvedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Fill with placeholders if empty to show the layout */}
          {(!feed?.items || feed.items.length === 0) &&
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full opacity-60"
              >
                <Quote className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-4 transform -scale-x-100" />
                <div className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">
                  Excellent Service
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Great experience using this service. The team was responsive
                  and helped me resolve my issue quickly.
                </p>
                <div className="mt-auto">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    {["Sarah J.", "David M.", "Michael R.", "Jessica K."][
                      n - 1
                    ] || "Happy User"}
                  </div>
                  {(isFree || summary.widgetWatermarkText) && (
                    <div className="text-xs text-slate-500 mb-3">
                      on {summary.widgetWatermarkText || "TrustLens"}
                    </div>
                  )}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-star-custom" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
