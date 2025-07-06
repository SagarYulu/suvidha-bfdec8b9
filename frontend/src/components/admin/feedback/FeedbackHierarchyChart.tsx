
import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface HierarchyData {
  name: string;
  size: number;
  children?: HierarchyData[];
  fill?: string;
}

interface FeedbackHierarchyChartProps {
  data: HierarchyData[];
  isLoading?: boolean;
}

const FeedbackHierarchyChart: React.FC<FeedbackHierarchyChartProps> = ({
  data,
  isLoading = false
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

  const processData = (data: HierarchyData[]): HierarchyData[] => {
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || COLORS[index % COLORS.length],
      children: item.children ? processData(item.children) : undefined
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">Count: {data.size}</p>
          {data.parent && <p className="text-gray-600">Parent: {data.parent}</p>}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-200 animate-pulse rounded flex items-center justify-center">
        <span className="text-gray-500">Loading hierarchy chart...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
        <span className="text-gray-500">No hierarchy data available</span>
      </div>
    );
  }

  const processedData = processData(data);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={processedData}
          dataKey="size"
          aspectRatio={4/3}
          stroke="#fff"
          fill="#8884d8"
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default FeedbackHierarchyChart;
