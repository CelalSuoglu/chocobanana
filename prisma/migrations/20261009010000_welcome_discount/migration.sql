ALTER TABLE "User" ADD COLUMN "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "welcomeEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "welcomeDiscountUsedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "welcomeReservedSessionId" TEXT;

CREATE UNIQUE INDEX "User_welcomeReservedSessionId_key" ON "User"("welcomeReservedSessionId");

ALTER TABLE "Order" ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);
