
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getIssueTypeLabel } from "@/services/issues/issueTypeHelpers";

type ChartSectionProps = {
  typePieData: any[];
  cityBarData: any[];
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const ChartSection = memo(({ typePieData, cityBarData, isLoading }: ChartSectionProps) => {
  if (isLoading) return null;
  
  // Constants for chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

  // Format the issue type names for better display
  const formattedTypePieData = typePieData.map(item => ({
    ...item,
    name: getIssueTypeLabel(item.name) // Use the helper to get readable labels
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {formattedTypePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedTypePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {formattedTypePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tickets by City</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {cityBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityBarData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Tickets" fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

// Display name for debugging
ChartSection.displayName = 'ChartSection';

export default ChartSection;
