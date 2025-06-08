
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MasterCitiesManager from '@/components/admin/master-data/MasterCitiesManager';
import MasterClustersManager from '@/components/admin/master-data/MasterClustersManager';
import MasterRolesManager from '@/components/admin/master-data/MasterRolesManager';
import MasterAuditLogs from '@/components/admin/master-data/MasterAuditLogs';

const MasterData = () => {
  return (
    <AdminLayout title="Master Data Management">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Data Management</h1>
            <p className="text-gray-600 mt-2">
              Manage cities, clusters, roles, and view audit logs
            </p>
          </div>
        </div>

        <Tabs defaultValue="cities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="cities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cities Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MasterCitiesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clusters Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MasterClustersManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MasterRolesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <MasterAuditLogs />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default MasterData;
