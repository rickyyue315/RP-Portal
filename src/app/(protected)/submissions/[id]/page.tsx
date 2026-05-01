import { auth } from "@/lib/auth";
import { SubmissionDetail } from "@/components/submissions/submission-detail";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  const { id } = await params;

  return (
    <SubmissionDetail
      id={id}
      isAdmin={user?.role === "ADMIN"}
      userId={user?.id}
    />
  );
}
