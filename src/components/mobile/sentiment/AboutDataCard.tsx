
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface AboutDataCardProps {
  dataCount: number;
}

const AboutDataCard: React.FC<AboutDataCardProps> = ({ dataCount }) => {
  return (
    <Card className="bg-white/10 text-white">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 mt-0.5 text-blue-300" />
          <div>
            <h3 className="text-lg font-medium mb-1">About This Data</h3>
            <p className="text-sm opacity-80 mb-2">
              Analysis based on {dataCount} feedback submissions received from employees.
            </p>
            <p className="text-sm opacity-80">
              Topics are extracted from feedback comments using natural language processing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutDataCard;
