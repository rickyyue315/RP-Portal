-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PROCESSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateTable
CREATE TABLE "CustomFieldDef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDef_name_key" ON "CustomFieldDef"("name");

-- CreateTable
CREATE TABLE "SkuMaster" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkuMaster_sku_key" ON "SkuMaster"("sku");

-- CreateIndex
CREATE INDEX "SkuMaster_sku_idx" ON "SkuMaster"("sku");

-- CreateTable
CREATE TABLE "SiteMaster" (
    "id" TEXT NOT NULL,
    "siteCode" TEXT NOT NULL,
    "siteName" TEXT,
    "region" TEXT,
    "address" TEXT,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteMaster_siteCode_key" ON "SiteMaster"("siteCode");

-- CreateIndex
CREATE INDEX "SiteMaster_siteCode_idx" ON "SiteMaster"("siteCode");

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "siteCode" TEXT NOT NULL,
    "quantity" INTEGER,
    "unitPrice" DECIMAL(12, 2),
    "remarks" TEXT,
    "customFields" JSONB,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedById" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_sku_idx" ON "Submission"("sku");

-- CreateIndex
CREATE INDEX "Submission_siteCode_idx" ON "Submission"("siteCode");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "siteCode" TEXT NOT NULL,
    "quantity" INTEGER,
    "unitPrice" DECIMAL(12, 2),
    "remarks" TEXT,
    "customFields" JSONB,
    "status" "SubmissionStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Archive_submittedAt_idx" ON "Archive"("submittedAt");

-- CreateIndex
CREATE INDEX "Archive_archivedAt_idx" ON "Archive"("archivedAt");