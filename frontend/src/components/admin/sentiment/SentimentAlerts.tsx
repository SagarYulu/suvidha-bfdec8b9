
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bell, TrendingDown, Users, MapPin } from 'lucide-react';

interface SentimentAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  location?: string;
  affectedUsers?: number;
  trend?: 'up' | 'down' | 'stable';
  createdAt: string;
  isRead: boolean;
}

interface SentimentAlertsProps {
  alerts: SentimentAlert[];
  isLoading?: boolean;
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
}

const SentimentAlerts: React.FC<SentimentAlertsProps> = ({
  alerts,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: string): 'default' | 'destructive' | 'outline' => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Sentiment Alerts
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadAlerts.length}
              </Badge>
            )}
          </CardTitle>
          {unreadAlerts.length > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sentiment alerts at this time
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={getAlertVariant(alert.type)}
                className={`cursor-pointer transition-opacity ${
                  alert.isRead ? 'opacity-60' : ''
                }`}
                onClick={() => !alert.isRead && onMarkAsRead(alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        {getTrendIcon(alert.trend)}
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.description}
                      </AlertDescription>
                      
                      {/* Additional metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        {alert.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                        {alert.affectedUsers && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{alert.affectedUsers} users affected</span>
                          </div>
                        )}
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAlerts;
