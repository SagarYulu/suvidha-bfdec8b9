
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSentimentAlerts, resolveSentimentAlert, SentimentAlert } from '@/services/sentimentService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SentimentAlerts: React.FC = () => {
  const [showResolved, setShowResolved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SentimentAlert | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['sentiment-alerts', showResolved],
    queryFn: () => fetchSentimentAlerts(showResolved)
  });
  
  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => resolveSentimentAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-alerts'] });
      toast({
        title: "Alert Resolved",
        description: "The sentiment alert has been marked as resolved."
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to resolve the alert. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleResolve = (alert: SentimentAlert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };
  
  const confirmResolve = () => {
    if (selectedAlert) {
      resolveMutation.mutate(selectedAlert.id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sentiment Alerts</CardTitle>
          <CardDescription>
            Automated alerts for significant sentiment changes or issues
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? "Show Active Alerts" : "Show Resolved Alerts"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showResolved 
              ? "No resolved alerts found."
              : "No active alerts at this time."
            }
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Badge variant={alert.is_resolved ? "outline" : "destructive"}>
                      {alert.is_resolved 
                        ? <Check className="h-3 w-3 mr-1 inline" /> 
                        : <AlertTriangle className="h-3 w-3 mr-1 inline" />
                      }
                      {alert.is_resolved ? "Resolved" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.trigger_reason}</TableCell>
                  <TableCell>
                    {alert.city && <span>{alert.city}</span>}
                    {alert.cluster && <span> - {alert.cluster}</span>}
                    {alert.role && <span> ({alert.role})</span>}
                    {!alert.city && !alert.cluster && !alert.role && <span>Global</span>}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={
                        alert.average_score < 2.5
                          ? "text-red-500 font-medium"
                          : alert.average_score < 3.5
                          ? "text-yellow-500 font-medium"
                          : "text-green-500 font-medium"
                      }
                    >
                      {alert.average_score.toFixed(1)} / 5
                    </span>
                    {alert.change_percentage && (
                      <span 
                        className={
                          alert.change_percentage < 0
                            ? "text-red-500 ml-2"
                            : "text-green-500 ml-2"
                        }
                      >
                        {alert.change_percentage > 0 ? '+' : ''}
                        {alert.change_percentage.toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(alert.created_at), 'PPp')}
                  </TableCell>
                  <TableCell>
                    {!alert.is_resolved && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleResolve(alert)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Resolution</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this alert as resolved? This indicates that you've reviewed and addressed the sentiment issue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={confirmResolve}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SentimentAlerts;
