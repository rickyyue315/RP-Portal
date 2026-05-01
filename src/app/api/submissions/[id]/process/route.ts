import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status === "PROCESSED") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      processedById: user.id,
    },
  });

  return NextResponse.json(updated);
}
