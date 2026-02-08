import OpenAI from "openai";
import { ENV } from "../config/env.js";
import logger from "../config/logger.js";

const apiKey = ENV.OPENAI_API_KEY || "dummy-key";

if (!ENV.OPENAI_API_KEY) {
  logger.warn(
    "OPENAI_API_KEY is missing or empty. OpenAI features will not work.",
  );
}

export const openai = new OpenAI({
  apiKey,
});
