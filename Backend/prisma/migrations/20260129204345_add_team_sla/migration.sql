-- CreateEnum
CREATE TYPE "SLAStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'BREACHED');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "slaDeadline" TIMESTAMP(3),
ADD COLUMN     "slaStatus" "SLAStatus" NOT NULL DEFAULT 'ON_TRACK';

-- CreateTable
CREATE TABLE "BrandSLAConfig" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "lowPriorityHours" INTEGER NOT NULL DEFAULT 48,
    "mediumPriorityHours" INTEGER NOT NULL DEFAULT 24,
    "highPriorityHours" INTEGER NOT NULL DEFAULT 4,
    "criticalPriorityHours" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSLAConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSLAConfig_brandId_key" ON "BrandSLAConfig"("brandId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSLAConfig" ADD CONSTRAINT "BrandSLAConfig_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
