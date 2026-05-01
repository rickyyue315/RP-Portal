import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  sku: z.string().min(1),
  siteCode: z.string().min(1),
  quantity: z.number().int().positive().nullable().optional(),
  unitPrice: z.number().positive().nullable().optional(),
  remarks: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Record<string, unknown> = {};

  if ((session.user as any).role !== "ADMIN") {
    where.userId = (session.user as any).id;
  }

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { sku: { contains: search, mode: "insensitive" } },
      { siteCode: { contains: search, mode: "insensitive" } },
      { remarks: { contains: search, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.submittedAt = {};
    if (dateFrom) (where.submittedAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.submittedAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59");
  }

  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);

    const submission = await prisma.submission.create({
      data: {
        ...parsed,
        customFields: parsed.customFields ?? undefined,
        userId: (session.user as any).id,
      } as any,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
