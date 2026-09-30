-- AlterTable
ALTER TABLE "RewardCode" ALTER COLUMN "earnedFromOrderId" DROP NOT NULL;
ALTER TABLE "RewardCode" ADD COLUMN "manual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RewardCode" ADD COLUMN "stripePromotionCodeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_stripePromotionCodeId_key" ON "RewardCode"("stripePromotionCodeId");
