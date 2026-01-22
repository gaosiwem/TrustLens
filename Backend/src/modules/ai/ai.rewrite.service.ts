import { OpenAIProvider } from "./openai.provider.js";

const provider = new OpenAIProvider();

export async function rewriteComplaint(
  brandName: string,
  text: string,
  userName?: string,
  userEmail?: string,
): Promise<string | null> {
  try {
    const response = await provider.refineComplaint(
      brandName,
      text,
      userName,
      userEmail,
    );

    // If response is empty or too short, return null
    if (!response || response.length < 50) {
      return null;
    }

    return response;
  } catch (error) {
    console.error("AI rewrite failed:", error);
    // Fallback to null so we don't store redundant data
    return null;
  }
}
