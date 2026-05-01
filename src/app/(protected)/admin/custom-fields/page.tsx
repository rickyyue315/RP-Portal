import { Card, CardContent } from "@/components/ui/card";
import { CustomFieldsManager } from "@/components/admin/custom-fields-manager";

export default function CustomFieldsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Custom Fields</h1>
      <Card>
        <CardContent className="pt-6">
          <CustomFieldsManager />
        </CardContent>
      </Card>
    </div>
  );
}
