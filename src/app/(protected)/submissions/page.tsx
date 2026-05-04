import { auth } from "@/lib/auth";
import { SubmissionTable } from "@/components/submissions/submission-table";
import { BulkPasteDialog } from "@/components/submissions/bulk-paste-dialog";
import { QuickExcelUpload } from "@/components/submissions/quick-excel-upload";

export default async function SubmissionsPage() {
  const session = await auth();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <BulkPasteDialog />
      </div>
      <QuickExcelUpload />
      <SubmissionTable isAdmin={isAdmin} />
    </div>
  );
}
