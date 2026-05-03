import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!session) redirect("/login");

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) redirect("/submissions");
  if (submission.status === "PROCESSED") redirect(`/submissions/${id}`);
  if (user.role !== "ADMIN" && submission.userId !== user.id) {
    redirect("/submissions");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Submission</h1>
      <Card>
        <CardContent className="pt-6">
          <SubmissionForm
            initialData={{
              id: submission.id,
              sku: submission.sku,
              siteCode: submission.siteCode,
              quantity: submission.quantity,
              unitPrice: submission.unitPrice ? Number(submission.unitPrice) : null,
              remarks: submission.remarks,
              customFields: submission.customFields as Record<string, unknown> | null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
