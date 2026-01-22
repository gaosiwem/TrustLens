export function formatPct(x: number) {
  return `${Math.round((x || 0) * 100)}%`;
}

export function formatScore(x: number) {
  const v = Number.isFinite(x) ? x : 0;
  return v.toFixed(2);
}

export function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function sentimentColorClass(label: string) {
  if (label === "VERY_NEGATIVE" || label === "NEGATIVE")
    return "bg-red-500/15 text-red-500 border-red-500/30";
  if (label === "NEUTRAL")
    return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
  return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
}

export function sentimentLabelPretty(label: string) {
  return label
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}
