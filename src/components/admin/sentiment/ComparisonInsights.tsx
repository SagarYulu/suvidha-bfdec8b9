
import React from 'react';

export interface InsightData {
  label: string;
  value: number | string;
  change: number;
}

interface ComparisonInsightsProps {
  insights: InsightData[];
}

const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">{insight.label}</h4>
          <div className="mt-2">
            <span className="text-lg font-bold">{insight.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparisonInsights;
