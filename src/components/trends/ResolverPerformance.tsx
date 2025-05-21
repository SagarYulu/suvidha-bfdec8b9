
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/utils/csvExportUtils";
import { ClosureByAssignee } from "@/services/issues/ticketTrendService";

interface ResolverPerformanceProps {
  resolvers: ClosureByAssignee[];
  isLoading: boolean;
}

const ResolverPerformance: React.FC<ResolverPerformanceProps> = ({ resolvers, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort resolvers by closed tickets (descending)
  const sortedResolvers = [...resolvers].sort((a, b) => b.closedTickets - a.closedTickets);

  const handleExport = () => {
    const data = sortedResolvers.map(resolver => ({
      'Assignee': resolver.assigneeName,
      'Closed Tickets': resolver.closedTickets,
      'Avg. Resolution Time (hours)': resolver.averageResolutionTime.toFixed(1)
    }));
    
    exportToCSV(data, `resolver-performance-${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (!resolvers || resolvers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Closure by Assignee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
            <p>No assignee data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ticket Closure by Assignee</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Closed Tickets</TableHead>
              <TableHead className="text-right">Avg. Resolution Time</TableHead>
              <TableHead className="text-right">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResolvers.slice(0, 5).map((resolver) => {
              // Calculate performance indicator based on resolution time
              // Lower resolution time = better performance
              let performanceClass = "bg-gray-100 text-gray-800";
              if (resolver.averageResolutionTime < 24) {
                performanceClass = "bg-green-100 text-green-800";
              } else if (resolver.averageResolutionTime < 48) {
                performanceClass = "bg-yellow-100 text-yellow-800";
              } else {
                performanceClass = "bg-red-100 text-red-800";
              }
              
              return (
                <TableRow key={resolver.assigneeId}>
                  <TableCell>{resolver.assigneeName}</TableCell>
                  <TableCell className="text-right font-medium">{resolver.closedTickets}</TableCell>
                  <TableCell className="text-right">
                    {resolver.averageResolutionTime.toFixed(1)} hrs
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${performanceClass}`}>
                      {resolver.averageResolutionTime < 24
                        ? "Excellent"
                        : resolver.averageResolutionTime < 48
                        ? "Good"
                        : "Needs Improvement"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResolverPerformance;
