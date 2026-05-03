import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTemplate } from "@/lib/excel";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customFieldDefs = await prisma.customFieldDef.findMany({
    where: { adminOnly: false },
    orderBy: { sortOrder: "asc" },
  });

  const templateFields = customFieldDefs.map((f) => ({
    name: f.name,
    label: f.label,
    type: f.type,
    options: f.options ? JSON.stringify(f.options) : null,
    required: f.required,
  }));

  const buffer = await generateTemplate(templateFields);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="NDRF_Template.xlsx"',
    },
  });
}
