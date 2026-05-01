import { SubmissionForm } from "@/components/submissions/submission-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSubmissionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Submission</h1>
      <Card>
        <CardContent className="pt-6">
          <SubmissionForm />
        </CardContent>
      </Card>
    </div>
  );
}
