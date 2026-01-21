-- CreateEnum
CREATE TYPE "BrandClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INFO_REQUESTED');

-- CreateTable
CREATE TABLE "BrandClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "BrandClaimStatus" NOT NULL DEFAULT 'PENDING',
    "aiScore" INTEGER,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandClaim_pkey" PRIMARY KEY ("id")
);
