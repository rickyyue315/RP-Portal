"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SubmissionDetailProps {
  id: string;
  isAdmin: boolean;
  userId: string;
}

export function SubmissionDetail({ id, isAdmin, userId }: SubmissionDetailProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground">Submission not found</div>;
  }

  const isOwner = data.userId === userId;
  const canEdit = data.status === "PENDING" && (isOwner || isAdmin);

  async function handleProcess() {
    const res = await fetch(`/api/submissions/${id}/process`, { method: "PATCH" });
    if (res.ok) {
      toast.success("Marked as processed");
      router.refresh();
      setData({ ...data, status: "PROCESSED" });
    } else {
      toast.error("Failed to process");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Submission deleted");
      router.push("/submissions");
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/submissions")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => router.push(`/submissions/${id}/edit`)}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          )}
          {isAdmin && data.status === "PENDING" && (
            <Button variant="outline" onClick={handleProcess}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Mark Processed
            </Button>
          )}
          {canEdit && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Submission {id.slice(0, 8)}
            <Badge variant={data.status === "PROCESSED" ? "success" : "warning"}>
              {data.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">SKU</span>
              <p className="font-medium">{data.sku}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Shop Code</span>
              <p className="font-medium">{data.siteCode}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Brand</span>
              <p className="font-medium">{data.brand || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Remark</span>
              <p className="font-medium">{data.remarks || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Requested By</span>
              <p className="font-medium">{data.user?.name || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Application Date</span>
              <p className="font-medium">{formatDate(data.submittedAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated</span>
              <p className="font-medium">{formatDate(data.updatedAt)}</p>
            </div>
            {data.processedAt && (
              <div>
                <span className="text-muted-foreground">Processed At</span>
                <p className="font-medium">{formatDate(data.processedAt)}</p>
              </div>
            )}
          </div>

          {data.customFields && Object.keys(data.customFields).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Custom Fields</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(data.customFields).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground">{key}</span>
                    <p className="font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
