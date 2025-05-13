
import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, Calendar, ChevronDown, ChevronLeft, ChevronRight, ArrowLeftRight, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { exportResolutionTimeTrendToCSV } from "@/utils/csvExportUtils";
import { DateRange } from "@/hooks/useDashboardData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the data structure
interface TrendDataPoint {
  name: string;
  time: number;
  volume?: number;
  isOutlier?: boolean;
  datasetType?: 'primary' | 'comparison';
}

interface ResolutionTimeTrendProps {
  dailyData: TrendDataPoint[];
  weeklyData: TrendDataPoint[];
  monthlyData: TrendDataPoint[];
  quarterlyData: TrendDataPoint[];
  isLoading: boolean;
  dateRange?: DateRange | null;
  comparisonDateRange?: DateRange | null;
  comparisonMode?: boolean;
  onDateRangeChange?: (range: DateRange | null) => void;
  onComparisonDateRangeChange?: (range: DateRange | null) => void;
  onToggleComparisonMode?: () => void;
}

// Predefined date ranges for quick selection
const predefinedRanges = [
  { name: 'Last 7 days', getRange: () => ({ from: addDays(new Date(), -7), to: new Date() }) },
  { name: 'Last 30 days', getRange: () => ({ from: addDays(new Date(), -30), to: new Date() }) },
  { name: 'Last 3 months', getRange: () => ({ from: addDays(new Date(), -90), to: new Date() }) },
  { name: 'Last 6 months', getRange: () => ({ from: addDays(new Date(), -180), to: new Date() }) },
  { name: 'Year to date', getRange: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) }
];

// Comparison preset options
const comparisonPresets = [
  { name: 'Previous period', getRange: (current: DateRange) => {
    if (current?.from && current?.to) {
      const duration = current.to.getTime() - current.from.getTime();
      return {
        from: new Date(current.from.getTime() - duration),
        to: new Date(current.to.getTime() - duration)
      };
    }
    return null;
  }},
  { name: 'Same period last year', getRange: (current: DateRange) => {
    if (current?.from && current?.to) {
      return {
        from: new Date(current.from.getFullYear() - 1, current.from.getMonth(), current.from.getDate()),
        to: new Date(current.to.getFullYear() - 1, current.to.getMonth(), current.to.getDate())
      };
    }
    return null;
  }}
];

