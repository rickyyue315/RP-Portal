import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkItemSchema = z.object({
  sku: z.string().min(1),
  siteCode: z.string().min(1),
  brand: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
});

const bulkSchema = z.object({
  items: z.array(bulkItemSchema).min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items } = bulkSchema.parse(body);
    const userId = (session.user as any).id;

    const submissions = await prisma.submission.createMany({
      data: items.map((item) => ({
        ...item,
        customFields: item.customFields ?? undefined,
        userId,
      })) as any,
    });

    return NextResponse.json({ created: submissions.count }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
