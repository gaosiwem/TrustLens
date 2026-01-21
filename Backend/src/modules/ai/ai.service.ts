import { OpenAIProvider } from "./openai.provider.js";
import logger from "../../config/logger.js";

const provider = new OpenAIProvider();

export async function analyzeComplaint(text: string) {
  logger.info("AI analysis initiated for complaint text", {
    textLength: text.length,
  });

  try {
    const [summary, sentiment] = await Promise.all([
      provider.summarize(text),
      provider.sentiment(text),
    ]);

    logger.info("AI analysis completed successfully", { sentiment });
    return { summary, sentiment };
  } catch (error) {
    logger.error("AI analysis failed", {
      error,
      textSnippet: text.substring(0, 100),
    });
    throw error;
  }
}

export async function evaluateBrandClaimScore(
  brandName: string,
  email: string,
  documentNames: string[]
) {
  logger.info("Evaluating brand claim confidence score", {
    brandName,
    email,
    docCount: documentNames.length,
  });

  try {
    const score = await provider.evaluateBrandClaim(
      brandName,
      email,
      documentNames
    );
    logger.info("Brand claim evaluation completed", { score });
    return score;
  } catch (error) {
    logger.error("Brand claim evaluation failed", { error });
    return 50; // Fallback
  }
}
