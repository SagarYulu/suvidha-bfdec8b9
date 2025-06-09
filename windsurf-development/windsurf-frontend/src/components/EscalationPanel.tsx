import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpCircle, 
  Clock, 
  AlertTriangle, 
  User,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Escalation {
  id: string;
  escalation_type: string;
  reason: string;
  escalated_at: string;
  escalated_to_name: string;
  escalated_from_name: string;
  status: 'pending' | 'resolved';
  created_by_name: string;
}

interface EscalationPanelProps {
  issueId: string;
  currentAssignee?: string;
  canEscalate: boolean;
  onEscalationCreated?: (escalation: any) => void;
  className?: string;
}

const EscalationPanel: React.FC<EscalationPanelProps> = ({
  issueId,
  currentAssignee,
  canEscalate,
  onEscalationCreated,
  className = ''
}) => {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [escalationType, setEscalationType] = useState<string>('manual');
  const [reason, setReason] = useState<string>('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalations();
    if (canEscalate) {
      fetchAvailableUsers();
    }
  }, [issueId, canEscalate]);

  const fetchEscalations = async () => {
    try {
      const response = await fetch(`/api/escalations/issue/${issueId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEscalations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching escalations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users/available-for-escalation', {
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
    }
  };

  const handleEscalation = async () => {
    if (!selectedUserId || !reason.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a user and provide a reason for escalation',
        variant: 'destructive'
      });
      return;
    }

    setIsEscalating(true);
    try {
      const response = await fetch('/api/escalations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          issue_id: issueId,
          escalated_to: selectedUserId,
          escalation_type: escalationType,
          reason
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Escalation created',
          description: 'Issue has been escalated successfully'
        });
        
        // Reset form
        setSelectedUserId('');
        setReason('');
        setEscalationType('manual');
        
        // Refresh escalations
        fetchEscalations();
        
        if (onEscalationCreated) {
          onEscalationCreated(data.data);
        }
      } else {
        throw new Error('Failed to create escalation');
      }
    } catch (error) {
      console.error('Escalation error:', error);
      toast({
        title: 'Escalation failed',
        description: 'Failed to escalate the issue',
        variant: 'destructive'
      });
    } finally {
      setIsEscalating(false);
    }
  };

  const resolveEscalation = async (escalationId: string) => {
    try {
      const response = await fetch(`/api/escalations/${escalationId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resolution: 'Manually resolved by user'
        })
      });

      if (response.ok) {
        toast({
          title: 'Escalation resolved',
          description: 'Escalation has been marked as resolved'
        });
        fetchEscalations();
      }
    } catch (error) {
      console.error('Error resolving escalation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve escalation',
        variant: 'destructive'
      });
    }
  };

  const getEscalationTypeColor = (type: string) => {
    switch (type) {
      case 'auto_critical':
        return 'bg-orange-100 text-orange-800';
      case 'auto_breach':
        return 'bg-red-100 text-red-800';
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEscalationTypeLabel = (type: string) => {
    switch (type) {
      case 'auto_critical':
        return 'Auto Critical';
      case 'auto_breach':
        return 'SLA Breach';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
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
          <ArrowUpCircle className="h-5 w-5 text-red-500" />
          Escalation Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Existing Escalations */}
        {escalations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Escalations</h4>
            <div className="space-y-3">
              {escalations.map((escalation) => (
                <div 
                  key={escalation.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={getEscalationTypeColor(escalation.escalation_type)}>
                        {getEscalationTypeLabel(escalation.escalation_type)}
                      </Badge>
                      <Badge 
                        variant={escalation.status === 'pending' ? 'destructive' : 'outline'}
                      >
                        {escalation.status}
                      </Badge>
                    </div>
                    
                    {escalation.status === 'pending' && canEscalate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveEscalation(escalation.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        From: <strong>{escalation.escalated_from_name || 'System'}</strong> 
                        → To: <strong>{escalation.escalated_to_name}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(escalation.escalated_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-800">{escalation.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Escalation */}
        {canEscalate && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Create New Escalation</h4>
            
            {/* Escalation Type */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Escalation Type</label>
              <Select value={escalationType} onValueChange={setEscalationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Escalation</SelectItem>
                  <SelectItem value="auto_critical">Critical Issue</SelectItem>
                  <SelectItem value="auto_breach">SLA Breach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Selection */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Escalate To</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to escalate to" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{user.name} ({user.role})</span>
                        <Badge variant="outline" className="ml-2">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Escalation Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for escalating this issue..."
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleEscalation}
              disabled={!selectedUserId || !reason.trim() || isEscalating}
              className="w-full"
              variant="destructive"
            >
              {isEscalating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Escalation...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Create Escalation
                </>
              )}
            </Button>
          </div>
        )}

        {/* No Escalations State */}
        {escalations.length === 0 && (
          <div className="text-center py-8">
            <ArrowUpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No escalations for this issue</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Escalation Guidelines</p>
              <p className="text-xs text-yellow-700 mt-1">
                Use escalations when issues require higher-level attention, have breached SLAs, 
                or need specialized expertise. Provide clear reasons to help the escalated party 
                understand the urgency and context.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscalationPanel;
