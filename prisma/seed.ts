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
    { name: "ndCode", label: "ND Code", type: "select", options: JSON.stringify([
      "ND00-Default SKU ND status when created",
      "ND01-Under ND Classification",
      "ND10-CMPD-Not assigned to specific store",
      "ND11-CMPD-Seasona item(Winter)",
      "ND12-CMPD-Seasona item(Summer)",
      "ND13-CMPD-Non Active SKU",
      "ND14-CMPD-One-time purchase",
      "ND20-SO-Not displayed in small stores",
      "ND21-SO-Seasonal item(Winter)",
      "ND22-SO-Seasonal item(Summer)",
      "ND23-SO-Due to OM/SUP reason",
      "ND29-SO-Optimized SKU(Specific store)",
      "ND30-Legal & Regulatory Restrictions",
      "ND31-Hazardous Goods",
      "ND32-Health Products-Macau",
      "ND33-Outlets",
      "ND34-Health Products-HK",
      "ND35-SSDC Exclusive",
      "ND40-Product Issue-Quality",
      "ND41-Product Issue-Label",
      "ND50-Vendor Return",
    ]), required: false, sortOrder: 4 },
    { name: "rpParamsChange", label: "RP Parameters Change Request", type: "text", required: false, sortOrder: 5 },
    { name: "replyCompletionDate", label: "RP Type Reply Completion Date", type: "date", required: false, adminOnly: true, sortOrder: 6 },
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
