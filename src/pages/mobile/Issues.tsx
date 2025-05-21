import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import { useIssues } from '@/hooks/useIssues';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ISSUE_TYPES } from '@/config/issueTypes';

const Issues = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('open');
  
  const { 
    issues, 
    isLoading, 
    error,
    fetchIssues
  } = useIssues({
    employeeUuid: authState.user?.id,
    status: activeTab === 'open' ? ['open', 'in_progress'] : ['closed', 'resolved']
  });

  useEffect(() => {
    fetchIssues();
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getIssueTypeName = (typeId: string) => {
    const issueType = ISSUE_TYPES.find(type => type.id === typeId);
    return issueType?.label || typeId;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'closed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <MobileLayout title="My Issues">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-xl font-bold">My Issues</h1>
        <Button 
          size="sm" 
          onClick={() => navigate('/mobile/issues/new')}
          className="bg-yulu-blue hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <Tabs defaultValue="open" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 mb-4 mx-4">
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="open" className="mt-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="px-4 pb-24">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading issues. Please try again.
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No open issues found.
                </div>
              ) : (
                issues.map((issue) => (
                  <Card 
                    key={issue.id} 
                    className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={getStatusBadgeColor(issue.status)}>
                          {formatStatus(issue.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-1">{getIssueTypeName(issue.type_id)}</h3>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{issue.description}</p>
                      
                      {issue.assigned_to && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Assigned to: {issue.assigned_to_name || 'Support Agent'}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="closed" className="mt-0">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="px-4 pb-24">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading issues. Please try again.
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No closed issues found.
                </div>
              ) : (
                issues.map((issue) => (
                  <Card 
                    key={issue.id} 
                    className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={getStatusBadgeColor(issue.status)}>
                          {formatStatus(issue.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Closed {issue.closed_at ? formatDistanceToNow(new Date(issue.closed_at), { addSuffix: true }) : 'recently'}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-1">{getIssueTypeName(issue.type_id)}</h3>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{issue.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
};

export default Issues;
