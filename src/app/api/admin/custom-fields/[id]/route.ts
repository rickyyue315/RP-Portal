import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFieldSchema = z.object({
  label: z.string().min(1).optional(),
  type: z.enum(["text", "number", "select", "date"]).optional(),
  options: z.array(z.string()).nullable().optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateFieldSchema.parse(body);

    const field = await prisma.customFieldDef.update({
      where: { id },
      data: {
        ...parsed,
        options: parsed.options ? JSON.stringify(parsed.options) : undefined,
      },
    });

    return NextResponse.json(field);
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
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.customFieldDef.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
