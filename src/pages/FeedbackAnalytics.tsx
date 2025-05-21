
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Calendar, CalendarIcon, Filter } from "lucide-react";
import FeedbackAnalyticsContent from "@/components/feedback/FeedbackAnalyticsContent";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { 
  FeedbackFilters, 
  getCities, 
  getClusters 
} from "@/services/feedbackAnalyticsService";

// Properly typed comparison modes
const COMPARISON_MODES: {value: "day" | "week" | "month" | "quarter" | "year"; label: string}[] = [
  { value: "day", label: "Day-on-Day" },
  { value: "week", label: "Week-on-Week" },
  { value: "month", label: "Month-on-Month" },
  { value: "quarter", label: "Quarter-on-Quarter" },
  { value: "year", label: "Year-on-Year" }
];

// Mock data for ticket categories (in production would come from API)
const TICKET_CATEGORIES = [
  { id: "pf", name: "PF" },
  { id: "esi", name: "ESI" },
  { id: "salary", name: "Salary" },
  { id: "leave", name: "Leave" },
  { id: "other", name: "Other" }
];

const FEEDBACK_TYPES: {value: "agent" | "solution" | "both"; label: string}[] = [
  { value: "agent", label: "Agent" },
  { value: "solution", label: "Solution" },
  { value: "both", label: "Both" }
];

const FeedbackAnalytics = () => {
  // Filters state with proper types
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedResolver, setSelectedResolver] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<"agent" | "solution" | "both">("both");
  const [selectedComparisonMode, setSelectedComparisonMode] = useState<"day" | "week" | "month" | "quarter" | "year">("day");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // State for city and cluster data
  const [cities, setCities] = useState<string[]>([]);
  const [clusters, setClusters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"overview" | "agent" | "solution">("overview");

  // Fetch cities and clusters from master data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const citiesData = await getCities();
        setCities(citiesData);
        
        // Get all clusters initially
        const clustersData = await getClusters();
        setClusters(clustersData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMasterData();
  }, []);

  // Update clusters when city changes
  useEffect(() => {
    const updateClusters = async () => {
      if (selectedCity === "all") {
        const allClusters = await getClusters();
        setClusters(allClusters);
      } else {
        const filteredClusters = await getClusters(selectedCity);
        setClusters(filteredClusters);
        // Reset cluster selection if the currently selected cluster is not in the new list
        if (filteredClusters.length > 0 && !filteredClusters.includes(selectedCluster) && selectedCluster !== "all") {
          setSelectedCluster("all");
        }
      }
    };
    
    updateClusters();
  }, [selectedCity]);

  // Function to handle feedback type change with proper type checking
  const handleFeedbackTypeChange = (value: string) => {
    if (value === "agent" || value === "solution" || value === "both") {
      setSelectedFeedbackType(value);
    }
  };

  // Function to handle comparison mode change with proper type checking
  const handleComparisonModeChange = (value: string) => {
    if (value === "day" || value === "week" || value === "month" || value === "quarter" || value === "year") {
      setSelectedComparisonMode(value);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  // Helper function to format date range for display
  const formatDateRange = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`;
      }
      return format(dateRange.from, "LLL dd, yyyy");
    }
    return "Select dates";
  };

  // Create the filters object to pass to components
  const getFilters = (): FeedbackFilters => {
    return {
      city: selectedCity === "all" ? "" : selectedCity,
      cluster: selectedCluster === "all" ? "" : selectedCluster,
      resolver: selectedResolver === "all" ? "" : selectedResolver,
      category: selectedCategory === "all" ? "" : selectedCategory,
      feedbackType: selectedFeedbackType,
      comparisonMode: selectedComparisonMode,
      dateRange: dateRange?.from ? {
        start: format(dateRange.from, "yyyy-MM-dd"),
        end: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(dateRange.from, "yyyy-MM-dd")
      } : undefined
    };
  };

  // Helper functions for selecting preset date ranges
  const selectLastNDays = (days: number) => {
    const to = new Date();
    const from = addDays(to, -days + 1);
    setDateRange({ from, to });
  };

  return (
    <AdminLayout title="Feedback Analytics" requiredPermission="view:dashboard">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* City filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cluster filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cluster</label>
                <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clusters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clusters</SelectItem>
                    {clusters.map(cluster => (
                      <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolver filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Resolver</label>
                <Select value={selectedResolver} onValueChange={setSelectedResolver}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Resolvers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resolvers</SelectItem>
                    <SelectItem value="resolver1">Resolver 1</SelectItem>
                    <SelectItem value="resolver2">Resolver 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket category filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ticket Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {TICKET_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback type filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Feedback Type</label>
                <Select 
                  value={selectedFeedbackType} 
                  onValueChange={handleFeedbackTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range picker */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{formatDateRange()}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b border-gray-200 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectLastNDays(7)}
                      >
                        Last 7 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectLastNDays(30)}
                      >
                        Last 30 days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDateRange(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Comparison mode selector */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1.5 block">Comparison Mode</label>
              <div className="flex flex-wrap gap-2">
                {COMPARISON_MODES.map(mode => (
                  <Button 
                    key={mode.value}
                    variant={selectedComparisonMode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleComparisonModeChange(mode.value)}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "agent" | "solution")}>
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agent">Agent Feedback</TabsTrigger>
            <TabsTrigger value="solution">Resolution Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <FeedbackAnalyticsContent 
              view="overview"
              filters={getFilters()}
            />
          </TabsContent>

          <TabsContent value="agent" className="mt-6">
            <FeedbackAnalyticsContent 
              view="agent"
              filters={getFilters()}
            />
          </TabsContent>

          <TabsContent value="solution" className="mt-6">
            <FeedbackAnalyticsContent 
              view="solution"
              filters={getFilters()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FeedbackAnalytics;
