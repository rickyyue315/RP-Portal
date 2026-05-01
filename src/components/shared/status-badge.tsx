import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "PROCESSED" ? "success" : "warning"}>
      {status === "PROCESSED" ? "Processed" : "Pending"}
    </Badge>
  );
}
