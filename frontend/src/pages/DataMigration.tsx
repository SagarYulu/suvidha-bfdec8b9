
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DataMigration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      // Simulate migration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Migration completed",
        description: "Data has been successfully migrated to the system",
      });
    } catch (error) {
      toast({
        title: "Migration failed",
        description: "An error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Migration Tool</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Migration</CardTitle>
              <CardDescription>
                Migrate data from existing systems to Yulu Suvidha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMigration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Migrating..." : "Start Migration"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migration Status</CardTitle>
              <CardDescription>
                Track the progress of your data migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database Setup</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex justify-between">
                  <span>Table Creation</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Import</span>
                  <span className="text-yellow-600">⏳ Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataMigration;
