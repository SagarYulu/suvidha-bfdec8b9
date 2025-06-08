
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolesManagement } from '@/components/admin/master-data/RolesManagement';
import { CitiesManagement } from '@/components/admin/master-data/CitiesManagement';
import { ClustersManagement } from '@/components/admin/master-data/ClustersManagement';
import { AuditLogsView } from '@/components/admin/master-data/AuditLogsView';

const MasterDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data Management</h1>
          <p className="text-muted-foreground">
            Manage roles, cities, clusters, and view audit logs
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Create, update, and manage system roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>City Management</CardTitle>
              <CardDescription>
                Create, update, and manage cities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CitiesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Management</CardTitle>
              <CardDescription>
                Create, update, and manage clusters within cities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClustersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View all master data changes and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterDataManagement;
