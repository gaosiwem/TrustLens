import OpenAI from "openai";
import type { AIProvider } from "./ai.provider.js";
import { AI_CONFIG } from "../../config/ai.js";
import { ENV } from "../../config/env.js";

const apiKey = ENV.OPENAI_API_KEY;
// Only instantiate if key is present to avoid errors
const client = apiKey ? new OpenAI({ apiKey }) : null;

export class OpenAIProvider implements AIProvider {
  async summarize(text: string) {
    if (!client) {
      console.warn("[OpenAI] API Key missing. Skipping summarization.");
      return "";
    }
    try {
      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: `Summarize neutrally:\n${text}` }],
        max_tokens: AI_CONFIG.maxTokens,
      });
      return res.choices[0]?.message.content || "";
    } catch (err) {
      console.error("[OpenAI] Summarize failed:", err);
      return "";
    }
  }

  async sentiment(text: string) {
    if (!client) {
      console.warn("[OpenAI] API Key missing. Skipping sentiment analysis.");
      return 0;
    }
    try {
      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: "user", content: `Return sentiment score -1 to 1:\n${text}` },
        ],
        max_tokens: 10,
      });
      const val = parseFloat(res.choices[0]?.message.content || "0");
      return isNaN(val) ? 0 : val;
    } catch (err) {
      console.error("[OpenAI] Sentiment failed:", err);
      return 0;
    }
  }

  async getBrandDomain(
    brandName: string,
    hintDomain?: string,
  ): Promise<string | null> {
    if (!client) {
      console.warn(
        "[OpenAI] API Key missing. Skipping brand domain resolution.",
      );
      return null;
    }
    try {
      const hintMsg = hintDomain
        ? ` (Hint: the brand might be associated with the domain '${hintDomain}')`
        : "";
      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that identifies official websites for brands. You must provide the MOST ACCURATE official domain. If a domain hint is provided and it is a valid official domain for the brand (especially regional TLDs like .co.za or .uk), you MUST prioritize it over a generic .com. Respond ONLY with the domain name (e.g., apple.com, vodacom.co.za). If unknown, respond with 'null'.",
          },
          {
            role: "user",
            content: `What is the official domain for: ${brandName}${hintMsg}`,
          },
        ],
        max_tokens: 20,
      });
      const content = res.choices[0]?.message.content;
      console.log(
        `[OpenAI Debug] Brand: ${brandName}, Hint: ${hintDomain}, RAW: "${content}"`,
      );
      const domain = content
        ? content.replace(/['"`]/g, "").trim().toLowerCase()
        : null;
      console.log(`[OpenAI] Resolved domain for ${brandName}: ${domain}`);
      return domain === "null" || !domain ? null : domain;
    } catch (err) {
      console.error("[OpenAI] Brand domain resolution failed:", err);
      return null;
    }
  }

  async evaluateBrandClaim(
    brandName: string,
    email: string,
    documentNames: string[],
  ): Promise<number> {
    if (!client) {
      console.warn(
        "[OpenAI] API Key missing. Skipping brand claim evaluation.",
      );
      return 50; // Neutral default
    }

    try {
      const prompt = `
        Evaluate the legitimacy of a brand ownership claim.
        Brand Name: ${brandName}
        Applicant Email: ${email}
        Submitted Documents (filenames): ${documentNames.join(", ") || "None"}

        Rules:
        1. If the email domain clearly matches the brand's official domain (e.g., @apple.com for Apple), assign a high score (80-100).
        2. If documents look like official legal or tax documents (e.g., certificate_of_incorporation.pdf, trademark_reg.jpg), significantly increase the confidence score.
        3. For generic emails (gmail, outlook, etc.), evaluate legitimacy primarily based on the Brand Name and provided documents. Do not penalize purely for being a personal email if other evidence is present.
        4. If there's a clear mismatch (e.g., claiming a major brand with no supporting evidence), score should be low (0-30).

        Respond ONLY with a single integer between 0 and 100 representing the confidence score.
      `;

      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 5,
        temperature: 0.3,
      });

      const score = parseInt(res.choices[0]?.message.content || "50");
      return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
    } catch (err) {
      console.error("[OpenAI] Brand claim evaluation failed:", err);
      return 50;
    }
  }

  async refineComplaint(
    brandName: string,
    text: string,
    userName?: string,
    userEmail?: string,
  ): Promise<string | null> {
    if (!client) {
      console.warn("[OpenAI] API Key missing. Skipping AI summary generation.");
      return null;
    }
    try {
      const userRef = userName || "the Customer";
      const contactRef = userEmail || "the registered email";

      const prompt = `
        You are an AI Analyst for TrustLens, a consumer protection and brand reputation platform.
        Transform the following customer complaint for the brand "${brandName}" into an "Intelligent Synthesis."
        
        GOAL:
        Provide a concise, neutral, and professional overview that clarifies the core dispute, the impact on the customer, and the implicit or explicit resolution requested.
        
        CRITICAL RULES:
        1. DO NOT simply rewrite the text. SYNTHESIZE the key points.
        2. Format with a clear "Subject: " line first.
        3. Use a formal header: "Internal Synthesis for ${brandName} Management"
        4. Use professional, objective language. Avoid emotional or hyperbolic terms unless they are central to the complaint's facts.
        5. Structure the output into:
           - Core Issue: (What happened)
           - Impact: (How it affected the customer)
           - Desired Outcome: (What the customer wants)
        6. DO NOT use placeholders like "[Name]" or "[Date]". If info is missing, omit it.
        7. Maintain anonymity of the consumer (refer to them as "${userRef}").
        8. Correct grammatical errors silently.
        
        Original complaint text:
        "${text}"
        
        Intelligent Synthesis:
      `;

      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: 0.7,
      });

      const aiResponse = res.choices[0]?.message.content;
      if (!aiResponse || aiResponse.length < 50) {
        console.warn("[OpenAI] AI response was empty or too short.");
        return null;
      }
      return aiResponse;
    } catch (err) {
      console.error("[OpenAI] Refine complaint failed:", err);
      return null;
    }
  }

  async analyzeRootCause(
    brandName: string,
    topic: string,
    complaintContext: string,
  ): Promise<{ cause: string; impact: string; fix: string } | null> {
    if (!client) return null;
    try {
      const prompt = `
        Analyze this cluster of complaints for "${brandName}" regarding the topic "${topic}".
        
        CONTEXT:
        ${complaintContext}
        
        GOAL:
        1. Identify the likely systemic "Root Cause" of these issues.
        2. Estimate the "Impact" on brand reputation (e.g., trust erosion, customer churn).
        3. Recommend a permanent "Systemic Fix" to prevent recurrence.
        
        RESPONSE FORMAT (JSON):
        {
          "cause": "Concise description of the institutional or process failure",
          "impact": "Brief explanation of the long-term risk",
          "fix": "Specific operational or strategic recommendation"
        }
      `;

      const res = await client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = res.choices[0]?.message.content;
      if (!content) return null;
      return JSON.parse(content);
    } catch (err) {
      console.error("[OpenAI] Root cause analysis failed:", err);
      return null;
    }
  }
}
