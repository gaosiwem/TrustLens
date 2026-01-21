export function extractDomain(email: string): string {
  const parts = email.split("@");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * A simple Jaccard similarity or similar for basic string comparison.
 * In a real scenario, this would use embeddings from the AI module.
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = new Set(str1.toLowerCase().split(/\s+/));
  const s2 = new Set(str2.toLowerCase().split(/\s+/));
  const intersection = new Set([...s1].filter((x) => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

export function computeTemplatedScore(
  current: string,
  history: string[]
): number {
  if (history.length === 0) return 0;
  let maxSim = 0;
  for (const prev of history) {
    const sim = stringSimilarity(current, prev);
    if (sim > maxSim) maxSim = sim;
  }
  return maxSim;
}
