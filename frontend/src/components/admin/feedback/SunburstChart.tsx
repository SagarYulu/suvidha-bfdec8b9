
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SunburstData {
  name: string;
  value: number;
  children?: SunburstData[];
  color?: string;
}

interface SunburstChartProps {
  data: SunburstData[];
  title?: string;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data, title = "Feedback Distribution" }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">
            Percentage: {((data.value / data.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate totals for percentage calculation
  const dataWithTotals = data.map(item => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Outer ring */}
              <Pie
                data={dataWithTotals}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {dataWithTotals.map((entry, index) => (
                  <Cell key={`outer-cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              
              {/* Inner ring for subcategories if available */}
              {data.some(item => item.children) && (
                <Pie
                  data={data.flatMap(item => item.children || [])}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={20}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {data.flatMap(item => item.children || []).map((entry, index) => (
                    <Cell key={`inner-cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} opacity={0.7} />
                  ))}
                </Pie>
              )}
              
              <Tooltip content={renderCustomTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {dataWithTotals.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SunburstChart;
