-- AlterTable
ALTER TABLE "RewardCode" ADD COLUMN "shared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RewardCode" ADD COLUMN "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RewardCodeRedemption" (
    "id" TEXT NOT NULL,
    "rewardCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RewardCodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reservedCheckoutSessionId" TEXT,
    "usedOnOrderId" TEXT,
    "reservedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "RewardCodeRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardCodeRedemption_reservedCheckoutSessionId_key" ON "RewardCodeRedemption"("reservedCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCodeRedemption_usedOnOrderId_key" ON "RewardCodeRedemption"("usedOnOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCodeRedemption_rewardCodeId_userId_key" ON "RewardCodeRedemption"("rewardCodeId", "userId");

-- CreateIndex
CREATE INDEX "RewardCodeRedemption_rewardCodeId_status_idx" ON "RewardCodeRedemption"("rewardCodeId", "status");

-- AddForeignKey
ALTER TABLE "RewardCodeRedemption" ADD CONSTRAINT "RewardCodeRedemption_rewardCodeId_fkey" FOREIGN KEY ("rewardCodeId") REFERENCES "RewardCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCodeRedemption" ADD CONSTRAINT "RewardCodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHOCO10 is a first-order code for every customer account.
UPDATE "RewardCode"
SET
    "shared" = true,
    "firstOrderOnly" = true,
    "status" = 'AVAILABLE',
    "reservedAt" = NULL,
    "reservedCheckoutSessionId" = NULL
WHERE "code" = 'CHOCO10';
