import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteMasterTable } from "@/components/admin/site-master-table";

export default function SiteMasterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Master</h1>
      <Card>
        <CardContent className="pt-6">
          <SiteMasterTable />
        </CardContent>
      </Card>
    </div>
  );
}
