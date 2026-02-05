import { z } from "zod";

const AllowedTheme = z.enum(["light", "dark"]);
export type WidgetTheme = z.infer<typeof AllowedTheme>;

export function parseTheme(input: unknown): WidgetTheme {
  const t = typeof input === "string" ? input : "light";
  return AllowedTheme.safeParse(t).success ? (t as WidgetTheme) : "light";
}

export async function authorizeWidgetEmbed(params: {
  brandSlug: string;
  widgetKey?: string;
  referer?: string | null;
  origin?: string | null;
}) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    const res = await fetch(`${apiUrl}/widgets/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandSlug: params.brandSlug,
        widgetKey: params.widgetKey,
        referer: params.referer,
        origin: params.origin,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return {
        ok: false as const,
        reason: (data.reason || "internal_error") as string,
      };
    }

    return {
      ok: true as const,
      brand: data.brand,
      isPremium: data.isPremium,
      showWatermark: data.showWatermark,
      widgetWatermarkText: data.brand?.widgetWatermarkText, // Add custom text
    };
  } catch (error) {
    console.error("Widget authorization failed:", error);
    return { ok: false as const, reason: "internal_error" as const };
  }
}
