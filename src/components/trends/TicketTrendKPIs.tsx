import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendKPIData } from "@/services/issues/ticketTrendService";
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";

interface TicketTrendKPIsProps {
  data: TrendKPIData;
  isLoading: boolean;
}

// Define a comprehensive KPI type that includes all possible properties
interface KPI {
  title: string;
  value: string;
  suffix: string;
  change: number | null;
  icon: React.ReactNode | null;
  color?: string;
  background?: string;
  border?: string;
}

const TicketTrendKPIs: React.FC<TicketTrendKPIsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-100 rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Basic KPIs
  const basicKpis: KPI[] = [
    {
      title: "Total Tickets",
      value: data.totalTickets.toLocaleString(),
      suffix: "",
      change: null,
      icon: null,
    },
    {
      title: "Resolved Tickets",
      value: data.resolvedTickets.toLocaleString(),
      suffix: "",
      change: null,
      icon: null,
    },
    {
      title: "Resolution Rate",
      value: data.resolutionRate.toFixed(1),
      suffix: "%",
      change: null,
      icon: null,
    },
    {
      title: "Open Tickets",
      value: data.openTickets.toLocaleString(),
      suffix: "",
      change: null,
      icon: null,
    }
  ];
  
  // Response time KPIs
  const responseKpis: KPI[] = [
    {
      title: "Avg First Response",
      value: data.firstResponseTime.toFixed(1),
      suffix: "hrs",
      change: null,
      icon: null,
    },
    {
      title: "First Time Resolution",
      value: data.firstTimeResolution.toFixed(1),
      suffix: "%",
      change: null,
      icon: null,
    },
    {
      title: "Avg Resolution Time",
      value: data.averageResolutionTime.toFixed(1),
      suffix: "hrs",
      change: null,
      icon: null,
    }
  ];

  // SLA breach KPIs (highlighted with colors and icons)
  const slaBreachKpis: KPI[] = [
    {
      title: "First Response SLA Breach",
      value: data.firstResponseSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      color: data.firstResponseSLABreach > 5 ? "text-amber-600" : "text-green-600",
      background: data.firstResponseSLABreach > 5 ? "bg-amber-50" : "bg-green-50",
      border: data.firstResponseSLABreach > 5 ? "border-amber-200" : "border-green-200",
    },
    {
      title: "Overall SLA Breach",
      value: data.resolutionSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <Clock className="h-4 w-4 text-red-500" />,
      color: data.resolutionSLABreach > 8 ? "text-red-600" : "text-amber-600",
      background: data.resolutionSLABreach > 8 ? "bg-red-50" : "bg-amber-50",
      border: data.resolutionSLABreach > 8 ? "border-red-200" : "border-amber-200",
    },
    {
      title: "Open Tickets SLA Breach",
      value: data.openTicketsSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: "text-red-600",
      background: "bg-red-50",
      border: "border-red-200",
    },
    {
      title: "Closed Tickets SLA Breach",
      value: data.closedTicketsSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: "text-amber-600",
      background: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      title: "In Progress SLA Breach",
      value: data.inProgressSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: "text-red-600", 
      background: "bg-red-50",
      border: "border-red-200",
    },
    {
      title: "Assignee SLA Breach",
      value: data.assigneeSLABreach.toFixed(1),
      suffix: "%",
      change: null,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: "text-amber-600",
      background: "bg-amber-50",
      border: "border-amber-200",
    }
  ];
  
  // Other KPIs
  const otherKpis: KPI[] = [
    {
      title: "Ticket Reopen Count",
      value: data.reopenCount.toString(),
      suffix: "",
      change: null,
      icon: null,
    },
    {
      title: "Reopen Rate",
      value: data.reopenRate.toFixed(1),
      suffix: "%",
      change: null,
      icon: null,
    }
  ];

  // Combine all KPIs
  const allKpis: KPI[] = [...basicKpis, ...responseKpis, ...slaBreachKpis, ...otherKpis];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allKpis.map((kpi) => (
        <Card 
          key={kpi.title}
          className={kpi.background ? `${kpi.background} ${kpi.border}` : ""}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {kpi.icon && <div>{kpi.icon}</div>}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.color || ""}`}>
              {kpi.value}{kpi.suffix}
            </div>
            {kpi.change !== null && (
              <p className={`text-xs flex items-center mt-1 ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(kpi.change)}% vs. previous
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TicketTrendKPIs;
