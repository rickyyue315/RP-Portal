import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/setup/setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md">
        <SetupForm />
      </div>
    </div>
  );
}
