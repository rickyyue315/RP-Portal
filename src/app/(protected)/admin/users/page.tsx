import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { UserTable } from "@/components/admin/user-table";

export default async function UsersPage() {
  const session = await auth();
  const role = ((session?.user as any)?.role || "USER") as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Card>
        <CardContent className="pt-6">
          <UserTable currentUserRole={role} />
        </CardContent>
      </Card>
    </div>
  );
}
