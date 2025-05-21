
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { calculateWorkingHours, determinePriority } from "@/utils/workingTimeUtils";
import { parseISO } from "date-fns";

interface SLAMetricProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  percentage: number;
  isPositive?: boolean;
}

const SLAMetric = ({ icon, label, count, percentage, isPositive = false }: SLAMetricProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-semibold">{count}</span>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isNaN(percentage) ? '0.0%' : `${percentage.toFixed(1)}%`}
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
          icon={<span className="text-red-500">▼</span>} 
          label="SLA Breached" 
          count={breachedCount} 
          percentage={breachedPercentage} 
        />
        <Separator />
        <SLAMetric 
          icon={<span className="text-green-500">▲</span>} 
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

// SLA breach thresholds in hours - using the same values as in workingTimeUtils.ts
const SLA_THRESHOLDS = {
  firstResponse: 4,    // First response within 4 hours
  resolution: 48,      // Resolution within 48 hours
  openInProgress: 24,  // Open tickets should be resolved within 24 hours
  assignment: 8        // Assigned tickets should be updated within 8 hours
};

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
        <p>Error loading SLA data: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!data || !data.rawIssues || data.rawIssues.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No SLA data available. Please adjust your filters and try again.</p>
      </div>
    );
  }

  const issues = data.rawIssues;
  const now = new Date().toISOString();
  
  // Calculate SLA breaches for each category
  const slaBreaches = {
    overall: { total: 0, breached: 0, withinSLA: 0 },
    closedResolved: { total: 0, breached: 0, withinSLA: 0 },
    openInProgress: { total: 0, breached: 0, withinSLA: 0 },
    firstResponse: { total: 0, breached: 0, withinSLA: 0 }
  };

  // Process each issue to calculate SLA metrics using the same logic as the tickets page
  issues.forEach(issue => {
    const isOpen = issue.status === 'open';
    const isInProgress = issue.status === 'in_progress';
    const isClosed = issue.status === 'closed' || issue.status === 'resolved';
    
    // Add to overall count
    slaBreaches.overall.total++;
    
    // Calculate metrics for closed/resolved tickets
    if (isClosed) {
      slaBreaches.closedResolved.total++;
      
      // Check if ticket was resolved within SLA
      if (issue.closed_at) {
        const resolutionTime = calculateWorkingHours(issue.created_at, issue.closed_at);
        
        if (resolutionTime > SLA_THRESHOLDS.resolution) {
          // SLA breached for resolution
          slaBreaches.closedResolved.breached++;
          slaBreaches.overall.breached++;
        } else {
          // Resolved within SLA
          slaBreaches.closedResolved.withinSLA++;
          slaBreaches.overall.withinSLA++;
        }
      } else {
        // If there's no close timestamp but status is closed (inconsistent data)
        // Mark as breached for safety
        slaBreaches.closedResolved.breached++;
        slaBreaches.overall.breached++;
      }
    }
    
    // Calculate metrics for open and in-progress tickets
    if (isOpen || isInProgress) {
      slaBreaches.openInProgress.total++;
      
      // Check SLA based on working hours elapsed
      const workingHoursElapsed = calculateWorkingHours(issue.created_at, now);
      
      // Using the same threshold as in workingTimeUtils.ts determinePriority function
      if (workingHoursElapsed > SLA_THRESHOLDS.openInProgress) {
        slaBreaches.openInProgress.breached++;
        slaBreaches.overall.breached++;
      } else {
        // Check additional SLA breach conditions matching the tickets page
        let isBreached = false;
        
        // Check if assigned but no update within threshold
        if (issue.assigned_to && issue.updated_at) {
          const hoursSinceLastUpdate = calculateWorkingHours(issue.updated_at, now);
          if (hoursSinceLastUpdate > SLA_THRESHOLDS.assignment) {
            isBreached = true;
          }
        }
        
        // If not already marked as breached, check based on priority
        if (!isBreached) {
          // Use the same priority determination logic as the tickets page
          const calculatedPriority = determinePriority(
            issue.created_at,
            issue.updated_at || issue.created_at,
            issue.status,
            issue.type_id,
            issue.assigned_to
          );
          
          // High or critical priority = SLA breached (matches ticket page logic)
          if (calculatedPriority === 'high' || calculatedPriority === 'critical') {
            isBreached = true;
          }
        }
        
        if (isBreached) {
          slaBreaches.openInProgress.breached++;
          slaBreaches.overall.breached++;
        } else {
          slaBreaches.openInProgress.withinSLA++;
          slaBreaches.overall.withinSLA++;
        }
      }
    }
    
    // Calculate first response SLA for all tickets
    if (issue.issue_comments && issue.issue_comments.length > 0) {
      slaBreaches.firstResponse.total++;
      
      // Sort comments by date to find the first one
      const sortedComments = [...issue.issue_comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const firstResponseTime = calculateWorkingHours(issue.created_at, sortedComments[0].created_at);
      
      if (firstResponseTime > SLA_THRESHOLDS.firstResponse) {
        slaBreaches.firstResponse.breached++;
      } else {
        slaBreaches.firstResponse.withinSLA++;
      }
    } else if (!isClosed) {
      // No comments and ticket is not closed
      slaBreaches.firstResponse.total++;
      
      // Check if past first response SLA
      const hoursElapsed = calculateWorkingHours(issue.created_at, now);
      if (hoursElapsed > SLA_THRESHOLDS.firstResponse) {
        slaBreaches.firstResponse.breached++;
      } else {
        slaBreaches.firstResponse.withinSLA++;
      }
    }
  });

  // Calculate percentages for display
  const getPercentage = (part: number, total: number) => total > 0 ? (part / total) * 100 : 0;

  const overallBreachedPercentage = getPercentage(slaBreaches.overall.breached, slaBreaches.overall.total);
  const overallWithinSLAPercentage = getPercentage(slaBreaches.overall.withinSLA, slaBreaches.overall.total);

  const closedBreachedPercentage = getPercentage(slaBreaches.closedResolved.breached, slaBreaches.closedResolved.total);
  const closedWithinSLAPercentage = getPercentage(slaBreaches.closedResolved.withinSLA, slaBreaches.closedResolved.total);

  const openBreachedPercentage = getPercentage(slaBreaches.openInProgress.breached, slaBreaches.openInProgress.total);
  const openWithinSLAPercentage = getPercentage(slaBreaches.openInProgress.withinSLA, slaBreaches.openInProgress.total);

  const firstResponseBreachedPercentage = getPercentage(slaBreaches.firstResponse.breached, slaBreaches.firstResponse.total);
  const firstResponseWithinSLAPercentage = getPercentage(slaBreaches.firstResponse.withinSLA, slaBreaches.firstResponse.total);

  // Display the dashboard with the accurate counts and percentages
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SLACard
        title="Overall SLA Performance"
        breachedCount={slaBreaches.overall.breached}
        breachedPercentage={overallBreachedPercentage}
        resolvedCount={slaBreaches.overall.withinSLA}
        resolvedPercentage={overallWithinSLAPercentage}
      />
      <SLACard
        title="Closed or Resolved Tickets"
        breachedCount={slaBreaches.closedResolved.breached}
        breachedPercentage={closedBreachedPercentage}
        resolvedCount={slaBreaches.closedResolved.withinSLA}
        resolvedPercentage={closedWithinSLAPercentage}
      />
      <SLACard
        title="Open & In Progress Tickets"
        breachedCount={slaBreaches.openInProgress.breached}
        breachedPercentage={openBreachedPercentage}
        resolvedCount={slaBreaches.openInProgress.withinSLA}
        resolvedPercentage={openWithinSLAPercentage}
      />
      <SLACard
        title="First Response SLA"
        breachedCount={slaBreaches.firstResponse.breached}
        breachedPercentage={firstResponseBreachedPercentage}
        resolvedCount={slaBreaches.firstResponse.withinSLA}
        resolvedPercentage={firstResponseWithinSLAPercentage}
      />
    </div>
  );
};
