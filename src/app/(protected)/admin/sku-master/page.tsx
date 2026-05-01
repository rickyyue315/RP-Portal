import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkuMasterTable } from "@/components/admin/sku-master-table";

export default function SkuMasterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">SKU Master</h1>
      <Card>
        <CardContent className="pt-6">
          <SkuMasterTable />
        </CardContent>
      </Card>
    </div>
  );
}
