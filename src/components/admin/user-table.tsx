"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  suspended: boolean;
  createdAt: string;
  _count: { submissions: number };
}

interface UserTableProps {
  currentUserRole: string;
}

export function UserTable({ currentUserRole }: UserTableProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const isAdmin = currentUserRole === "ADMIN";
  const isModerator = currentUserRole === "MODERATOR";

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("USER");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    setLoading(true);
    setError("");
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newUserEmail, password: newUserPassword, name: newUserName, role: newUserRole }),
    });

    if (res.ok) {
      toast.success("User created");
      setAddOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserRole("USER");
      fetchUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create user");
    }
    setAddLoading(false);
  }

  async function handleDeleteUser(user: UserItem) {
    if (!confirm(`Delete user "${user.name}"?\nThis will permanently remove the account and all submissions.`)) return;

    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete user");
    }
  }

  async function handleToggleSuspend(user: UserItem) {
    const newSuspended = !user.suspended;
    const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: newSuspended }),
    });

    if (res.ok) {
      toast.success(newSuspended ? "User suspended" : "User unsuspended");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, suspended: newSuspended } : u))
      );
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to update suspend status");
    }
  }

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
      render: (item: UserItem) => {
        const variant =
          item.role === "ADMIN" ? "default" : item.role === "MODERATOR" ? "outline" : "secondary";
        return <Badge variant={variant as "default" | "secondary" | "outline"}>{item.role}</Badge>;
      },
    },
    {
      key: "suspended",
      header: "Status",
      render: (item: UserItem) =>
        item.suspended ? (
          <Badge variant="destructive">Suspended</Badge>
        ) : (
          <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
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
        <div className="flex items-center gap-2">
          {isAdmin && (
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
                <SelectItem value="MODERATOR">MODERATOR</SelectItem>
              </SelectContent>
            </Select>
          )}
          {(isAdmin || isModerator) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleSuspend(item)}
            >
              {item.suspended ? "Unsuspend" : "Suspend"}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(item)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="flex h-40 items-center justify-center text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name</Label>
                  <Input
                    id="new-name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger id="new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={addLoading}>
                  {addLoading ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <DataTable columns={columns} data={users} />
    </div>
  );
}
