import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  const where = isAdmin ? {} : { userId: user?.id };

  const [totalSubmissions, pendingCount, processedCount, recentSubmissions, adminStats] =
    await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.count({ where: { ...where, status: "PENDING" } }),
      prisma.submission.count({ where: { ...where, status: "PROCESSED" } }),
      prisma.submission.findMany({
        where,
        include: { user: { select: { name: true } } },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      isAdmin
        ? Promise.all([
            prisma.user.count(),
            prisma.skuMaster.count(),
            prisma.siteMaster.count(),
            prisma.customFieldDef.count(),
          ])
        : null,
    ]);

  const [userCount, skuCount, siteCount, fieldCount] = adminStats ?? [0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processedCount}</div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Users</span>
                <p className="text-lg font-bold">{userCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">SKU Master Records</span>
                <p className="text-lg font-bold">{skuCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Site Master Records</span>
                <p className="text-lg font-bold">{siteCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Custom Fields</span>
                <p className="text-lg font-bold">{fieldCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground">{s.id.slice(0, 8)}</span>
                    <span className="font-medium">{s.sku}</span>
                    <span className="text-muted-foreground">{s.siteCode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {isAdmin && <span className="text-muted-foreground">{s.user.name}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      s.status === "PROCESSED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {s.status === "PROCESSED" ? "Processed" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
