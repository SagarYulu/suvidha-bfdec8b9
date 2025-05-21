
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TicketSpike {
  date: string;
  count: number;
  percentageIncrease: number;
}

interface TicketSpikeAlertsProps {
  spikes: TicketSpike[];
  isLoading: boolean;
}

const TicketSpikeAlerts: React.FC<TicketSpikeAlertsProps> = ({ spikes, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse h-6 w-32 bg-gray-200 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!spikes || spikes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Spike Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
            <p>No significant ticket spikes detected in the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Spike Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ticket Count</TableHead>
              <TableHead>Increase</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spikes.map((spike, index) => (
              <TableRow key={index}>
                <TableCell>
                  {format(parseISO(spike.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{spike.count}</TableCell>
                <TableCell className="flex items-center text-red-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {spike.percentageIncrease.toFixed(1)}%
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      spike.percentageIncrease > 100
                        ? "bg-red-100 text-red-800"
                        : spike.percentageIncrease > 75
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {spike.percentageIncrease > 100
                      ? "Critical"
                      : spike.percentageIncrease > 75
                      ? "High"
                      : "Medium"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TicketSpikeAlerts;
