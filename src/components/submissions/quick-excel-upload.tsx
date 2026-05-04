"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

interface ParsedRow {
  sku: string;
  siteCode: string;
  brand?: string;
  remarks?: string;
  customFields?: Record<string, unknown>;
}

export function QuickExcelUpload() {
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadTemplate() {
    setDownloading(true);
    try {
      const res = await fetch("/api/submissions/template");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "NDRF_Template.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to download template");
      }
    } catch {
      toast.error("Failed to download template");
    } finally {
      setDownloading(false);
    }
  }

  async function parseExcelFile(file: File): Promise<ParsedRow[]> {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    return json
      .map((row) => {
        const customFields: Record<string, unknown> = {};
        const rpType = row["RP Type"];
        if (rpType) customFields.rpType = String(rpType);
        const supplySource = row["Supply source"];
        if (supplySource) customFields.supplySource = String(supplySource);
        const safetyStock = row["Safety stock"];
        if (safetyStock) customFields.safetyStock = Number(safetyStock);
        const ndCode = row["ND Code"];
        if (ndCode) customFields.ndCode = String(ndCode);
        const rpParamsChange = row["RP Parameters Change Request"];
        if (rpParamsChange) customFields.rpParamsChange = String(rpParamsChange);
        const replyCompletionDate = row["RP Type \u56DE\u8986\u5B8C\u6210\u65E5\u671F"];
        if (replyCompletionDate) customFields.replyCompletionDate = String(replyCompletionDate);

        return {
          sku: String(row.sku || row.SKU || row["SKU"] || "").trim(),
          siteCode: String(row.siteCode || row["Shop Code"] || row.site_code || row["Site Code"] || "").trim(),
          brand: row.brand || row.Brand || row["Brand"] ? String(row.brand || row.Brand || row["Brand"]).trim() : undefined,
          remarks: row.remarks || row.Remarks || row["Remark"] || row.remark ? String(row.remarks || row.Remarks || row["Remark"] || row.remark) : undefined,
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        };
      })
      .filter((row) => row.sku && row.siteCode);
  }

  async function parseCSVFile(file: File): Promise<ParsedRow[]> {
    const text = await file.text();
    const lines = text.trim().split("\n");
    const startRow = lines[0].toLowerCase().includes("sku") ? 1 : 0;

    return lines
      .slice(startRow)
      .map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return {
          sku: cols[0] || "",
          siteCode: cols[1] || "",
          brand: cols[2] || undefined,
          remarks: cols[3] || undefined,
        };
      })
      .filter((row) => row.sku && row.siteCode);
  }

  async function processFile(file: File) {
    setUploading(true);
    try {
      let rows: ParsedRow[];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        rows = await parseExcelFile(file);
      } else if (file.name.endsWith(".csv")) {
        rows = await parseCSVFile(file);
      } else {
        toast.error("Unsupported file format. Please use .xlsx, .xls, or .csv");
        return;
      }

      if (rows.length === 0) {
        toast.error("No valid rows found in the file. Ensure SKU and Shop Code columns are filled.");
        return;
      }

      const res = await fetch("/api/submissions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rows }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`${result.created} records created successfully`);
        window.location.reload();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Upload failed");
      }
    } catch {
      toast.error("Failed to process file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    []
  );

  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex flex-1 items-center gap-4 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            {uploading ? (
              <Upload className="h-6 w-6 text-primary animate-pulse" />
            ) : (
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {uploading
                ? "Uploading & processing..."
                : "Drop Excel / CSV file here, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .xlsx, .xls, .csv (max 500 rows)
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={handleDownloadTemplate}
        disabled={downloading}
        className="shrink-0 h-auto py-3 px-4"
      >
        <Download className="mr-2 h-5 w-5" />
        <span className="text-left leading-tight">
          {downloading ? "Downloading..." : "Download\nExcel Template"}
        </span>
      </Button>
    </div>
  );
}
