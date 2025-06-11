
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown, Bell } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
}

interface SentimentAlertsProps {
  alerts: AlertItem[];
}

const SentimentAlerts: React.FC<SentimentAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <TrendingDown className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
          {getAlertIcon(alert.type)}
          <AlertDescription>
            <div className="flex justify-between items-start">
              <span>{alert.message}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default SentimentAlerts;
