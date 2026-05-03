-- AlterTable: Submission - remove quantity/unitPrice, add brand
ALTER TABLE "Submission" DROP COLUMN "quantity";
ALTER TABLE "Submission" DROP COLUMN "unitPrice";
ALTER TABLE "Submission" ADD COLUMN "brand" TEXT;

-- AlterTable: Archive - remove quantity/unitPrice, add brand
ALTER TABLE "Archive" DROP COLUMN "quantity";
ALTER TABLE "Archive" DROP COLUMN "unitPrice";
ALTER TABLE "Archive" ADD COLUMN "brand" TEXT;
