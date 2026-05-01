"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";

interface SkuItem {
  id: string;
  sku: string;
  description: string | null;
  category: string | null;
  unit: string | null;
}

export function SkuMasterTable() {
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ sku: "", description: "", category: "", unit: "" });

  useEffect(() => {
    fetchSkus();
  }, []);

  async function fetchSkus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sku");
      if (res.ok) setSkus(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const res = await fetch("/api/admin/sku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.sku,
        description: form.description || null,
        category: form.category || null,
        unit: form.unit || null,
      }),
    });

    if (res.ok) {
      toast.success("SKU added");
      setDialogOpen(false);
      setForm({ sku: "", description: "", category: "", unit: "" });
      fetchSkus();
    } else {
      toast.error("Failed to add SKU");
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/sku/import", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      toast.success(`Imported ${result.created} SKUs`);
      setImportOpen(false);
      fetchSkus();
    } else {
      toast.error("Import failed");
    }
  }

  const columns = [
    { key: "sku", header: "SKU Code" },
    { key: "description", header: "Description" },
    { key: "category", header: "Category" },
    { key: "unit", header: "Unit" },
  ];

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add SKU</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add SKU</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>SKU Code</Label><Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} /></div>
              <Button onClick={handleAdd} disabled={!form.sku}>Add SKU</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Upload className="mr-1 h-4 w-4" /> Import CSV/Excel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Import SKU Data</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload CSV or Excel file with columns: SKU, Description, Category, Unit
              </p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="block w-full text-sm" />
              <Button onClick={handleImport}>Import</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={skus}
      />
    </div>
  );
}
