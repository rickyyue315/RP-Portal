"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function SubmissionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Submission detail error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Failed to load submission</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The submission data could not be loaded. It may not exist or a network error occurred.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
