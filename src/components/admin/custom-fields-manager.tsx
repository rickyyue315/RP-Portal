"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface CustomFieldItem {
  id: string;
  name: string;
  label: string;
  type: string;
  options: string | null;
  required: boolean;
  adminOnly: boolean;
  sortOrder: number;
}

export function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomFieldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    label: "",
    type: "text" as string,
    options: "",
    required: false,
    adminOnly: false,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchFields();
  }, []);

  async function fetchFields() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/custom-fields");
      if (res.ok) setFields(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const payload = {
      name: form.name,
      label: form.label,
      type: form.type,
      options: form.type === "select" && form.options ? form.options.split(",").map((s) => s.trim()) : null,
      required: form.required,
      adminOnly: form.adminOnly,
      sortOrder: form.sortOrder,
    };

    const res = await fetch("/api/admin/custom-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Custom field added");
      setDialogOpen(false);
      setForm({ name: "", label: "", type: "text", options: "", required: false, adminOnly: false, sortOrder: 0 });
      fetchFields();
    } else {
      toast.error("Failed to add field");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this custom field?")) return;
    const res = await fetch(`/api/admin/custom-fields/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Field deleted");
      fetchFields();
    } else {
      toast.error("Failed to delete");
    }
  }

  const columns = [
    { key: "sortOrder", header: "#" },
    { key: "name", header: "Field Name" },
    { key: "label", header: "Label" },
    {
      key: "type",
      header: "Type",
      render: (item: CustomFieldItem) => <Badge variant="outline">{item.type}</Badge>,
    },
    {
      key: "required",
      header: "Required",
      render: (item: CustomFieldItem) => (item.required ? "Yes" : "No"),
    },
    {
      key: "adminOnly",
      header: "Admin Only",
      render: (item: CustomFieldItem) => (item.adminOnly ? "Yes" : "No"),
    },
    {
      key: "options",
      header: "Options",
      render: (item: CustomFieldItem) =>
        item.options ? JSON.parse(item.options).join(", ") : "-",
    },
    {
      key: "actions",
      header: "",
      render: (item: CustomFieldItem) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-1 h-4 w-4" /> Add Field</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Field</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Field Name (alphanumeric, no spaces)</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="priority" /></div>
            <div><Label>Display Label</Label><Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Priority" /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(val) => setForm((f) => ({ ...f, type: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "select" && (
              <div><Label>Options (comma-separated)</Label><Input value={form.options} onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))} placeholder="low, medium, high" /></div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.required} onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))} />
              <Label>Required</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.adminOnly} onChange={(e) => setForm((f) => ({ ...f, adminOnly: e.target.checked }))} />
              <Label>Admin Only (hidden from user template)</Label>
            </div>
            <div><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} /></div>
            <Button onClick={handleAdd} disabled={!form.name || !form.label}>Add Field</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={fields}
      />
    </div>
  );
}
