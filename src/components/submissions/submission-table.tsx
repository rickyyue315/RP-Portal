"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface SubmissionItem {
  id: string;
  sku: string;
  siteCode: string;
  brand: string | null;
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
  const [navigating, setNavigating] = useState(false);

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
    { key: "siteCode", header: "Shop Code" },
    { key: "brand", header: "Brand", render: (item: SubmissionItem) => item.brand || "-" },
    {
      key: "status",
      header: "Status",
      render: (item: SubmissionItem) => <StatusBadge status={item.status} />,
    },
    ...(isAdmin
      ? [
          {
            key: "user" as const,
            header: "Requested By",
            render: (item: SubmissionItem) => item.user.name,
          },
        ]
      : []),
    {
      key: "submittedAt",
      header: "Application Date",
      render: (item: SubmissionItem) => formatDate(item.submittedAt),
    },
  ];

  return (
    <div className="relative space-y-4">
      {navigating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      )}
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
          onRowClick={(item) => {
            setNavigating(true);
            router.push(`/submissions/${(item as unknown as SubmissionItem).id}`);
          }}
        />
      )}
    </div>
  );
}
