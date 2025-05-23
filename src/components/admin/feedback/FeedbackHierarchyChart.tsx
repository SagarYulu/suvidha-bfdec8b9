
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

// Define interfaces for our data structure
export interface SubReasonItem {
  id: string;
  name: string;
  value: number;
  sentiment: string;
  percentage: number;
}

export interface SentimentGroup {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  subReasons: SubReasonItem[];
}

interface FeedbackHierarchyChartProps {
  data: SentimentGroup[];
  totalCount: number;
}

// Color map for the dot indicators
const colorMap = {
  happy: '#4ade80',  // Green
  neutral: '#fde047', // Yellow
  sad: '#f87171'     // Red
};

const FeedbackHierarchyChart: React.FC<FeedbackHierarchyChartProps> = ({ data, totalCount }) => {
  // Check if we have data to display
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment & Reason Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-500">No feedback data available to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment & Reason Breakdown</CardTitle>
        <CardDescription>
          Total responses: {totalCount}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.sort((a, b) => {
            // Custom sort: Happy first, then Neutral, then Sad
            const order = { "happy": 0, "neutral": 1, "sad": 2 };
            return order[a.id as keyof typeof order] - order[b.id as keyof typeof order];
          }).map((sentiment) => (
            <div key={sentiment.id} className="space-y-2">
              {/* Sentiment header */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: sentiment.color }}
                />
                <span className="font-medium">
                  {sentiment.name} ({sentiment.value} | {sentiment.percentage.toFixed(1)}%)
                </span>
              </div>
              
              {/* Sub-reasons list */}
              <div className="ml-5 space-y-2">
                {sentiment.subReasons.sort((a, b) => b.value - a.value).map((subReason) => (
                  <div key={subReason.id} className="flex items-start">
                    <span className="text-gray-400 mr-2">{'>'}</span>
                    <span>
                      {subReason.name} ({subReason.value} | {subReason.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
                
                {/* Show message when no sub-reasons */}
                {sentiment.subReasons.length === 0 && (
                  <div className="text-gray-400 italic ml-2">
                    No specific reasons provided
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackHierarchyChart;
