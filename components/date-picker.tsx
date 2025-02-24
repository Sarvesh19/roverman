"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  onSelect?: (date: Date | undefined) => void; // Define onSelect prop
}

export function DatePicker({ onSelect }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate); // Call parent-provided onSelect function
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[1000] fixed"> {/* Increased z-index and fixed positioning */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect} // Use the new handler function
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}