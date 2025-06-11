
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText } from 'lucide-react';

interface SubmissionData {
  date: string;
  submissions: number;
  totalTickets: number;
  rate: number;
}

interface FeedbackSubmissionRateProps {
  data: SubmissionData[];
  totalSubmissions: number;
  totalTickets: number;
  averageRate: number;
}

const FeedbackSubmissionRate: React.FC<FeedbackSubmissionRateProps> = ({
  data,
  totalSubmissions,
  totalTickets,
  averageRate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Submission Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Submissions</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalSubmissions}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Total Tickets</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{totalTickets}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Average Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{averageRate}%</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value}%`, 'Submission Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
