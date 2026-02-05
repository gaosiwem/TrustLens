import { NextResponse } from "next/server";
import { authorizeWidgetEmbed } from "@/lib/widget-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const brand = url.searchParams.get("brand") || "";
  const key = url.searchParams.get("key") || undefined;
  const limit = url.searchParams.get("limit") || "6";

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

  // Fetch from backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    const res = await fetch(
      `${apiUrl}/widgets/resolutions?brandId=${auth.brand.id}&limit=${limit}`,
      {
        cache: "no-store", // cache handled by Next.js route segment config if needed, but here we set headers below
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error("Backend error");
    }

    const payload = {
      ok: true,
      items: data.items,
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
