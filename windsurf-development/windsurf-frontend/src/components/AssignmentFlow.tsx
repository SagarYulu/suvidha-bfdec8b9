
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AssignmentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  workload: number;
  availability: 'available' | 'busy' | 'offline';
  skills: string[];
}

interface AssignmentFlowProps {
  issueId: string;
  currentAssignee?: AssignmentUser | null;
  onAssignmentChange: (userId: string, reason?: string) => Promise<boolean>;
  canAssign: boolean;
  issueType?: string;
  priority?: string;
  className?: string;
}

const AssignmentFlow: React.FC<AssignmentFlowProps> = ({
  issueId,
  currentAssignee,
  onAssignmentChange,
  canAssign,
  issueType,
  priority,
  className = ''
}) => {
  const [availableUsers, setAvailableUsers] = useState<AssignmentUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableUsers();
  }, [issueType, priority]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/available-for-assignment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedUserId) {
      toast({
        title: 'No user selected',
        description: 'Please select a user to assign the issue to',
        variant: 'destructive'
      });
      return;
    }

    setIsAssigning(true);
    try {
      const success = await onAssignmentChange(selectedUserId, assignmentReason);
      
      if (success) {
        toast({
          title: 'Assignment successful',
          description: 'Issue has been assigned successfully'
        });
        setSelectedUserId('');
        setAssignmentReason('');
        // Refresh the available users list
        fetchAvailableUsers();
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: 'Assignment failed',
        description: 'Failed to assign the issue',
        variant: 'destructive'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload < 5) return 'text-green-600';
    if (workload < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuggestedUsers = () => {
    return availableUsers
      .filter(user => user.availability === 'available')
      .sort((a, b) => a.workload - b.workload)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assignment Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Assignment */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Assignment</h4>
          {currentAssignee ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{currentAssignee.name}</p>
                  <p className="text-sm text-blue-700">{currentAssignee.email}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {currentAssignee.role}
                </Badge>
                <div className={`text-xs ${getAvailabilityColor(currentAssignee.availability)} px-2 py-1 rounded-full`}>
                  {currentAssignee.availability}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
              <span className="text-gray-700">No one assigned</span>
            </div>
          )}
        </div>

        {/* Suggested Assignments */}
        {getSuggestedUsers().length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Suggested Assignments</h4>
            <div className="space-y-2">
              {getSuggestedUsers().map(user => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{user.name}</p>
                      <p className="text-xs text-green-700">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${getWorkloadColor(user.workload)}`}>
                      {user.workload} active
                    </div>
                    <div className="text-xs text-green-600">
                      {user.availability}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignment Form */}
        {canAssign && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Assign to New User</h4>
            
            {/* User Selection */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{user.name} ({user.role})</span>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getAvailabilityColor(user.availability)}`}
                          >
                            {user.availability}
                          </Badge>
                          <span className={`text-xs ${getWorkloadColor(user.workload)}`}>
                            {user.workload}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignment Reason */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Assignment Reason (Optional)</label>
              <Textarea
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                placeholder="Why are you assigning this issue to the selected user?"
                rows={3}
              />
            </div>

            {/* Assignment Button */}
            <Button 
              onClick={handleAssignment}
              disabled={!selectedUserId || isAssigning}
              className="w-full"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Assign Issue
                </>
              )}
            </Button>
          </div>
        )}

        {/* Team Workload Overview */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Team Workload</h4>
          <div className="space-y-2">
            {availableUsers.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{user.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        user.workload < 5 ? 'bg-green-500' : 
                        user.workload < 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(user.workload * 10, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${getWorkloadColor(user.workload)}`}>
                    {user.workload}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentFlow;
