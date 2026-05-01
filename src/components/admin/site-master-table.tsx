"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";

interface SiteItem {
  id: string;
  siteCode: string;
  siteName: string | null;
  region: string | null;
  address: string | null;
  contact: string | null;
}

export function SiteMasterTable() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ siteCode: "", siteName: "", region: "", address: "", contact: "" });

  useEffect(() => {
    fetchSites();
  }, []);

  async function fetchSites() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site");
      if (res.ok) setSites(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const res = await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteCode: form.siteCode,
        siteName: form.siteName || null,
        region: form.region || null,
        address: form.address || null,
        contact: form.contact || null,
      }),
    });

    if (res.ok) {
      toast.success("Site added");
      setDialogOpen(false);
      setForm({ siteCode: "", siteName: "", region: "", address: "", contact: "" });
      fetchSites();
    } else {
      toast.error("Failed to add site");
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/site/import", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      toast.success(`Imported ${result.created} sites`);
      setImportOpen(false);
      fetchSites();
    } else {
      toast.error("Import failed");
    }
  }

  const columns = [
    { key: "siteCode", header: "Site Code" },
    { key: "siteName", header: "Site Name" },
    { key: "region", header: "Region" },
    { key: "address", header: "Address" },
    { key: "contact", header: "Contact" },
  ];

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Site</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Site</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Site Code</Label><Input value={form.siteCode} onChange={(e) => setForm((f) => ({ ...f, siteCode: e.target.value }))} /></div>
              <div><Label>Site Name</Label><Input value={form.siteName} onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))} /></div>
              <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} /></div>
              <Button onClick={handleAdd} disabled={!form.siteCode}>Add Site</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Upload className="mr-1 h-4 w-4" /> Import CSV/Excel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Import Site Data</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload CSV or Excel file with columns: Site Code, Site Name, Region, Address, Contact
              </p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="block w-full text-sm" />
              <Button onClick={handleImport}>Import</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={sites}
      />
    </div>
  );
}
