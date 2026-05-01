"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface SubmissionItem {
  id: string;
  sku: string;
  siteCode: string;
  quantity: number | null;
  unitPrice: number | null;
  remarks: string | null;
  status: string;
  submittedAt: string;
  updatedAt: string;
  user: { name: string; email: string };
}

interface SubmissionTableProps {
  isAdmin: boolean;
}

export function SubmissionTable({ isAdmin }: SubmissionTableProps) {
  const router = useRouter();
  const [data, setData] = useState<SubmissionItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
    });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/submissions?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setPagination(json.pagination);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { key: "id", header: "ID", render: (item: SubmissionItem) => item.id.slice(0, 8) },
    { key: "sku", header: "SKU" },
    { key: "siteCode", header: "Site Code" },
    { key: "quantity", header: "Qty" },
    {
      key: "unitPrice",
      header: "Unit Price",
      render: (item: SubmissionItem) => formatCurrency(item.unitPrice),
    },
    {
      key: "total",
      header: "Total",
      render: (item: SubmissionItem) =>
        item.quantity && item.unitPrice
          ? formatCurrency(item.quantity * item.unitPrice)
          : "-",
    },
    {
      key: "status",
      header: "Status",
      render: (item: SubmissionItem) => <StatusBadge status={item.status} />,
    },
    ...(isAdmin
      ? [
          {
            key: "user" as const,
            header: "Submitted By",
            render: (item: SubmissionItem) => item.user.name,
          },
        ]
      : []),
    {
      key: "submittedAt",
      header: "Submitted",
      render: (item: SubmissionItem) => formatDate(item.submittedAt),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SKU, Site Code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="pl-8 w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val === "ALL" ? "" : val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSED">Processed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/submissions/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            New Submission
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
          onRowClick={(item) => router.push(`/submissions/${(item as unknown as SubmissionItem).id}`)}
        />
      )}
    </div>
  );
}
