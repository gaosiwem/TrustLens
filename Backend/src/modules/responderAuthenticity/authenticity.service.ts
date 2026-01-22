import prisma from "../../lib/prisma.js";
import {
  ResponderRiskEngine,
  type AuthenticityInput,
} from "./authenticity.engine.js";

export async function evaluateAuthenticity(params: {
  responseId: string;
  businessUserId: string;
  comment: string;
  tx?: any;
}) {
  const client = params.tx || prisma;
  // 1. Fetch business details
  const user = await client.user.findUnique({
    where: { id: params.businessUserId },
    include: { managedBrands: true },
  });

  if (!user) throw new Error("User not found");

  // 2. Fetch history
  const history = await client.followup.findMany({
    where: { userId: params.businessUserId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { comment: true },
  });

  // 3. Fetch reputation score
  // We assume the brand is the first managed brand for simplicity in this context
  const brandId = user.managedBrands[0]?.id;
  let reputationScore = 0.5;
  if (brandId) {
    const rs = await client.reputationScore.findUnique({ where: { brandId } });
    if (rs) reputationScore = rs.score;
  }

  const input: AuthenticityInput = {
    business: {
      id: user.id,
      email: user.email,
      // In a more complex system, we would have verified domains in the brand model
      verifiedDomains: [],
    },
    response: {
      comment: params.comment,
    },
    history,
    reputationScore,
  };

  const engine = new ResponderRiskEngine(input);
  const result = engine.calculate();

  // 4. Persist
  return client.responderAuthenticityScore.create({
    data: {
      responseId: params.responseId,
      businessUserId: params.businessUserId,
      identityScore: result.identityScore,
      behaviorScore: result.behaviorScore,
      languageScore: result.languageScore,
      reputationScore: result.reputationScore,
      compositeScore: result.compositeScore,
      riskBand: result.riskBand,
      ruleBreakdown: result.ruleBreakdown as any,
    },
  });
}

export async function getAuthenticityScoreByResponse(
  responseId: string,
  tx?: any,
) {
  const client = tx || prisma;
  return client.responderAuthenticityScore.findUnique({
    where: { responseId },
  });
}
