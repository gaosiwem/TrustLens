import { OpenAIProvider } from "./openai.provider.js";

const provider = new OpenAIProvider();

export async function rewriteComplaint(
  brandName: string,
  text: string,
  userName?: string,
  userEmail?: string
): Promise<string> {
  try {
    const response = await provider.refineComplaint(
      brandName,
      text,
      userName,
      userEmail
    );

    // If response is empty or too short, return original
    if (!response || response.length < 20) {
      return text;
    }

    return response;
  } catch (error) {
    console.error("AI rewrite failed:", error);
    // Fallback to original text if AI fails
    return text;
  }
}
