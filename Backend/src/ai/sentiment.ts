import { openai } from "../lib/openai.js";
import { SentimentResultSchema } from "./sentiment.schema.js";

export async function inferSentiment(text: string) {
  const model =
    process.env.OPENAI_SENTIMENT_MODEL || process.env.OPENAI_MODEL || "gpt-4o"; // Fallback to gpt-4o if gpt-5.2 is not available

  const instructions = [
    "You are a sentiment and complaint triage classifier for a consumer dispute platform.",
    "Return only JSON that matches the schema exactly.",
    "Be conservative. Do not invent facts.",
    "Topics must be short nouns like billing, delivery, service, fraud, cancellation, claim, refund, support, policy, outage, store, staff.",
  ].join("\n");

  const schema = {
    name: "sentiment_result",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        language: { type: "string" },
        label: {
          type: "string",
          enum: [
            "VERY_NEGATIVE",
            "NEGATIVE",
            "NEUTRAL",
            "POSITIVE",
            "VERY_POSITIVE",
          ],
        },
        score: { type: "number", minimum: -1, maximum: 1 },
        intensity: { type: "number", minimum: 0, maximum: 1 },
        urgency: { type: "integer", minimum: 0, maximum: 100 },
        topics: { type: "array", items: { type: "string" }, maxItems: 10 },
        keyPhrases: { type: "array", items: { type: "string" }, maxItems: 10 },
        summary: { type: "string", minLength: 1, maxLength: 400 },
      },
      required: [
        "label",
        "score",
        "intensity",
        "urgency",
        "topics",
        "keyPhrases",
        "summary",
      ],
    },
  };

  // Using chat completions with structured output as it's more standard in 4.x
  const resp = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: schema,
    },
  });

  const outputText = resp.choices[0].message.content;
  if (!outputText) throw new Error("No output from OpenAI");

  const parsed = JSON.parse(outputText);
  return {
    data: SentimentResultSchema.parse(parsed),
    raw: resp,
    model,
  };
}
