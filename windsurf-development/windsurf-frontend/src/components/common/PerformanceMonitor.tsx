
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkStatus: 'online' | 'offline';
  pageLoadTime: number;
  apiResponseTime: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    networkStatus: 'online',
    pageLoadTime: 0,
    apiResponseTime: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Simulate performance metrics
      setMetrics({
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        networkStatus: navigator.onLine ? 'online' : 'offline',
        pageLoadTime: performance.now(),
        apiResponseTime: Math.random() * 500 + 100
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value > thresholds.danger) return 'destructive';
    if (value > thresholds.warning) return 'outline';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Cpu className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">CPU Usage</div>
            <Badge variant={getStatusColor(metrics.cpuUsage, { warning: 60, danger: 80 })}>
              {metrics.cpuUsage.toFixed(1)}%
            </Badge>
          </div>

          <div className="text-center">
            <HardDrive className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">Memory</div>
            <Badge variant={getStatusColor(metrics.memoryUsage, { warning: 70, danger: 90 })}>
              {metrics.memoryUsage.toFixed(1)}%
            </Badge>
          </div>

          <div className="text-center">
            <Wifi className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">Network</div>
            <Badge variant={metrics.networkStatus === 'online' ? 'default' : 'destructive'}>
              {metrics.networkStatus}
            </Badge>
          </div>

          <div className="text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm font-medium">API Response</div>
            <Badge variant={getStatusColor(metrics.apiResponseTime, { warning: 300, danger: 500 })}>
              {metrics.apiResponseTime.toFixed(0)}ms
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
