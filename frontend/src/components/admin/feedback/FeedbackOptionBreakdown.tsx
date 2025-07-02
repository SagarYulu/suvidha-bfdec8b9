
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface FeedbackOption {
  option: string;
  count: number;
  percentage: number;
}

interface FeedbackOptionBreakdownProps {
  options: FeedbackOption[];
}

const FeedbackOptionBreakdown: React.FC<FeedbackOptionBreakdownProps> = ({
  options = []
}) => {
  const mockOptions: FeedbackOption[] = [
    { option: 'Service Quality', count: 45, percentage: 35 },
    { option: 'Response Time', count: 32, percentage: 25 },
    { option: 'Resolution Speed', count: 28, percentage: 22 },
    { option: 'Communication', count: 23, percentage: 18 }
  ];

  const displayOptions = options.length > 0 ? options : mockOptions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Options Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayOptions}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="option"
              >
                {displayOptions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackOptionBreakdown;
