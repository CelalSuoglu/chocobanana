-- CreateEnum
CREATE TYPE "RewardCodeStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'USED', 'VOID');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "discountAmountCadCents" INTEGER;

-- CreateTable
CREATE TABLE "RewardCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "percentOff" INTEGER NOT NULL DEFAULT 10,
    "status" "RewardCodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "earnedFromOrderId" TEXT NOT NULL,
    "reservedCheckoutSessionId" TEXT,
    "usedOnOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),

    CONSTRAINT "RewardCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_code_key" ON "RewardCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_earnedFromOrderId_key" ON "RewardCode"("earnedFromOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_reservedCheckoutSessionId_key" ON "RewardCode"("reservedCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_usedOnOrderId_key" ON "RewardCode"("usedOnOrderId");

-- CreateIndex
CREATE INDEX "RewardCode_userId_status_idx" ON "RewardCode"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_userId_milestone_key" ON "RewardCode"("userId", "milestone");

-- AddForeignKey
ALTER TABLE "RewardCode" ADD CONSTRAINT "RewardCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCode" ADD CONSTRAINT "RewardCode_earnedFromOrderId_fkey" FOREIGN KEY ("earnedFromOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCode" ADD CONSTRAINT "RewardCode_usedOnOrderId_fkey" FOREIGN KEY ("usedOnOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
