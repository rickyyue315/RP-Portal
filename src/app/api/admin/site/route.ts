import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const siteSchema = z.object({
  siteCode: z.string().min(1),
  siteName: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await prisma.siteMaster.findMany({
    orderBy: { siteCode: "asc" },
  });

  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
    if (!session || !["ADMIN", "MODERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = siteSchema.parse(body);

    const site = await prisma.siteMaster.upsert({
      where: { siteCode: parsed.siteCode },
      update: {
        siteName: parsed.siteName,
        region: parsed.region,
        address: parsed.address,
        contact: parsed.contact,
      },
      create: parsed,
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
