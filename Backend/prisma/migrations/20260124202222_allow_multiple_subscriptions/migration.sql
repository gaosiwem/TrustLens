/*
  Warnings:

  - A unique constraint covering the columns `[brandId,planId]` on the table `BrandSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BrandSubscription_brandId_key";

-- CreateIndex
CREATE UNIQUE INDEX "BrandSubscription_brandId_planId_key" ON "BrandSubscription"("brandId", "planId");
