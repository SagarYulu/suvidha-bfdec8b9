
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendKPIData } from "@/services/issues/ticketTrendService";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TicketTrendKPIsProps {
  data: TrendKPIData;
  isLoading: boolean;
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

  const kpis = [
    {
      title: "Total Tickets",
      value: data.totalTickets.toLocaleString(),
      suffix: "",
      change: null,
    },
    {
      title: "Resolved Tickets",
      value: data.resolvedTickets.toLocaleString(),
      suffix: "",
      change: null,
    },
    {
      title: "Resolution Rate",
      value: data.resolutionRate.toFixed(1),
      suffix: "%",
      change: null,
    },
    {
      title: "Open Tickets",
      value: data.openTickets.toLocaleString(),
      suffix: "",
      change: null,
    },
    {
      title: "Avg First Response",
      value: data.firstResponseTime.toFixed(1),
      suffix: "hrs",
      change: null,
    },
    {
      title: "First Response SLA Breach",
      value: data.firstResponseSLABreach.toFixed(1),
      suffix: "%",
      change: null,
    },
    {
      title: "First Time Resolution",
      value: data.firstTimeResolution.toFixed(1),
      suffix: "%",
      change: null,
    },
    {
      title: "Avg Resolution Time",
      value: data.averageResolutionTime.toFixed(1),
      suffix: "hrs",
      change: null,
    },
    {
      title: "Resolution SLA Breach",
      value: data.resolutionSLABreach.toFixed(1),
      suffix: "%",
      change: null,
    },
    {
      title: "Ticket Reopen Count",
      value: data.reopenCount.toString(),
      suffix: "",
      change: null,
    },
    {
      title: "Reopen Rate",
      value: data.reopenRate.toFixed(1),
      suffix: "%",
      change: null,
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
