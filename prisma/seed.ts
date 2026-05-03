import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const skus = [
    { sku: "SKU-001", description: "Widget A", category: "Electronics", unit: "pcs" },
    { sku: "SKU-002", description: "Widget B", category: "Electronics", unit: "pcs" },
    { sku: "SKU-003", description: "Gadget C", category: "Accessories", unit: "box" },
    { sku: "SKU-004", description: "Component D", category: "Parts", unit: "set" },
    { sku: "SKU-005", description: "Tool E", category: "Equipment", unit: "unit" },
  ];
  for (const s of skus) {
    await prisma.skuMaster.upsert({
      where: { sku: s.sku },
      update: {},
      create: s,
    });
  }

  const sites = [
    { siteCode: "SITE-HK-01", siteName: "Hong Kong Central", region: "HK", address: "123 Central Rd", contact: "info@hk-central.com" },
    { siteCode: "SITE-HK-02", siteName: "Hong Kong TST", region: "HK", address: "456 Nathan Rd", contact: "info@hk-tst.com" },
    { siteCode: "SITE-TW-01", siteName: "Taipei Main", region: "TW", address: "789 Zhongshan Rd", contact: "info@tw-main.com" },
    { siteCode: "SITE-SG-01", siteName: "Singapore Central", region: "SG", address: "321 Orchard Rd", contact: "info@sg-central.com" },
  ];
  for (const s of sites) {
    await prisma.siteMaster.upsert({
      where: { siteCode: s.siteCode },
      update: {},
      create: s,
    });
  }

  const customFields = [
    { name: "rpType", label: "RP Type", type: "select", options: JSON.stringify(["New", "Change", "Cancel"]), required: false, sortOrder: 1 },
    { name: "supplySource", label: "Supply Source", type: "text", required: false, sortOrder: 2 },
    { name: "safetyStock", label: "Safety Stock", type: "number", required: false, sortOrder: 3 },
    { name: "ndCode", label: "ND Code", type: "text", required: false, sortOrder: 4 },
    { name: "rpParamsChange", label: "RP Parameters Change Request", type: "text", required: false, sortOrder: 5 },
    { name: "replyDate", label: "Reply Completion Date", type: "date", required: false, sortOrder: 6 },
  ];
  for (const cf of customFields) {
    await prisma.customFieldDef.upsert({
      where: { name: cf.name },
      update: {},
      create: cf as any,
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
