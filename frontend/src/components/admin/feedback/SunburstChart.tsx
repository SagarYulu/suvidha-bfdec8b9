
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface SunburstData {
  name: string;
  value: number;
  children?: SunburstData[];
  fill?: string;
}

interface SunburstChartProps {
  data: SunburstData[];
  width?: number;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SunburstChart: React.FC<SunburstChartProps> = ({ 
  data, 
  width = 400, 
  height = 400 
}) => {
  // Flatten the hierarchical data for the chart
  const flattenData = (items: SunburstData[], level = 0): any[] => {
    let result: any[] = [];
    
    items.forEach((item, index) => {
      result.push({
        ...item,
        fill: COLORS[index % COLORS.length],
        level
      });
      
      if (item.children) {
        result = result.concat(flattenData(item.children, level + 1));
      }
    });
    
    return result;
  };

  const flatData = flattenData(data);
  const innerData = flatData.filter(item => item.level === 0);
  const outerData = flatData.filter(item => item.level === 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">Value: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Inner ring */}
          <Pie
            data={innerData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {innerData.map((entry, index) => (
              <Cell key={`inner-cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          
          {/* Outer ring */}
          {outerData.length > 0 && (
            <Pie
              data={outerData}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120}
              paddingAngle={1}
              dataKey="value"
            >
              {outerData.map((entry, index) => (
                <Cell key={`outer-cell-${index}`} fill={entry.fill} opacity={0.7} />
              ))}
            </Pie>
          )}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SunburstChart;
