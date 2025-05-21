
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Clock, HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AboutDataCardProps {
  dataCount: number;
}

const AboutDataCard: React.FC<AboutDataCardProps> = ({ dataCount }) => {
  return (
    <Card className="bg-white/10 text-white">
      <CardContent className="p-4 space-y-4">
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
        
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 mt-0.5 text-blue-300" />
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium mb-1 mr-1">Resolution Time</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-blue-300" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Resolution time is calculated in working hours (9 AM - 5 PM on weekdays only).</p>
                    <p className="mt-1">For example, an issue created at 4 PM on Friday and resolved at 10 AM on Monday 
                    would have a resolution time of 2 hours (1 hour on Friday + 1 hour on Monday).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm opacity-80">
              All resolution times are calculated in <span className="font-medium">working hours only</span> (9 AM - 5 PM, weekdays), 
              excluding weekends and holidays.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutDataCard;
