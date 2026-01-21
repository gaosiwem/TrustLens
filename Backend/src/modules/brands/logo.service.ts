import { OpenAIProvider } from "../ai/openai.provider.js";
import logger from "../../config/logger.js";

const aiProvider = new OpenAIProvider();

export async function findBrandLogo(
  brandName: string,
  hintDomain?: string
): Promise<string | null> {
  try {
    logger.info(`Attempting to find logo for brand: ${brandName}`);

    // Step 1: Use AI to guess the official domain
    const domain = await aiProvider.getBrandDomain(brandName, hintDomain);

    if (!domain) {
      logger.warn(`Could not resolve domain for brand: ${brandName}`);
      return null;
    }

    // Step 2: Construct a Google Favicon URL based on the domain (sz=256 for high res)
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

    logger.info(`Resolved logo URL for ${brandName}: ${logoUrl}`);
    return logoUrl;
  } catch (error) {
    logger.error(`Error in findBrandLogo for ${brandName}:`, error);
    return null;
  }
}
