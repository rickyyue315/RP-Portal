import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customFieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9_]+$/),
  label: z.string().min(1),
  type: z.enum(["text", "number", "select", "date"]).default("text"),
  options: z.array(z.string()).nullable().optional(),
  required: z.boolean().default(false),
  adminOnly: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fields = await prisma.customFieldDef.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = customFieldSchema.parse(body);

    const field = await prisma.customFieldDef.create({
      data: {
        name: parsed.name,
        label: parsed.label,
        type: parsed.type,
        options: parsed.options ? JSON.stringify(parsed.options) : undefined,
        required: parsed.required,
        adminOnly: parsed.adminOnly,
        sortOrder: parsed.sortOrder,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
