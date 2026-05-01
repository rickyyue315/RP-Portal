"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: { submissions: number };
}

export function UserTable() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update role");
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: UserItem) => (
        <Badge variant={item.role === "ADMIN" ? "default" : "secondary"}>
          {item.role}
        </Badge>
      ),
    },
    {
      key: "_count.submissions",
      header: "Submissions",
      render: (item: UserItem) => item._count.submissions,
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (item: UserItem) => formatDate(item.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: UserItem) => (
        <Select
          value={item.role}
          onValueChange={(val) => handleRoleChange(item.id, val)}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={users}
    />
  );
}
