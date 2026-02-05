import { NextResponse } from "next/server";
import { authorizeWidgetEmbed, parseTheme } from "@/lib/widget-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brand = url.searchParams.get("brand") || "";
  const key = url.searchParams.get("key") || undefined;
  const theme = parseTheme(url.searchParams.get("theme"));
  const location = url.searchParams.get("location") || "all";

  const auth = await authorizeWidgetEmbed({
    brandSlug: brand,
    widgetKey: key,
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });

  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, reason: auth.reason },
      { status: 403 },
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    const res = await fetch(
      `${apiUrl}/widgets/metrics?brandId=${auth.brand.id}&location=${location}`,
      {
        cache: "no-store",
      },
    );
    const data = await res.json();

    if (!res.ok) throw new Error("Backend fetch failed");

    const payload = {
      ok: true,
      theme,
      plan: auth.brand.widgetPlan,
      showWatermark: auth.showWatermark,
      brand: {
        name: auth.brand.name,
        slug: auth.brand.slug,
      },
      kpis: data.kpis,
      trend: data.trend,
      locations: auth.isPremium
        ? auth.brand.locations.map((l: any) => ({ name: l.name, slug: l.slug }))
        : [],
    };

    const response = NextResponse.json(payload);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=600",
    );
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
