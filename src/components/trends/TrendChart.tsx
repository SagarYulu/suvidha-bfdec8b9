
import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface TrendDataPoint {
  date: string;
  count?: number;
  avgResolutionHours?: number;
  [key: string]: any;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  timeRange: '7days' | '30days' | '90days';
  chartType?: 'line' | 'area' | 'bar';
  dataKey?: string;
  label?: string;
  isStacked?: boolean;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
  "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"
];

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  timeRange,
  chartType = 'line',
  dataKey = 'count',
  label = 'Tickets',
  isStacked = false,
}) => {
  // Format the date based on the time range
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      if (timeRange === '7days') {
        return format(date, 'EEE');
      } else if (timeRange === '30days') {
        return format(date, 'dd MMM');
      } else {
        return format(date, 'dd MMM');
      }
    } catch (e) {
      return tickItem;
    }
  };

  // Custom tooltip formatter
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 bg-white shadow-lg border border-gray-200">
          <p className="font-medium">{format(new Date(label), 'dd MMM yyyy')}</p>
          <div className="mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Extract all data keys (excluding 'date') for stacked charts
  const dataKeys = isStacked 
    ? Object.keys(data[0]).filter(key => key !== 'date' && key !== 'count') 
    : [dataKey];

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={renderTooltip} />
          <Legend />
          {isStacked ? (
            dataKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                name={key} 
                stackId="1"
                stroke={COLORS[index % COLORS.length]} 
                fill={`url(#color${key})`} 
              />
            ))
          ) : (
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              name={label} 
              stroke={COLORS[0]} 
              fill="url(#colorcount)" 
            />
          )}
        </AreaChart>
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Legend />
          {isStacked ? (
            dataKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                name={key} 
                stackId="a"
                fill={COLORS[index % COLORS.length]} 
              />
            ))
          ) : (
            <Bar dataKey={dataKey} name={label} fill={COLORS[0]} />
          )}
        </BarChart>
      );
    } else { // Default to line chart
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Legend />
          {isStacked ? (
            dataKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                name={key} 
                stroke={COLORS[index % COLORS.length]}
                activeDot={{ r: 8 }} 
              />
            ))
          ) : (
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              name={label} 
              stroke={COLORS[0]}
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          )}
        </LineChart>
      );
    }
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
