
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  placeholder = "Select date range",
  className
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: startDate,
    to: endDate,
  })

  React.useEffect(() => {
    setDate({ from: startDate, to: endDate })
  }, [startDate, endDate])

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setDate(range)
      onDateRangeChange(range.from, range.to)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date.from && "text-muted-foreground"
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
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
