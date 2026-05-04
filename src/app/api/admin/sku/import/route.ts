import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseCsvToSkuRows, parseExcelToSkuRows } from "@/lib/csv";

const skuRowSchema = z.object({
  sku: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let rows;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        rows = await parseExcelToSkuRows(buffer);
      } else {
        const text = await file.text();
        rows = await parseCsvToSkuRows(text);
      }
    } else {
      const body = await req.json();
      rows = z.array(skuRowSchema).parse(body.rows);
    }

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        await prisma.skuMaster.upsert({
          where: { sku: row.sku },
          update: {
            description: row.description,
            category: row.category,
            unit: row.unit,
          },
          create: {
            sku: row.sku,
            description: row.description,
            category: row.category,
            unit: row.unit,
          },
        });
        results.created++;
      } catch {
        results.errors.push(`Failed to import SKU: ${row.sku}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