// Enhanced DateRangePicker component for smooth range selection
const DateRangePicker = ({ 
  dateRange, 
  onDateRangeChange,
  label
}: {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  label: string;
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | null>(dateRange);

  // Handle date selection internally before applying
  const handleDateSelect = (range: DateRange | null) => {
    setCurrentDateRange(range);
    
    // Don't close the popover after selecting just the start date
    if (range && range.from && !range.to) {
      return;
    }
    
    // Only when both dates are selected or selection is cleared, apply the changes
    if (!range || (range.from && range.to)) {
      onDateRangeChange(range);
      // Close the calendar only after both dates are selected
      setIsCalendarOpen(false);
    }
  };

  // Apply the selected custom range
  const applyCustomRange = () => {
    if (currentDateRange) {
      onDateRangeChange(currentDateRange);
    }
    setIsCalendarOpen(false);
  };

  // Cancel and close without applying changes
  const cancelSelection = () => {
    setCurrentDateRange(dateRange);
    setIsCalendarOpen(false);
  };

  return (
    <div className="grid gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>{label}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={currentDateRange?.from || new Date()}
            selected={currentDateRange as any}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="border-t border-border p-3 grid gap-2">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelSelection}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={applyCustomRange}
                className="flex-1"
                disabled={!currentDateRange || !currentDateRange.from}
              >
                Apply Range
              </Button>
            </div>
            
            <div className="pt-2 border-t border-border mt-2">
              <p className="text-sm font-medium mb-2">Quick Select</p>
              {predefinedRanges.map((range, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRange = range.getRange();
                    setCurrentDateRange(newRange);
                    onDateRangeChange(newRange);
                    setIsCalendarOpen(false);
                  }}
                  className="w-full mb-1 justify-start"
                >
                  {range.name}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onDateRangeChange(null);
                setIsCalendarOpen(false);
              }}
              className="text-destructive hover:bg-destructive/10 w-full justify-start"
            >
              Clear Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const ResolutionTimeTrendAnalysis: React.FC<ResolutionTimeTrendProps> = ({
  dailyData = [],
  weeklyData = [],
  monthlyData = [],
  quarterlyData = [],
  isLoading,
  dateRange = null,
  comparisonDateRange = null,
  comparisonMode = false,
  onDateRangeChange,
  onComparisonDateRangeChange,
  onToggleComparisonMode
}) => {
  // State for active time period
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');
  
  // Helper to get the current dataset based on active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      case 'quarterly': return quarterlyData;
      default: return dailyData;
    }
  };
  
  // Helper to format tab labels
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'daily': return 'Day by Day';
      case 'weekly': return 'Week by Week';
      case 'monthly': return 'Month by Month';
      case 'quarterly': return 'Quarterly';
      default: return tab;
    }
  };
  
  // Function to handle CSV export
  const handleExport = () => {
    exportResolutionTimeTrendToCSV(getActiveData(), activeTab);
  };
  
  // Function to handle comparison export
  const handleComparisonExport = () => {
    const data = getActiveData();
    const primaryData = data.filter(d => d.datasetType === 'primary' || !d.datasetType);
    const comparisonData = data.filter(d => d.datasetType === 'comparison');
    
    exportResolutionTimeTrendToCSV(
      [...primaryData, ...comparisonData], 
      `${activeTab}-comparison`
    );
  };

  // Apply a comparison preset
  const applyComparisonPreset = (preset: typeof comparisonPresets[0]) => {
    if (dateRange && onComparisonDateRangeChange) {
      const compRange = preset.getRange(dateRange);
      if (compRange) {
        onComparisonDateRangeChange(compRange);
      }
    }
  };
  
  // Calculate percentage change between two values
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Group data by name for side-by-side comparison in table
  const getComparisonTableData = () => {
    const data = getActiveData();
    const result: {
      name: string;
      primary?: { time: number; volume?: number };
      comparison?: { time: number; volume?: number };
      percentageChange?: number;
    }[] = [];
    
    // Create a map of all unique period names
    const allNames = new Set<string>();
    data.forEach(item => allNames.add(item.name));
    
    // For each name, find matching primary and comparison data
    Array.from(allNames).forEach(name => {
      const primaryItem = data.find(item => 
        item.name === name && (item.datasetType === 'primary' || !item.datasetType)
      );
      
      const comparisonItem = data.find(item => 
        item.name === name && item.datasetType === 'comparison'
      );
      
      let percentageChange: number | undefined;
      
      if (primaryItem && comparisonItem) {
        percentageChange = calculatePercentageChange(primaryItem.time, comparisonItem.time);
      }
      
      result.push({
        name,
        primary: primaryItem ? { time: primaryItem.time, volume: primaryItem.volume } : undefined,
        comparison: comparisonItem ? { time: comparisonItem.time, volume: comparisonItem.volume } : undefined,
        percentageChange
      });
    });
    
    return result;
  };
  
  // Chart colors
  const primaryColor = '#1E40AF'; // Blue
  const comparisonColor = '#10B981'; // Green
  
  // Custom tooltip formatter to handle zero values
  const customTooltipFormatter = (value: number, name: string, props: any) => {
    const datasetType = props.payload.datasetType;
    const label = datasetType === 'comparison' ? 'Comparison' : 'Primary';
    const volume = props.payload.volume;
    
    if (volume === 0) {
      return [`No resolutions (${label})`, 'Resolution Time'];
    }
    
    return [`${value.toFixed(2)} hours (${label})`, 'Resolution Time'];
  };
  
  // Custom dot render function to handle zero values
  const renderCustomDot = (props: any, isComparison = false) => {
    const { cx, cy, payload } = props;
    
    // Skip this dot if it belongs to the other dataset type
    if ((isComparison && (!payload.datasetType || payload.datasetType === 'primary')) || 
        (!isComparison && payload.datasetType === 'comparison')) {
      return null;
    }
    
    // If no resolutions (volume=0), don't render a dot
    if (payload.volume === 0) {
      return null; // Don't show dots for periods with no resolutions
    }
    
    // Highlight outliers where resolution time exceeds 72 hours
    if (payload.time > 72) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          stroke="red"
          strokeWidth={3}
          fill="#FFF"
        />
      );
    }
    
    // Normal dot
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke={isComparison ? comparisonColor : primaryColor}
        strokeWidth={1}
        fill="#FFF"
      />
    );
  };
  
  // Filter function to exclude zero volume periods for charting
  const filterZeroVolumePeriods = (data: TrendDataPoint[]) => {
    return data.filter(point => point.volume !== 0);
  };

  // Log data for debugging
  useEffect(() => {
    console.log("Current active tab data:", getActiveData());
    console.log("Current date range:", dateRange);
  }, [activeTab, dateRange, dailyData, weeklyData, monthlyData, quarterlyData]);
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Resolution Time Trend Analysis</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={comparisonMode ? "default" : "outline"} 
            size="sm"
            onClick={onToggleComparisonMode}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {comparisonMode ? "Disable Comparison" : "Enable Comparison"}
          </Button>
          
          <Button variant="outline" size="sm" onClick={comparisonMode ? handleComparisonExport : handleExport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export {comparisonMode ? "Comparison" : "Data"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4">
          <div className={cn("grid gap-4", comparisonMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Date Range</label>
              <DateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={onDateRangeChange || (() => {})}
                label="Select date range"
              />
            </div>
            
            {comparisonMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Comparison Date Range</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Presets <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {comparisonPresets.map((preset, idx) => (
                        <DropdownMenuItem 
                          key={idx}
                          onClick={() => applyComparisonPreset(preset)}
                          disabled={!dateRange?.from}
                        >
                          {preset.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <DateRangePicker 
                  dateRange={comparisonDateRange}
                  onDateRangeChange={onComparisonDateRangeChange || (() => {})}
                  label="Select comparison range"
                />
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="daily" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="daily">{getTabLabel('daily')}</TabsTrigger>
            <TabsTrigger value="weekly">{getTabLabel('weekly')}</TabsTrigger>
            <TabsTrigger value="monthly">{getTabLabel('monthly')}</TabsTrigger>
            <TabsTrigger value="quarterly">{getTabLabel('quarterly')}</TabsTrigger>
          </TabsList>
          
          {['daily', 'weekly', 'monthly', 'quarterly'].map(period => (
            <TabsContent key={period} value={period} className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-[400px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <>
                  {/* Line Chart for Resolution Time Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      {getActiveData().length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No data available for the selected date range
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getActiveData()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              formatter={customTooltipFormatter}
                              labelFormatter={(label) => `Period: ${label}`}
                              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                            />
                            <Legend />
                            
                            {/* Primary dataset line */}
                            <Line
                              type="monotone"
                              dataKey="time"
                              name="Resolution Time"
                              stroke={primaryColor}
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                              connectNulls={true}
                              dot={(props) => renderCustomDot(props)}
                            />
                            
                            {/* Comparison dataset line */}
                            {comparisonMode && (
                              <Line
                                type="monotone"
                                dataKey="time"
                                name="Comparison Resolution Time"
                                stroke={comparisonColor}
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                connectNulls={true}
                                dot={(props) => renderCustomDot(props, true)}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Bar Chart for Ticket Volume */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {getActiveData().length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No data available for the selected date range
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getActiveData()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number, name: string, props: any) => {
                                const datasetType = props.payload.datasetType;
                                const label = datasetType === 'comparison' ? 'Comparison' : 'Primary';
                                if (value === 0) {
                                  return [`No tickets (${label})`, 'Ticket Volume'];
                                }
                                return [`${value} tickets (${label})`, 'Ticket Volume'];
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="volume"
                              name="Ticket Volume"
                              fill={primaryColor}
                            >
                              {getActiveData().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.datasetType === 'comparison' ? comparisonColor : primaryColor}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Enhanced Comparison Table View */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time Comparison Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            {comparisonMode ? (
                              <>
                                <TableHead>Primary Resolution Time</TableHead>
                                <TableHead>Primary Ticket Volume</TableHead>
                                <TableHead>Comparison Resolution Time</TableHead>
                                <TableHead>Comparison Ticket Volume</TableHead>
                                <TableHead>Change (%)</TableHead>
                              </>
                            ) : (
                              <>
                                <TableHead>Ticket Volume</TableHead>
                                <TableHead>Avg. Resolution Time</TableHead>
                                <TableHead>Status</TableHead>
                              </>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getActiveData().length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={comparisonMode ? 6 : 4} className="text-center py-8">
                                No data available for the selected date range
                              </TableCell>
                            </TableRow>
                          ) : comparisonMode ? (
                            // Comparison mode table with side-by-side data
                            getComparisonTableData().map((item, index) => (
                              <TableRow key={`${item.name}-${index}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                  {item.primary?.volume ? 
                                    (item.primary.time > 0 ? `${item.primary.time.toFixed(2)} hours` : '0 hours') : 
                                    'No resolutions'}
                                </TableCell>
                                <TableCell>{item.primary?.volume || 0}</TableCell>
                                <TableCell>
                                  {item.comparison?.volume ? 
                                    (item.comparison.time > 0 ? `${item.comparison.time.toFixed(2)} hours` : '0 hours') : 
                                    'No resolutions'}
                                </TableCell>
                                <TableCell>{item.comparison?.volume || 0}</TableCell>
                                <TableCell>
                                  {item.percentageChange !== undefined && item.primary?.volume && item.comparison?.volume ? (
                                    <div className="flex items-center">
                                      <span className={cn(
                                        item.percentageChange > 0 ? "text-red-500" : 
                                        item.percentageChange < 0 ? "text-green-500" : 
                                        "text-gray-500"
                                      )}>
                                        {item.percentageChange > 0 ? '+' : ''}
                                        {item.percentageChange.toFixed(1)}%
                                      </span>
                                      {item.percentageChange > 0 ? (
                                        <ChevronUp className="h-4 w-4 ml-1 text-red-500" />
                                      ) : item.percentageChange < 0 ? (
                                        <ChevronDown className="h-4 w-4 ml-1 text-green-500" />
                                      ) : null}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">N/A</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            // Regular table for single dataset
                            getActiveData().map((item, index) => (
                              <TableRow key={`${item.name}-${index}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.volume || 0}</TableCell>
                                <TableCell>
                                  {item.volume ? 
                                    (item.time > 0 ? `${item.time.toFixed(2)} hours` : '0 hours') : 
                                    'No resolutions'}
                                </TableCell>
                                <TableCell>
                                  {!item.volume ? (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">No Data</Badge>
                                  ) : item.time > 72 ? (
                                    <Badge variant="destructive">Outlier</Badge>
                                  ) : item.time > 48 ? (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-100">Normal</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResolutionTimeTrendAnalysis;
