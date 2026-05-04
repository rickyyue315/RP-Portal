import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { UserTable } from "@/components/admin/user-table";

export default async function UsersPage() {
  const session = await auth();
  const user = (session?.user as any) || {};
  const role = (user.role || "USER") as string;
  const userId = (user.id || "") as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{role === "USER" ? "My Profile" : "User Management"}</h1>
      <Card>
        <CardContent className="pt-6">
          <UserTable currentUserRole={role} currentUserId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
