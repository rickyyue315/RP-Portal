import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateExcel } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "daily";
  const month = searchParams.get("month");

  let startDate: Date, endDate: Date;
  const now = new Date();

  if (type === "monthly" && month) {
    const [y, m] = month.split("-").map(Number);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0, 23, 59, 59);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  }

  const submissions = await prisma.submission.findMany({
    where: { submittedAt: { gte: startDate, lte: endDate } },
    include: { user: { select: { name: true } } },
    orderBy: { submittedAt: "asc" },
  });

  const exportData = submissions.map((s) => ({
    id: s.id,
    sku: s.sku,
    siteCode: s.siteCode,
    brand: s.brand,
    remarks: s.remarks,
    status: s.status,
    submittedAt: s.submittedAt,
    updatedAt: s.updatedAt,
    userName: s.user.name,
    processedAt: s.processedAt,
    customFields: s.customFields as Record<string, unknown> | null,
  }));

  const buffer = await generateExcel(exportData);

  const filename =
    type === "monthly"
      ? `NDRF_Export_${month}.xlsx`
      : `NDRF_Export_${now.toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
