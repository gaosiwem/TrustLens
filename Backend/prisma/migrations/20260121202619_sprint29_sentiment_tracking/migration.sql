-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('VERY_NEGATIVE', 'NEGATIVE', 'NEUTRAL', 'POSITIVE', 'VERY_POSITIVE');

-- CreateEnum
CREATE TYPE "SentimentSourceType" AS ENUM ('COMPLAINT', 'BRAND_RESPONSE', 'CONSUMER_MESSAGE', 'SYSTEM_NOTE');

-- CreateTable
CREATE TABLE "SentimentEvent" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "complaintId" TEXT,
    "sourceType" "SentimentSourceType" NOT NULL,
    "sourceId" TEXT,
    "textHash" TEXT NOT NULL,
    "language" TEXT,
    "label" "SentimentLabel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL,
    "urgency" INTEGER NOT NULL,
    "topics" TEXT[],
    "keyPhrases" TEXT[],
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "moderationFlagged" BOOLEAN NOT NULL DEFAULT false,
    "moderationRaw" JSONB,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentimentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandSentimentDaily" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "avgScore" DOUBLE PRECISION NOT NULL,
    "avgUrgency" DOUBLE PRECISION NOT NULL,
    "positivePct" DOUBLE PRECISION NOT NULL,
    "negativePct" DOUBLE PRECISION NOT NULL,
    "neutralPct" DOUBLE PRECISION NOT NULL,
    "topTopics" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSentimentDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintSentimentSnapshot" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lastEventAt" TIMESTAMP(3) NOT NULL,
    "currentLabel" "SentimentLabel" NOT NULL,
    "currentScore" DOUBLE PRECISION NOT NULL,
    "currentUrgency" INTEGER NOT NULL,
    "topics" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintSentimentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentimentEvent_brandId_idx" ON "SentimentEvent"("brandId");

-- CreateIndex
CREATE INDEX "SentimentEvent_complaintId_idx" ON "SentimentEvent"("complaintId");

-- CreateIndex
CREATE INDEX "SentimentEvent_sourceId_idx" ON "SentimentEvent"("sourceId");

-- CreateIndex
CREATE INDEX "SentimentEvent_textHash_idx" ON "SentimentEvent"("textHash");

-- CreateIndex
CREATE INDEX "SentimentEvent_brandId_createdAt_idx" ON "SentimentEvent"("brandId", "createdAt");

-- CreateIndex
CREATE INDEX "BrandSentimentDaily_brandId_idx" ON "BrandSentimentDaily"("brandId");

-- CreateIndex
CREATE INDEX "BrandSentimentDaily_day_idx" ON "BrandSentimentDaily"("day");

-- CreateIndex
CREATE UNIQUE INDEX "BrandSentimentDaily_brandId_day_key" ON "BrandSentimentDaily"("brandId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintSentimentSnapshot_complaintId_key" ON "ComplaintSentimentSnapshot"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintSentimentSnapshot_brandId_idx" ON "ComplaintSentimentSnapshot"("brandId");
