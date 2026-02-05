import WidgetShell from "../_shared/widget-shell";
import ReputationSummaryWidget from "./reputation-summary-widget";
import { parseTheme, authorizeWidgetEmbed } from "@/lib/widget-auth";

export const dynamic = "force-dynamic";

export default async function ReputationSummaryPage(props: {
  searchParams: Promise<{
    brand?: string;
    theme?: string;
    key?: string;
    location?: string;
    limit?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const brandSlug = searchParams.brand || "";
  const theme = parseTheme(searchParams.theme);
  const key = searchParams.key;
  const location = searchParams.location || "all";
  const limit = Math.min(
    Math.max(parseInt(searchParams.limit || "6", 10), 1),
    10,
  );

  let summary = null;
  let feed = null;
  let errorReason: string | undefined = undefined;
  let showWatermark = true;
  let widgetWatermarkText: string | undefined = undefined;

  try {
    // 1. Authorize
    const auth = await authorizeWidgetEmbed({
      brandSlug,
      widgetKey: key,
      // Note: Referer/Origin headers are hard to get in Server Components compared to API routes
      // But usually we can get them from headers()
    });

    if (!auth.ok) {
      errorReason = auth.reason;
    } else {
      showWatermark = auth.showWatermark;
      widgetWatermarkText = auth.widgetWatermarkText;

      // 2. Fetch Data provided we are auth'd
      // We can fetch directly from backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

      const [metricsRes, resolutionsRes] = await Promise.all([
        fetch(
          `${apiUrl}/widgets/metrics?brandId=${auth.brand.id}&location=${location}`,
          { cache: "no-store" },
        ),
        fetch(
          `${apiUrl}/widgets/resolutions?brandId=${auth.brand.id}&limit=${limit}`,
          { cache: "no-store" },
        ),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        summary = {
          ok: true,
          theme,
          plan: auth.brand.widgetPlan,
          showWatermark: auth.showWatermark,
          widgetWatermarkText: auth.widgetWatermarkText, // Add this
          brand: {
            name: auth.brand.name,
            slug: auth.brand.slug,
          },
          kpis: metricsData.kpis,
          trend: metricsData.trend,
          locations: auth.isPremium
            ? auth.brand.locations.map((l: any) => ({
                name: l.name,
                slug: l.slug,
              }))
            : [],
        };
        // @ts-ignore
        summary.widgetStyles = auth.brand.widgetStyles;
      }

      if (resolutionsRes.ok) {
        const resData = await resolutionsRes.json();
        feed = {
          ok: true,
          items: resData.items,
        };
      }
    }
  } catch (err) {
    console.error("Widget page fetch error:", err);
    errorReason = "internal_error";
  }

  const ok = !errorReason && !!summary;

  return (
    <WidgetShell
      ok={ok}
      reason={errorReason}
      theme={theme}
      showWatermark={showWatermark}
      widgetWatermarkText={widgetWatermarkText}
      brandSlug={summary?.brand?.slug}
    >
      {ok && <ReputationSummaryWidget summary={summary} feed={feed} />}
    </WidgetShell>
  );
}
