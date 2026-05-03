-- AlterTable: CustomFieldDef - add adminOnly
ALTER TABLE "CustomFieldDef" ADD COLUMN "adminOnly" BOOLEAN NOT NULL DEFAULT false;
