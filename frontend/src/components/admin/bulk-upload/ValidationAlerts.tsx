
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationAlert {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  count?: number;
}

interface ValidationAlertsProps {
  alerts: ValidationAlert[];
}

const ValidationAlerts: React.FC<ValidationAlertsProps> = ({ alerts }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={getVariant(alert.type)}>
          {getIcon(alert.type)}
          <AlertDescription>
            {alert.message}
            {alert.count && <span className="font-medium ml-1">({alert.count})</span>}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ValidationAlerts;
