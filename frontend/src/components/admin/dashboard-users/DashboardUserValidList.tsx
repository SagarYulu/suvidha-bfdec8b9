
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Upload } from 'lucide-react';

interface DashboardUser {
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface DashboardUserValidListProps {
  validUsers: DashboardUser[];
  onUpload: () => void;
  isUploading?: boolean;
}

const DashboardUserValidList: React.FC<DashboardUserValidListProps> = ({
  validUsers,
  onUpload,
  isUploading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Valid Dashboard Users ({validUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No valid users to upload</p>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto mb-4">
              <div className="space-y-2">
                {validUsers.map((user, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    {user.permissions && user.permissions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((permission, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={onUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading Users...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {validUsers.length} Dashboard Users
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardUserValidList;
