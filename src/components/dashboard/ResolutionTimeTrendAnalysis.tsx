
import React, { useState } from "react";
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

const DateRangePicker = ({ 
  dateRange, 
  onDateRangeChange,
  label
}: {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  label: string;
}) => {
  return (
    <div className="grid gap-2">
      <Popover>
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
            defaultMonth={dateRange?.from}
            selected={dateRange as any}
            onSelect={(range) => onDateRangeChange(range as DateRange | null)}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
          <div className="border-t border-border p-3 grid gap-2">
            {predefinedRanges.map((range, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onDateRangeChange(range.getRange())}
              >
                {range.name}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDateRangeChange(null)}
              className="text-destructive hover:bg-destructive/10"
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
  
  // Chart colors
  const primaryColor = '#1E40AF'; // Blue
  const comparisonColor = '#10B981'; // Green
  
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
                            formatter={(value: number, name: string, props: any) => {
                              const datasetType = props.payload.datasetType;
                              const label = datasetType === 'comparison' ? 'Comparison' : 'Primary';
                              return [`${value.toFixed(2)} hours (${label})`, 'Resolution Time'];
                            }}
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
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              const isComparisonData = payload.datasetType === 'comparison';
                              
                              // Skip comparison data points for this line
                              if (isComparisonData) return null;
                              
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
                              
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={4}
                                  stroke={primaryColor}
                                  strokeWidth={1}
                                  fill="#FFF"
                                />
                              );
                            }}
                          />
                          
                          {/* Comparison dataset line (only render if comparison mode is active) */}
                          {comparisonMode && (
                            <Line
                              type="monotone"
                              dataKey="time"
                              name="Comparison Resolution Time"
                              stroke={comparisonColor}
                              strokeDasharray="5 5"
                              strokeWidth={2}
                              activeDot={{ r: 8 }}
                              dot={(props) => {
                                const { cx, cy, payload } = props;
                                const isPrimaryData = !payload.datasetType || payload.datasetType === 'primary';
                                
                                // Skip primary data points for this line
                                if (isPrimaryData) return null;
                                
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
                                
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    stroke={comparisonColor}
                                    strokeWidth={1}
                                    fill="#FFF"
                                  />
                                );
                              }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Bar Chart for Ticket Volume */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
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
                    </CardContent>
                  </Card>
                  
                  {/* Tabular Data View */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Dataset</TableHead>
                            <TableHead>Ticket Volume</TableHead>
                            <TableHead>Avg. Resolution Time</TableHead>
                            <TableHead>Status</TableHead>
                            {comparisonMode && <TableHead>Difference</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getActiveData().map((item, index) => {
                            // Find matching comparison item with the same name
                            const matchingItem = comparisonMode && 
                              getActiveData().find(i => 
                                i.name === item.name && 
                                i.datasetType !== item.datasetType
                              );
                            
                            const timeDifference = matchingItem 
                              ? parseFloat((item.time - matchingItem.time).toFixed(2))
                              : 0;
                            
                            return (
                              <TableRow key={`${item.name}-${item.datasetType || 'primary'}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                  {item.datasetType === 'comparison' ? (
                                    <Badge variant="outline" className="bg-green-100">Comparison</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-blue-100">Primary</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{item.volume || 0}</TableCell>
                                <TableCell>{item.time.toFixed(2)} hours</TableCell>
                                <TableCell>
                                  {item.time > 72 ? (
                                    <Badge variant="destructive">Outlier</Badge>
                                  ) : item.time > 48 ? (
                                    <Badge variant="outline" className="bg-yellow-500 text-yellow-950">Warning</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-100">Normal</Badge>
                                  )}
                                </TableCell>
                                {comparisonMode && matchingItem && (
                                  <TableCell>
                                    {timeDifference > 0 ? (
                                      <span className="text-red-500 flex items-center">
                                        +{timeDifference.toFixed(2)} <ChevronUp className="h-4 w-4 ml-1" />
                                      </span>
                                    ) : timeDifference < 0 ? (
                                      <span className="text-green-500 flex items-center">
                                        {timeDifference.toFixed(2)} <ChevronDown className="h-4 w-4 ml-1" />
                                      </span>
                                    ) : (
                                      <span className="text-gray-500">No change</span>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
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
