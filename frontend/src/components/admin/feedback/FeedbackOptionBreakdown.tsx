
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OptionData {
  option: string;
  count: number;
  percentage: number;
  category: string;
}

interface FeedbackOptionBreakdownProps {
  data: OptionData[] | undefined;
  isLoading?: boolean;
}

const FeedbackOptionBreakdown: React.FC<FeedbackOptionBreakdownProps> = ({
  data,
  isLoading = false
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No feedback option data available
        </CardContent>
      </Card>
    );
  }

  // Group data by category for better visualization
  const categoryData = data.reduce((acc: Record<string, OptionData[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(categoryData).map(([category, options], categoryIndex) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category} Feedback Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={options}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="option" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Count']}
                      labelFormatter={(label) => `Option: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill={COLORS[categoryIndex % COLORS.length]}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={options}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ option, percentage }) => 
                        `${option}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {options.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Table */}
            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Option</th>
                      <th className="text-right p-2">Count</th>
                      <th className="text-right p-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((option, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-2">{option.option}</td>
                        <td className="text-right p-2">{option.count}</td>
                        <td className="text-right p-2">{option.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedbackOptionBreakdown;
