import { extractDomain, computeTemplatedScore } from "./authenticity.utils.js";

export interface AuthenticityInput {
  business: {
    id: string;
    email: string;
    verifiedDomains?: string[];
  };
  response: {
    comment: string;
  };
  history: { comment: string }[];
  reputationScore: number;
}

export class ResponderRiskEngine {
  constructor(private input: AuthenticityInput) {}

  public identityConsistency(): { score: number; meta: any } {
    const emailDomain = extractDomain(this.input.business.email);
    const officialDomains = this.input.business.verifiedDomains || [];

    // If business is verified and has official domains, check for match
    // If not verified, score is higher risk (1.0)
    const domainMatch = officialDomains.includes(emailDomain);
    const score = domainMatch ? 0.0 : 1.0;

    return {
      score,
      meta: {
        emailDomain,
        officialDomains,
        domainMatch,
      },
    };
  }

  public behaviorAnalysis(): { score: number; meta: any } {
    const volume = this.input.history.length;
    const velocityScore = Math.min(volume / 10, 1.0);
    const templatedScore = computeTemplatedScore(
      this.input.response.comment,
      this.input.history.map((h) => h.comment)
    );

    const combined = Math.min((velocityScore + templatedScore) / 2, 1.0);

    return {
      score: combined,
      meta: {
        responseVolume: volume,
        velocityScore,
        templatedScore,
      },
    };
  }

  public languageIntent(): { score: number; meta: any } {
    const text = this.input.response.comment.toLowerCase();
    const flags = {
      threats: text.includes("legal action") || text.includes("sue you"),
      offPlatform:
        text.includes("email me directly") || text.includes("call my personal"),
      blameShift:
        text.includes("your fault") || text.includes("you are responsible"),
    };

    const score =
      Object.values(flags).filter(Boolean).length / Object.keys(flags).length;

    return { score, meta: flags };
  }

  public reputation(): { score: number; meta: any } {
    // Inverse of reputation score (high reputation = low risk)
    const score = 1.0 - this.input.reputationScore;
    return {
      score,
      meta: { historicalReputation: this.input.reputationScore },
    };
  }

  public calculate() {
    const identity = this.identityConsistency();
    const behavior = this.behaviorAnalysis();
    const language = this.languageIntent();
    const rep = this.reputation();

    let composite =
      identity.score * 0.3 +
      behavior.score * 0.25 +
      language.score * 0.25 +
      rep.score * 0.2;

    composite = Math.round(composite * 100 * 100) / 100; // Round to 2 decimal places

    let band: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (composite >= 70) band = "HIGH";
    else if (composite >= 40) band = "MEDIUM";

    return {
      identityScore: identity.score,
      behaviorScore: behavior.score,
      languageScore: language.score,
      reputationScore: rep.score,
      compositeScore: composite,
      riskBand: band,
      ruleBreakdown: {
        identity: identity.meta,
        behavior: behavior.meta,
        language: language.meta,
        reputation: rep.meta,
      },
    };
  }
}
