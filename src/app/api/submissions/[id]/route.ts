import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  sku: z.string().min(1).optional(),
  siteCode: z.string().min(1).optional(),
  brand: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN" && submission.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(submission);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status === "PROCESSED") {
    return NextResponse.json({ error: "Cannot edit processed submission" }, { status: 400 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN" && submission.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        ...parsed,
        customFields: parsed.customFields ?? undefined,
        updatedById: user.id,
      } as any,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status === "PROCESSED") {
    return NextResponse.json({ error: "Cannot delete processed submission" }, { status: 400 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN" && submission.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
