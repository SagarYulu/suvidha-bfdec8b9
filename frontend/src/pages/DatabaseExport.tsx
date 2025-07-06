
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DatabaseExport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Database Export Tool</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-6 w-6 mr-2" />
              Export Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Database export functionality will be implemented here
              </p>
              <p className="text-sm text-gray-500">
                This will allow exporting data in various formats (CSV, Excel, etc.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
