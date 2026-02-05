-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "category" TEXT DEFAULT 'General';

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "lastRemindedAt" TIMESTAMP(3);
