import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const suspendSchema = z.object({
  suspended: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === (session.user as any).id) {
    return NextResponse.json({ error: "Cannot suspend your own account" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if ((session.user as any).role === "MODERATOR" && targetUser.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot suspend an admin user" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { suspended } = suspendSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: { suspended },
      select: { id: true, email: true, name: true, role: true, suspended: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
