
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SunburstData {
  name: string;
  value: number;
  children?: SunburstData[];
}

interface SunburstChartProps {
  data: SunburstData[];
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const SunburstChart: React.FC<SunburstChartProps> = ({
  data,
  title = "Feedback Distribution"
}) => {
  const mockData: SunburstData[] = [
    { name: 'Service', value: 400, children: [
      { name: 'Quality', value: 200 },
      { name: 'Speed', value: 200 }
    ]},
    { name: 'Support', value: 300, children: [
      { name: 'Response', value: 150 },
      { name: 'Resolution', value: 150 }
    ]},
    { name: 'Product', value: 300, children: [
      { name: 'Features', value: 100 },
      { name: 'Usability', value: 200 }
    ]}
  ];

  const displayData = data.length > 0 ? data : mockData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {displayData.some(item => item.children) && (
                <Pie
                  data={displayData.flatMap(item => item.children || [])}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {displayData.flatMap(item => item.children || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              )}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SunburstChart;
