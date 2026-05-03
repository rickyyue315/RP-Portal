"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface ParsedRow {
  sku: string;
  siteCode: string;
  brand?: string;
  remarks?: string;
}

export function BulkPasteDialog() {
  const [open, setOpen] = useState(false);
  const [pasteData, setPasteData] = useState("");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function parseTabSeparated(text: string): ParsedRow[] {
    return text
      .trim()
      .split("\n")
      .map((line) => {
        const cols = line.split("\t");
        return {
          sku: cols[0]?.trim() || "",
          siteCode: cols[1]?.trim() || "",
          brand: cols[2]?.trim() || undefined,
          remarks: cols[3]?.trim() || undefined,
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

  async function parseExcelFile(file: File): Promise<ParsedRow[]> {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    return json
      .map((row) => ({
        sku: String(row.sku || row.SKU || "").trim(),
        siteCode: String(row.siteCode || row["Shop Code"] || row.site_code || row["Site Code"] || "").trim(),
        brand: row.brand || row.Brand || row["Brand"] ? String(row.brand || row.Brand || row["Brand"]).trim() : undefined,
        remarks: row.remarks || row.Remarks || row["Remark"] || row.remark ? String(row.remarks || row.Remarks || row["Remark"] || row.remark) : undefined,
      }))
      .filter((row) => row.sku && row.siteCode);
  }

  function handlePreview() {
    const rows = parseTabSeparated(pasteData);
    setPreview(rows);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let rows: ParsedRow[];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        rows = await parseExcelFile(file);
      } else {
        rows = await parseCSVFile(file);
      }
      setPasteData(
        rows
          .map((r) => `${r.sku}\t${r.siteCode}\t${r.brand || ""}\t${r.remarks || ""}`)
          .join("\n")
      );
      setPreview(rows);
    } catch {
      toast.error("Failed to parse file");
    }
  }

  async function handleSubmit() {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/submissions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: preview }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`${result.created} records created`);
        setOpen(false);
        setPasteData("");
        setPreview([]);
      } else {
        toast.error("Bulk submission failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-1 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Submissions</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="paste">
          <TabsList>
            <TabsTrigger value="paste">Paste Data</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste">
            <p className="mb-2 text-sm text-muted-foreground">
              Paste tab-separated data: SKU, Shop Code, Brand, Remark
            </p>
            <Textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              rows={8}
              placeholder={"SKU-001\tSITE-HK-01\tBrand A\tUrgent request\nSKU-002\tSITE-HK-02\tBrand B\tNormal"}
            />
            <Button onClick={handlePreview} className="mt-2" variant="secondary">
              Preview ({parseTabSeparated(pasteData).length} rows)
            </Button>
          </TabsContent>

          <TabsContent value="file">
            <p className="mb-2 text-sm text-muted-foreground">
              Upload CSV or Excel file with columns: SKU, Shop Code, Brand, Remark
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </TabsContent>
        </Tabs>

        {preview.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium">Preview ({preview.length} rows)</h4>
            <div className="max-h-48 overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Shop Code</th>
                    <th className="p-2 text-left">Brand</th>
                    <th className="p-2 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{r.sku}</td>
                      <td className="p-2">{r.siteCode}</td>
                      <td className="p-2">{r.brand}</td>
                      <td className="p-2">{r.remarks}</td>
                    </tr>
                  ))}
                  {preview.length > 20 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-muted-foreground">
                        ...and {preview.length - 20} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="mt-3">
              {loading ? "Submitting..." : `Submit ${preview.length} Records`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
