import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { TooltipProps } from 'recharts/types/component/Tooltip';

// Define the data structure for sunburst chart
export interface SunburstItem {
  id: string;
  name: string;
  value: number;
  color: string;
  children?: SunburstItem[];
}

interface EnhancedSunburstChartProps {
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
          <div className="font-medium mb-1 text-gray-600">
            <span style={{ color: data.color }}>{parentName}</span> &gt; {name}
          </div>
        )}
        {!isChild && (
          <div className="font-medium mb-1" style={{ color: data.color }}>{name}</div>
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

// Define active shape for hover effect with enhanced styling
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value, percent
  } = props;
  
  // Format percentage for display
  const displayPercent = percent ? `${(percent * 100).toFixed(1)}%` : '';
  
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
        className="drop-shadow-sm"
      />
      
      {/* Percentage label for outer segments */}
      {innerRadius > 40 && percent && percent > 0.03 && (
        <text 
          x={cx + (innerRadius + (outerRadius - innerRadius) / 2) * Math.cos(((startAngle + endAngle) / 2) * Math.PI / 180)}
          y={cy + (innerRadius + (outerRadius - innerRadius) / 2) * Math.sin(((startAngle + endAngle) / 2) * Math.PI / 180)}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight="bold"
        >
          {displayPercent}
        </text>
      )}
      
      {/* Category label for inner ring */}
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

const EnhancedSunburstChart: React.FC<EnhancedSunburstChartProps> = ({ 
  data, 
  title = "Feedback Breakdown",
  totalCount
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Flatten data for simpler rendering with improved color handling
  const processData = (data: SunburstItem[]) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const outerRingData: any[] = [];
    const innerRingData = data.map((item, index) => {
      // Generate gradient colors for sentiment categories
      let baseColor = item.color || '#999999';
      
      // Process children if they exist
      if (item.children && item.children.length > 0) {
        // Sort children by value (descending)
        const sortedChildren = [...item.children].sort((a, b) => b.value - a.value);
        
        // Take only top 3 if there are more
        const topChildren = sortedChildren.slice(0, 3);
        
        topChildren.forEach((child, childIndex) => {
          // Generate gradient shades based on value rank
          const shadeIntensity = 1 - (childIndex * 0.15); // Darker for higher counts
          
          outerRingData.push({
            id: `${item.id}-${child.id}`,
            name: child.name,
            value: child.value,
            color: generateShade(baseColor, shadeIntensity),
            parent: item.name,
            parentValue: item.value,
            totalValue,
            parentIndex: index,
            percent: child.value / item.value // Percentage within parent
          });
        });
      }
      
      return {
        id: item.id,
        name: item.name,
        value: item.value,
        color: baseColor,
        totalValue,
        percent: item.value / totalValue // Overall percentage
      };
    });
    
    return { innerRingData, outerRingData };
  };
  
  // Generate shade variants using HSL for better gradients
  const generateShade = (baseColor: string, intensity: number): string => {
    // Convert hex to RGB
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        default:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }
    
    // Adjust lightness based on intensity while keeping hue and saturation
    const adjustedL = Math.min(0.9, Math.max(0.2, l * intensity));
    
    // Convert back to hex
    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    
    const [adjustedR, adjustedG, adjustedB] = hslToRgb(h, s, adjustedL);
    
    // Convert back to hex
    return `#${((1 << 24) | (adjustedR << 16) | (adjustedG << 8) | adjustedB).toString(16).slice(1)}`;
  };
  
  // Check if data is loading or empty
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
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
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Generate legend items from combined inner and outer ring data
  const generateLegendItems = () => {
    // Start with main categories
    const legendItems = innerRingData.map(item => ({
      name: item.name,
      color: item.color,
      value: item.value,
      percent: item.percent
    }));
    
    return legendItems;
  };

  const legendItems = generateLegendItems();

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg font-medium">{title}</CardTitle>
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
              >
                <tspan x="50%" dy="-10" className="text-sm font-medium text-gray-600">
                  Total Feedback
                </tspan>
                <tspan x="50%" dy="20" fontSize="18" fontWeight="bold">
                  {totalCount}
                </tspan>
                <tspan x="50%" dy="20" className="text-xs text-gray-500">
                  Sentiment Breakdown
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
                    className="focus:outline-none hover:opacity-90 transition-opacity"
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
                    strokeWidth={1.5}
                    className="focus:outline-none hover:opacity-90 transition-opacity"
                  />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend section */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {legendItems.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({(item.percent * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSunburstChart;
