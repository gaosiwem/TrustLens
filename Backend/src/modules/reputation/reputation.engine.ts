export function computeScore(
  reviews: number,
  avg: number,
  platformMean: number,
  confidence: number,
  resolutionRate: number
) {
  // Bayesian average: (v*R + m*C) / (v+m)
  // v: number of reviews
  // R: average rating
  // m: confidence (prior weight)
  // C: platform mean

  const bayesian =
    (reviews * avg + confidence * platformMean) / (reviews + confidence);

  // Bonus/penalty based on resolution rate
  return bayesian * (1 + resolutionRate);
}
