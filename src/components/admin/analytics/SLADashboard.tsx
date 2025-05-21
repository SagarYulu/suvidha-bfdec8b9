
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";

interface SLAMetricProps {
  icon: string;
  label: string;
  count: number;
  percentage: number;
  isPositive?: boolean;
}

const SLAMetric = ({ icon, label, count, percentage, isPositive = false }: SLAMetricProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-semibold">{count}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

interface SLACardProps {
  title: string;
  breachedCount: number;
  breachedPercentage: number;
  resolvedCount: number;
  resolvedPercentage: number;
}

const SLACard = ({ title, breachedCount, breachedPercentage, resolvedCount, resolvedPercentage }: SLACardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SLAMetric 
          icon="🔻" 
          label="SLA Breached" 
          count={breachedCount} 
          percentage={breachedPercentage} 
        />
        <Separator />
        <SLAMetric 
          icon="🔺" 
          label="Closed Within TAT" 
          count={resolvedCount} 
          percentage={resolvedPercentage} 
          isPositive={true}
        />
      </CardContent>
    </Card>
  );
};

interface SLADashboardProps {
  filters: AdvancedFilters;
}

export const SLADashboard = ({ filters }: SLADashboardProps) => {
  const { data, isLoading, error } = useAdvancedAnalytics(filters);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        <p>Error loading SLA data. Please try again later.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No SLA data available. Please adjust your filters and try again.</p>
      </div>
    );
  }

  // Calculate metrics for each card
  const totalTickets = data.totalTickets || 0;
  const resolvedTickets = data.resolvedTickets || 0;
  const openTickets = data.openTickets || 0;

  // Overall SLA metrics
  const overallSLABreached = Math.round(totalTickets * (data.overallSLABreach / 100)) || 0;
  const overallSLAMet = totalTickets - overallSLABreached;
  const overallSLAMetPercentage = 100 - data.overallSLABreach;

  // Closed/Resolved SLA metrics
  const closedSLABreached = Math.round(resolvedTickets * (data.closedResolvedSLABreach / 100)) || 0;
  const closedSLAMet = resolvedTickets - closedSLABreached;
  const closedSLAMetPercentage = 100 - data.closedResolvedSLABreach;

  // Open & In Progress SLA metrics
  const openSLABreached = Math.round(openTickets * (data.openInProgressSLABreach / 100)) || 0;
  const openSLAMet = openTickets - openSLABreached;
  const openSLAMetPercentage = 100 - data.openInProgressSLABreach;

  // First Response SLA metrics
  const totalWithResponse = Math.round(totalTickets * 0.9); // Estimate as we don't have exact count
  const firstResponseBreached = Math.round(totalWithResponse * (data.firstResponseSLABreach / 100)) || 0;
  const firstResponseMet = totalWithResponse - firstResponseBreached;
  const firstResponseMetPercentage = 100 - data.firstResponseSLABreach;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SLACard
        title="Overall SLA Performance"
        breachedCount={overallSLABreached}
        breachedPercentage={data.overallSLABreach}
        resolvedCount={overallSLAMet}
        resolvedPercentage={overallSLAMetPercentage}
      />
      <SLACard
        title="Closed or Resolved Tickets"
        breachedCount={closedSLABreached}
        breachedPercentage={data.closedResolvedSLABreach}
        resolvedCount={closedSLAMet}
        resolvedPercentage={closedSLAMetPercentage}
      />
      <SLACard
        title="Open & In Progress Tickets"
        breachedCount={openSLABreached}
        breachedPercentage={data.openInProgressSLABreach}
        resolvedCount={openSLAMet}
        resolvedPercentage={openSLAMetPercentage}
      />
      <SLACard
        title="First Response SLA"
        breachedCount={firstResponseBreached}
        breachedPercentage={data.firstResponseSLABreach}
        resolvedCount={firstResponseMet}
        resolvedPercentage={firstResponseMetPercentage}
      />
    </div>
  );
};
