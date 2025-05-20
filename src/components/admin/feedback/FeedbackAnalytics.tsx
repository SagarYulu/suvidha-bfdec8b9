
import React, { useState, useEffect } from "react";
import { getFeedbackStats, getResolverLeaderboard, FeedbackStats, ResolverStats } from "@/services/resolutionFeedbackService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FeedbackStars from "@/components/mobile/issues/FeedbackStars";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emojiMap: Record<number, string> = {
  1: "😠",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

interface FeedbackAnalyticsProps {
  cities?: string[];
  clusters?: string[];
  ticketTypes?: { id: string; name: string }[];
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
  cities = [],
  clusters = [],
  ticketTypes = []
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [selectedResolver, setSelectedResolver] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState<{start?: string; end?: string}>({});
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [resolvers, setResolvers] = useState<ResolverStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const feedbackStats = await getFeedbackStats({
          city: selectedCity || undefined,
          cluster: selectedCluster || undefined,
          resolverUuid: selectedResolver || undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
          ticketCategory: selectedCategory || undefined
        });
        
        const resolversData = await getResolverLeaderboard({
          city: selectedCity || undefined,
          cluster: selectedCluster || undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
          ticketCategory: selectedCategory || undefined
        });
        
        setStats(feedbackStats);
        setResolvers(resolversData);
      } catch (error) {
        console.error("Error fetching feedback analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCity, selectedCluster, selectedResolver, selectedCategory, dateRange]);

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case "city":
        setSelectedCity(value);
        // Reset cluster if city changes
        setSelectedCluster("");
        break;
      case "cluster":
        setSelectedCluster(value);
        break;
      case "resolver":
        setSelectedResolver(value);
        break;
      case "category":
        setSelectedCategory(value);
        break;
      default:
        break;
    }
  };

  const handleDateChange = (startDate?: string, endDate?: string) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const renderEmojiBreakdown = () => {
    if (!stats) return null;
    
    const totalRatings = Object.values(stats.ratingCounts).reduce((a, b) => a + b, 0);
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Sentiment Breakdown</h4>
        {Object.entries(stats.ratingCounts).map(([rating, count]) => {
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          return (
            <div key={rating} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  {emojiMap[parseInt(rating)]} {["Very Unhappy", "Unhappy", "Not Sure", "Happy", "Very Happy"][parseInt(rating) - 1]}
                </span>
                <span>{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FilterIcon className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">City</label>
              <Select value={selectedCity} onValueChange={(v) => handleFilterChange("city", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Cluster</label>
              <Select value={selectedCluster} onValueChange={(v) => handleFilterChange("cluster", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clusters</SelectItem>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Ticket Category</label>
              <Select value={selectedCategory} onValueChange={(v) => handleFilterChange("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date filters would be here with a DateRangePicker component */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Date Range</label>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{dateRange.start && dateRange.end ? 
                  `${format(new Date(dateRange.start), "PP")} - ${format(new Date(dateRange.end), "PP")}` : 
                  "Select dates"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            <div className="flex justify-center mb-2">
              <FeedbackStars 
                rating={Math.round(stats?.averageRating || 0)} 
                readOnly 
                size={20}
              />
            </div>
            <div className="text-2xl font-bold">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "-"} / 5
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.feedbackReceived || 0}</div>
            <p className="text-xs text-muted-foreground">
              Out of {stats?.totalFeedback || 0} closed tickets
            </p>
            <Progress 
              className="mt-2" 
              value={stats?.feedbackPercentage || 0} 
            />
            <p className="text-xs text-right mt-1">
              {stats?.feedbackPercentage ? Math.round(stats.feedbackPercentage) : 0}% participation rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {renderEmojiBreakdown()}
          </CardContent>
        </Card>
      </div>
      
      {/* Resolver Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Resolver Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resolvers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resolver Name</TableHead>
                  <TableHead>Average Rating</TableHead>
                  <TableHead>Feedback Received</TableHead>
                  <TableHead className="text-right">Total Closed Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvers.map((resolver) => (
                  <TableRow key={resolver.resolverUuid}>
                    <TableCell className="font-medium">{resolver.resolverName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{resolver.averageRating.toFixed(1)}</span>
                        <FeedbackStars rating={Math.round(resolver.averageRating)} readOnly size={16} />
                      </div>
                    </TableCell>
                    <TableCell>{resolver.feedbackReceived}</TableCell>
                    <TableCell className="text-right">{resolver.totalTickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No resolver data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
