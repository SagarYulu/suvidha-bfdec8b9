
import { DateRange } from "./DateRangePicker";

export type ComparisonMode = 
  | "day-by-day" 
  | "week-on-week" 
  | "month-on-month" 
  | "quarter-on-quarter" 
  | "year-on-year";

export interface AdvancedFilters {
  city: string | null;
  cluster: string | null;
  manager: string | null;
  role: string | null;
  issueType: string | null;
  dateRange: DateRange;
  isComparisonModeEnabled: boolean;
  comparisonMode: ComparisonMode;
}

// Add type for topic data with optional previousCount
export interface TopicDataItem {
  subject: string;
  count: number;
  previousCount?: number; // Make previousCount optional
  fullMark: number;
}
