import { z } from "zod";

export const SentimentResultSchema = z.object({
  language: z.string().min(2).max(12).optional(),
  label: z.enum([
    "VERY_NEGATIVE",
    "NEGATIVE",
    "NEUTRAL",
    "POSITIVE",
    "VERY_POSITIVE",
  ]),
  score: z.number().min(-1).max(1),
  intensity: z.number().min(0).max(1),
  urgency: z.number().int().min(0).max(100),
  topics: z.array(z.string().min(1).max(64)).max(10),
  keyPhrases: z.array(z.string().min(1).max(64)).max(10),
  summary: z.string().min(1).max(400),
});

export type SentimentResult = z.infer<typeof SentimentResultSchema>;
