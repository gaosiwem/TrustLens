"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LocationSelector({
  locations,
}: {
  locations: Array<{ name: string; slug: string }>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const current = params.get("location") || "all";

  const options = useMemo(() => {
    return [{ name: "All locations", slug: "all" }, ...locations];
  }, [locations]);

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        next.set("location", e.target.value);
        router.replace(`?${next.toString()}`);
      }}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
