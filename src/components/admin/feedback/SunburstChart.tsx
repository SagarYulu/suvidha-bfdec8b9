
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';
import { TooltipProps } from 'recharts/types/component/Tooltip';

// Define the data structure for sunburst chart
export interface SunburstItem {
  id: string;
  name: string;
  value: number;
  color: string;
  children?: SunburstItem[];
}

interface SunburstChartProps {
  data: SunburstItem[];
  title?: string;
  totalCount: number;
}

// Custom tooltip for the Sunburst chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isChild = data.parent !== undefined;
    const name = data.name;
    const value = data.value;
    const parentName = isChild ? data.parent : null;
    const percentage = isChild 
      ? `${((value / data.parentValue) * 100).toFixed(1)}% of ${parentName}`
      : `${((value / data.totalValue) * 100).toFixed(1)}% of total`;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        {isChild && (
          <div className="font-medium mb-1 text-gray-600">{parentName} &gt; {name}</div>
        )}
        {!isChild && (
          <div className="font-medium mb-1">{name}</div>
        )}
        <div className="text-sm">
          <div><span className="font-medium">Count:</span> {value}</div>
          <div><span className="font-medium">Percentage:</span> {percentage}</div>
        </div>
      </div>
    );
  }
  return null;
};

// Define active shape for hover effect
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value
  } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      {innerRadius === 0 && (
        <text 
          x={cx} 
          y={cy} 
          textAnchor="middle" 
          fill="#333"
          fontSize={12}
          fontWeight="bold"
        >
          {payload.name}
        </text>
      )}
    </g>
  );
};

const SunburstChart: React.FC<SunburstChartProps> = ({ 
  data, 
  title = "Feedback Breakdown",
  totalCount
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Flatten data for simpler rendering
  const processData = (data: SunburstItem[]) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const outerRingData: any[] = [];
    const innerRingData = data.map((item, index) => {
      // Process children if they exist
      if (item.children && item.children.length > 0) {
        item.children.forEach((child, childIndex) => {
          outerRingData.push({
            id: `${item.id}-${child.id}`,
            name: child.name,
            value: child.value,
            color: child.color || generateShade(item.color, childIndex),
            parent: item.name,
            parentValue: item.value,
            totalValue,
            parentIndex: index
          });
        });
      }
      
      return {
        id: item.id,
        name: item.name,
        value: item.value,
        color: item.color,
        totalValue
      };
    });
    
    return { innerRingData, outerRingData };
  };
  
  // Generate shade variants for sub-categories
  const generateShade = (baseColor: string, index: number) => {
    // Simple shade generation based on index
    switch(index % 3) {
      case 0: return baseColor; // Same as base
      case 1: return lightenDarkenColor(baseColor, 30); // Lighter
      case 2: return lightenDarkenColor(baseColor, -20); // Darker
      default: return baseColor;
    }
  };
  
  // Helper function to lighten or darken a hex color
  const lightenDarkenColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, R + percent));
    G = Math.min(255, Math.max(0, G + percent));
    B = Math.min(255, Math.max(0, B + percent));

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  };
  
  // Check if data is loading or empty
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState message="No feedback data available for the selected period." />
        </CardContent>
      </Card>
    );
  }

  const { innerRingData, outerRingData } = processData(data);
  
  const onPieEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Center text showing total count */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium"
              >
                <tspan x="50%" dy="-10">Total Feedback</tspan>
                <tspan x="50%" dy="20" fontSize="18" fontWeight="bold">
                  {totalCount}
                </tspan>
              </text>
              
              {/* Inner ring - Main categories */}
              <Pie
                data={innerRingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                activeIndex={activeIndex === null ? undefined : activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {innerRingData.map((entry, index) => (
                  <Cell 
                    key={`cell-inner-${index}`} 
                    fill={entry.color} 
                    stroke="#fff" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              
              {/* Outer ring - Sub-categories */}
              <Pie
                data={outerRingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={1}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {outerRingData.map((entry, index) => (
                  <Cell 
                    key={`cell-outer-${index}`} 
                    fill={entry.color} 
                    stroke="#fff" 
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SunburstChart;
