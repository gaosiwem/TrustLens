export type BrandSentimentDailyRow = {
  id: string;
  brandId: string;
  day: string;
  count: number;
  avgScore: number;
  avgUrgency: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  avgStars: number | null;
  topTopics: string[];
  updatedAt: string;
};

export type SentimentEvent = {
  id: string;
  brandId: string;
  complaintId: string | null;
  sourceType:
    | "COMPLAINT"
    | "BRAND_RESPONSE"
    | "CONSUMER_MESSAGE"
    | "SYSTEM_NOTE"
    | "RATING";
  sourceId: string | null;
  label:
    | "VERY_NEGATIVE"
    | "NEGATIVE"
    | "NEUTRAL"
    | "POSITIVE"
    | "VERY_POSITIVE";
  score: number;
  intensity: number;
  urgency: number;
  topics: string[];
  keyPhrases: string[];
  createdAt: string;
  model: string;
  moderationFlagged: boolean;
  rating?: {
    id: string;
    stars: number;
    comment: string | null;
  } | null;
};

export type ComplaintSentimentSnapshot = {
  complaintId: string;
  brandId: string;
  lastEventAt: string;
  currentLabel:
    | "VERY_NEGATIVE"
    | "NEGATIVE"
    | "NEUTRAL"
    | "POSITIVE"
    | "VERY_POSITIVE";
  currentScore: number;
  currentUrgency: number;
  topics: string[];
  updatedAt: string;
} | null;
