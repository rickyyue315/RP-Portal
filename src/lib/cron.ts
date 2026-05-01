import cron from "node-cron";
import { prisma } from "./prisma";

export function startCronJobs() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[CRON] Starting daily archive cleanup...");

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    try {
      const oldSubmissions = await prisma.submission.findMany({
        where: { submittedAt: { lt: oneYearAgo } },
      });

      if (oldSubmissions.length === 0) {
        console.log("[CRON] No records to archive.");
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.archive.createMany({
          data: oldSubmissions.map((s) => ({
            originalId: s.id,
            userId: s.userId,
            sku: s.sku,
            siteCode: s.siteCode,
            quantity: s.quantity,
            unitPrice: s.unitPrice,
            remarks: s.remarks,
            customFields: s.customFields as any,
            status: s.status,
            submittedAt: s.submittedAt,
            updatedAt: s.updatedAt,
            processedAt: s.processedAt,
          })) as any,
        });

        const { count } = await tx.submission.deleteMany({
          where: { id: { in: oldSubmissions.map((s) => s.id) } },
        });

        console.log(`[CRON] Archived ${count} records.`);
      });
    } catch (error) {
      console.error("[CRON] Archive error:", error);
    }
  });

  console.log("[CRON] Jobs scheduled.");
}
