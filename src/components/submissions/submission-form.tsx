"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SearchCombobox } from "@/components/shared/search-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SkuResult {
  sku: string;
  description: string | null;
  category: string | null;
}

interface SiteResult {
  siteCode: string;
  siteName: string | null;
  region: string | null;
}

interface CustomFieldDef {
  id: string;
  name: string;
  label: string;
  type: string;
  options: string | null;
  required: boolean;
}

interface SubmissionFormProps {
  initialData?: {
    id?: string;
    sku?: string;
    siteCode?: string;
    brand?: string | null;
    remarks?: string | null;
    customFields?: Record<string, unknown> | null;
  };
}

export function SubmissionForm({ initialData }: SubmissionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [sku, setSku] = useState(initialData?.sku || "");
  const [siteCode, setSiteCode] = useState(initialData?.siteCode || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(
    (initialData?.customFields as Record<string, string>) || {}
  );
  const [skuResults, setSkuResults] = useState<SkuResult[]>([]);
  const [siteResults, setSiteResults] = useState<SiteResult[]>([]);
  const [selectedSku, setSelectedSku] = useState<SkuResult | null>(null);
  const [selectedSite, setSelectedSite] = useState<SiteResult | null>(null);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSku = useDebounce(sku, 300);
  const debouncedSite = useDebounce(siteCode, 300);

  useEffect(() => {
    fetch("/api/lookup/custom-fields")
      .then((res) => res.json())
      .then(setCustomFieldDefs)
      .catch(() => {});
  }, []);

  const searchSku = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSkuResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/lookup/sku?q=${encodeURIComponent(query)}`);
      if (res.ok) setSkuResults(await res.json());
    } catch {}
  }, []);

  const searchSite = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSiteResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/lookup/site?q=${encodeURIComponent(query)}`);
      if (res.ok) setSiteResults(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    searchSku(debouncedSku);
  }, [debouncedSku, searchSku]);

  useEffect(() => {
    searchSite(debouncedSite);
  }, [debouncedSite, searchSite]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      sku: selectedSku?.sku || sku,
      siteCode: selectedSite?.siteCode || siteCode,
      brand: brand || null,
      remarks: remarks || null,
      customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : null,
    };

    try {
      const url = isEdit ? `/api/submissions/${initialData!.id}` : "/api/submissions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Submission updated" : "Submission created");
        router.push("/submissions");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <SearchCombobox
          label="SKU"
          value={sku}
          onChange={setSku}
          onSelect={(item) => {
            setSelectedSku({ sku: item.value, description: null, category: null });
            setSku(item.value);
          }}
          results={skuResults.map((r) => ({
            value: r.sku,
            label: `${r.sku}${r.description ? ` - ${r.description}` : ""}`,
          }))}
          placeholder="Type to search SKU..."
        />

        <SearchCombobox
          label="Site Code"
          value={siteCode}
          onChange={setSiteCode}
          onSelect={(item) => {
            setSelectedSite({ siteCode: item.value, siteName: null, region: null });
            setSiteCode(item.value);
          }}
          results={siteResults.map((r) => ({
            value: r.siteCode,
            label: `${r.siteCode}${r.siteName ? ` - ${r.siteName}` : ""}`,
          }))}
          placeholder="Type to search Site..."
        />
      </div>

      {selectedSku && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <strong>SKU:</strong> {selectedSku.sku}
          {selectedSku.description && <> | <strong>Desc:</strong> {selectedSku.description}</>}
          {selectedSku.category && <> | <strong>Category:</strong> {selectedSku.category}</>}
        </div>
      )}

      {selectedSite && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <strong>Site:</strong> {selectedSite.siteCode}
          {selectedSite.siteName && <> | <strong>Name:</strong> {selectedSite.siteName}</>}
          {selectedSite.region && <> | <strong>Region:</strong> {selectedSite.region}</>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Optional remarks..."
          rows={3}
        />
      </div>

      {customFieldDefs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Additional Fields</h3>
          <div className="grid grid-cols-2 gap-4">
            {customFieldDefs.map((field) => (
              <div key={field.id}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                {field.type === "select" && field.options ? (
                  <Select
                    value={customFieldValues[field.name] || ""}
                    onValueChange={(val) =>
                      setCustomFieldValues((prev) => ({ ...prev, [field.name]: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {JSON.parse(field.options).map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={customFieldValues[field.name] || ""}
                    onChange={(e) =>
                      setCustomFieldValues((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? isEdit
              ? "Updating..."
              : "Submitting..."
            : isEdit
            ? "Update"
            : "Submit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/submissions")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
