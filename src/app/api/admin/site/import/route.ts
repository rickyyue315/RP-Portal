import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseCsvToSiteRows, parseExcelToSiteRows } from "@/lib/csv";

const siteRowSchema = z.object({
  siteCode: z.string().min(1),
  siteName: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
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
        rows = await parseExcelToSiteRows(buffer);
      } else {
        const text = await file.text();
        rows = await parseCsvToSiteRows(text);
      }
    } else {
      const body = await req.json();
      rows = z.array(siteRowSchema).parse(body.rows);
    }

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        await prisma.siteMaster.upsert({
          where: { siteCode: row.siteCode },
          update: {
            siteName: row.siteName,
            region: row.region,
            address: row.address,
            contact: row.contact,
          },
          create: {
            siteCode: row.siteCode,
            siteName: row.siteName,
            region: row.region,
            address: row.address,
            contact: row.contact,
          },
        });
        results.created++;
      } catch {
        results.errors.push(`Failed to import Site: ${row.siteCode}`);
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
