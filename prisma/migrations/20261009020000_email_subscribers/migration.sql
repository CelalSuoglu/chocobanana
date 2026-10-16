CREATE TYPE "MailingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

CREATE TABLE "EmailSubscriber" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT,
  "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
  "status" "MailingStatus" NOT NULL DEFAULT 'PENDING',
  "verificationTokenHash" TEXT,
  "unsubscribeTokenHash" TEXT,
  "verificationSentAt" TIMESTAMP(3),
  "verifiedAt" TIMESTAMP(3),
  "welcomeEmailSentAt" TIMESTAMP(3),
  "unsubscribedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailSubscriber_email_key" ON "EmailSubscriber"("email");
CREATE UNIQUE INDEX "EmailSubscriber_verificationTokenHash_key" ON "EmailSubscriber"("verificationTokenHash");
CREATE UNIQUE INDEX "EmailSubscriber_unsubscribeTokenHash_key" ON "EmailSubscriber"("unsubscribeTokenHash");
CREATE INDEX "EmailSubscriber_createdAt_idx" ON "EmailSubscriber"("createdAt");
CREATE INDEX "EmailSubscriber_status_idx" ON "EmailSubscriber"("status");
