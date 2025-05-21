
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type DateRange as DayPickerDateRange } from "react-day-picker";

// Define our own DateRange interface that matches what the rest of the application expects
export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  date: DateRange;
  onChange: (date: DateRange) => void;
}

export function DateRangePicker({ date, onChange }: DateRangePickerProps) {
  // Convert our DateRange to the DayPickerDateRange expected by the Calendar component
  const dayPickerValue: DayPickerDateRange | undefined = date.from ? {
    from: date.from,
    to: date.to ?? undefined
  } : undefined;

  // Handle calendar selection and convert back to our DateRange format
  const handleSelect = (range: DayPickerDateRange | undefined) => {
    onChange({
      from: range?.from,
      to: range?.to
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={dayPickerValue}
          onSelect={handleSelect}
          numberOfMonths={2}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
