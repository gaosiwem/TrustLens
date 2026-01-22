import { openai } from "../lib/openai.js";

export async function moderateText(input: string) {
  const model = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";

  const res = await openai.moderations.create({
    model,
    input,
  });

  const result = res.results?.[0];
  const flagged = Boolean(result?.flagged);

  return {
    flagged,
    raw: res,
  };
}
