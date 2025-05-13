
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChartLine, Calendar, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { exportResolutionTimeTrendToCSV } from "@/utils/csvExportUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, subDays, subWeeks, subMonths, subQuarters, isSameDay, isAfter, isBefore, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Define the data structure
interface TrendDataPoint {
  name: string;
  time: number;
  volume?: number;
  isOutlier?: boolean;
  date?: Date; // Add date for filtering
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface TimeFilter {
  type: 'all' | 'custom' | 'week' | 'month' | 'quarter';
  dateRange: DateRange;
  selectedWeeks: string[];
  selectedMonths: string[];
  selectedQuarters: string[];
}

interface ResolutionTimeTrendProps {
  dailyData: TrendDataPoint[];
  weeklyData: TrendDataPoint[];
  monthlyData: TrendDataPoint[];
  quarterlyData: TrendDataPoint[];
  isLoading: boolean;
  onFilterChange?: (filter: TimeFilter) => void;
}

const ResolutionTimeTrendAnalysis: React.FC<ResolutionTimeTrendProps> = ({
  dailyData,
  weeklyData,
  monthlyData,
  quarterlyData,
  isLoading,
  onFilterChange
}) => {
  // State for active time period
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('daily');
  
  // Time filter state
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'week' | 'month' | 'quarter'>('all');
  const [date, setDate] = useState<DateRange>({ from: undefined, to: undefined });
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  
  // Filtered data state
  const [filteredDailyData, setFilteredDailyData] = useState<TrendDataPoint[]>(dailyData);
  const [filteredWeeklyData, setFilteredWeeklyData] = useState<TrendDataPoint[]>(weeklyData);
  const [filteredMonthlyData, setFilteredMonthlyData] = useState<TrendDataPoint[]>(monthlyData);
  const [filteredQuarterlyData, setFilteredQuarterlyData] = useState<TrendDataPoint[]>(quarterlyData);
  
  // Weeks, months, and quarters options
  const weeks = Array.from({ length: 26 }, (_, i) => `Week ${i + 1}`);
  const months = [
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'
  ];
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2024', 'Q4 2024'];
  
  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
    
    // Notify parent component if provided
    if (onFilterChange) {
      onFilterChange({
        type: filterType,
        dateRange: date,
        selectedWeeks,
        selectedMonths,
        selectedQuarters
      });
    }
  }, [filterType, date, selectedWeeks, selectedMonths, selectedQuarters, dailyData, weeklyData, monthlyData, quarterlyData]);
  
  // Helper to get the current dataset based on active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'daily': return filteredDailyData;
      case 'weekly': return filteredWeeklyData;
      case 'monthly': return filteredMonthlyData;
      case 'quarterly': return filteredQuarterlyData;
      default: return filteredDailyData;
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
  
  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setDate({ from: undefined, to: undefined });
    setSelectedWeeks([]);
    setSelectedMonths([]);
    setSelectedQuarters([]);
  };
  
  // Apply filters to data
  const applyFilters = () => {
    if (filterType === 'all') {
      setFilteredDailyData(dailyData);
      setFilteredWeeklyData(weeklyData);
      setFilteredMonthlyData(monthlyData);
      setFilteredQuarterlyData(quarterlyData);
      return;
    }
    
    // For custom date range
    if (filterType === 'custom' && date.from && date.to) {
      // Filter daily data based on date range
      setFilteredDailyData(dailyData.filter(item => {
        // Parse name to date (format is "MMM dd")
        const year = new Date().getFullYear();
        const itemDate = new Date(`${item.name} ${year}`);
        return isAfter(itemDate, subDays(date.from, 1)) && isBefore(itemDate, addDays(date.to, 1));
      }));
      
      // Filter weekly data (assuming name format: "Week MM/dd - MM/dd")
      setFilteredWeeklyData(weeklyData.filter(item => {
        const dateRange = item.name.replace('Week ', '').split(' - ');
        const year = new Date().getFullYear();
        const startWeek = new Date(`${dateRange[0]} ${year}`);
        const endWeek = new Date(`${dateRange[1]} ${year}`);
        return (isAfter(startWeek, subDays(date.from, 1)) || isSameDay(startWeek, date.from)) || 
               (isBefore(endWeek, addDays(date.to, 1)) || isSameDay(endWeek, date.to));
      }));
      
      // Filter monthly data (assuming name format: "MMM yyyy")
      setFilteredMonthlyData(monthlyData.filter(item => {
        const monthDate = new Date(item.name);
        const fromMonth = new Date(date.from.getFullYear(), date.from.getMonth(), 1);
        const toMonth = new Date(date.to.getFullYear(), date.to.getMonth() + 1, 0);
        return isAfter(monthDate, subDays(fromMonth, 1)) && isBefore(monthDate, addDays(toMonth, 1));
      }));
      
      // Filter quarterly data (assuming name format: "Q1 yyyy")
      setFilteredQuarterlyData(quarterlyData.filter(item => {
        const quarter = parseInt(item.name.charAt(1));
        const year = parseInt(item.name.split(' ')[1]);
        const quarterStartMonth = (quarter - 1) * 3;
        const quarterDate = new Date(year, quarterStartMonth, 1);
        const fromQuarter = new Date(date.from.getFullYear(), Math.floor(date.from.getMonth() / 3) * 3, 1);
        const toQuarterMonth = Math.floor(date.to.getMonth() / 3) * 3 + 2;
        const toQuarter = new Date(date.to.getFullYear(), toQuarterMonth + 1, 0);
        return isAfter(quarterDate, subDays(fromQuarter, 1)) && isBefore(quarterDate, addDays(toQuarter, 1));
      }));
    }
    
    // For week selection
    if (filterType === 'week' && selectedWeeks.length > 0) {
      setFilteredDailyData(dailyData);
      setFilteredWeeklyData(weeklyData.filter(item => 
        selectedWeeks.some(week => item.name.includes(week))
      ));
      setFilteredMonthlyData(monthlyData);
      setFilteredQuarterlyData(quarterlyData);
    }
    
    // For month selection
    if (filterType === 'month' && selectedMonths.length > 0) {
      setFilteredDailyData(dailyData);
      setFilteredWeeklyData(weeklyData);
      setFilteredMonthlyData(monthlyData.filter(item => 
        selectedMonths.includes(item.name)
      ));
      setFilteredQuarterlyData(quarterlyData);
    }
    
    // For quarter selection
    if (filterType === 'quarter' && selectedQuarters.length > 0) {
      setFilteredDailyData(dailyData);
      setFilteredWeeklyData(weeklyData);
      setFilteredMonthlyData(monthlyData);
      setFilteredQuarterlyData(quarterlyData.filter(item => 
        selectedQuarters.includes(item.name)
      ));
    }
  };
  
  // Function to handle CSV export
  const handleExport = () => {
    exportResolutionTimeTrendToCSV(getActiveData(), activeTab);
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Resolution Time Trend Analysis</CardTitle>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filterType !== 'all' ? 'Filtered' : 'Filter'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Data By:</h4>
                <Select 
                  value={filterType} 
                  onValueChange={(value) => setFilterType(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="week">Specific Weeks</SelectItem>
                    <SelectItem value="month">Specific Months</SelectItem>
                    <SelectItem value="quarter">Specific Quarters</SelectItem>
                  </SelectContent>
                </Select>
                
                {filterType === 'custom' && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Select Date Range:</h5>
                    <div className="border rounded-md p-3">
                      <CalendarComponent
                        mode="range"
                        selected={{
                          from: date.from,
                          to: date.to
                        }}
                        onSelect={(range) => setDate(range || { from: undefined, to: undefined })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                  </div>
                )}
                
                {filterType === 'week' && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Select Weeks:</h5>
                    <Select 
                      onValueChange={(value) => {
                        if (!selectedWeeks.includes(value)) {
                          setSelectedWeeks([...selectedWeeks, value]);
                        }
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a week" />
                      </SelectTrigger>
                      <SelectContent>
                        {weeks.map(week => (
                          <SelectItem key={week} value={week}>{week}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedWeeks.map(week => (
                        <Badge key={week} variant="secondary" className="cursor-pointer">
                          {week}
                          <span className="ml-2" onClick={() => setSelectedWeeks(selectedWeeks.filter(w => w !== week))}>✕</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {filterType === 'month' && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Select Months:</h5>
                    <Select 
                      onValueChange={(value) => {
                        if (!selectedMonths.includes(value)) {
                          setSelectedMonths([...selectedMonths, value]);
                        }
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMonths.map(month => (
                        <Badge key={month} variant="secondary" className="cursor-pointer">
                          {month}
                          <span className="ml-2" onClick={() => setSelectedMonths(selectedMonths.filter(m => m !== month))}>✕</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {filterType === 'quarter' && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">Select Quarters:</h5>
                    <Select 
                      onValueChange={(value) => {
                        if (!selectedQuarters.includes(value)) {
                          setSelectedQuarters([...selectedQuarters, value]);
                        }
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        {quarters.map(quarter => (
                          <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedQuarters.map(quarter => (
                        <Badge key={quarter} variant="secondary" className="cursor-pointer">
                          {quarter}
                          <span className="ml-2" onClick={() => setSelectedQuarters(selectedQuarters.filter(q => q !== quarter))}>✕</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                            formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Resolution Time']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="time"
                            name="Resolution Time"
                            stroke="#1E40AF"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
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
                                  stroke="#1E40AF"
                                  strokeWidth={1}
                                  fill="#FFF"
                                />
                              );
                            }}
                          />
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
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="volume"
                            name="Ticket Volume"
                            fill="#10B981"
                          />
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
                            <TableHead>Ticket Volume</TableHead>
                            <TableHead>Avg. Resolution Time</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getActiveData().map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
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
                            </TableRow>
                          ))}
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
