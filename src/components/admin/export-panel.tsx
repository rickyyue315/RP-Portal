"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export function ExportPanel() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);

  async function handleExport(type: "daily" | "monthly") {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (type === "monthly") params.set("month", month);

      const res = await fetch(`/api/admin/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = type === "monthly" ? `NDRF_Export_${month}.xlsx` : `NDRF_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        alert(data.error || "Export failed");
      }
    } catch {
      alert("Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Export today&apos;s submissions as Excel file.
          </p>
          <Button onClick={() => handleExport("daily")} disabled={loading}>
            <Download className="mr-1 h-4 w-4" />
            Download Today&apos;s Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="month">Select Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <Button onClick={() => handleExport("monthly")} disabled={loading}>
              <Download className="mr-1 h-4 w-4" />
              Download Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
