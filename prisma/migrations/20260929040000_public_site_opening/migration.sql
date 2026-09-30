-- CreateTable
CREATE TABLE "PublicSiteOpening" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSiteOpening_pkey" PRIMARY KEY ("id")
);
