import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const skuSchema = z.object({
  sku: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(
    typeof window !== "undefined" ? window.location.href : "http://localhost"
  );
  const search = searchParams?.get("search") || "";

  const where = search
    ? {
        OR: [
          { sku: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const skus = await prisma.skuMaster.findMany({
    where,
    orderBy: { sku: "asc" },
  });

  return NextResponse.json(skus);
}

export async function POST(req: NextRequest) {
  const session = await auth();
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = skuSchema.parse(body);

    const sku = await prisma.skuMaster.upsert({
      where: { sku: parsed.sku },
      update: {
        description: parsed.description,
        category: parsed.category,
        unit: parsed.unit,
      },
      create: parsed,
    });

    return NextResponse.json(sku, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
