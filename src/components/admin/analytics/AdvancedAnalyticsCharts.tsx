
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedFilters } from "./types";

interface AdvancedAnalyticsChartsProps {
  filters: AdvancedFilters;
}

export const AdvancedAnalyticsCharts: React.FC<AdvancedAnalyticsChartsProps> = ({ filters }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <p>Advanced analytics visualization has been disabled.</p>
            <p className="mt-2 text-sm">Contact your administrator for more information.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
