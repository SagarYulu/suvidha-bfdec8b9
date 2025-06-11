
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface SLAData {
  category: string;
  target: number;
  actual: number;
  breaches: number;
}

interface SLAAnalysisSectionProps {
  data: SLAData[];
  isLoading?: boolean;
}

const SLAAnalysisSection: React.FC<SLAAnalysisSectionProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SLA Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const mockData: SLAData[] = [
    { category: 'Response Time', target: 2, actual: 1.8, breaches: 5 },
    { category: 'Resolution Time', target: 24, actual: 22, breaches: 3 },
    { category: 'First Contact Resolution', target: 80, actual: 75, breaches: 12 }
  ];

  const displayData = data.length > 0 ? data : mockData;

  const getSLAStatus = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage <= 100) return { icon: TrendingUp, color: 'text-green-600', status: 'Met' };
    return { icon: TrendingDown, color: 'text-red-600', status: 'Breached' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="target" fill="#94a3b8" name="Target" />
                <Bar dataKey="actual" fill="#2563eb" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {displayData.map((item, index) => {
              const status = getSLAStatus(item.actual, item.target);
              const StatusIcon = status.icon;
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.category}</h4>
                    <div className={`flex items-center ${status.color}`}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{status.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Target</p>
                      <p className="font-medium">{item.target}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Actual</p>
                      <p className="font-medium">{item.actual}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Breaches</p>
                      <p className="font-medium text-red-600">{item.breaches}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SLAAnalysisSection;
