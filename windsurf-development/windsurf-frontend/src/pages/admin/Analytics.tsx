
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import ExportDialog from "@/components/admin/export/ExportDialog";

const Analytics = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Button 
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics charts and reports will be displayed here</p>
        </CardContent>
      </Card>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportType="analytics"
        title="Analytics Data"
      />
    </div>
  );
};

export default Analytics;
