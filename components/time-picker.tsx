"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  onSelect?: (time: string) => void; // Define onSelect prop
}

export function TimePicker({ onSelect }: TimePickerProps) {
  const [time, setTime] = React.useState<string>("")
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = ['00', '15', '30', '45']

  const handleSelect = (selectedTime: string) => {
    setTime(selectedTime)
    if (onSelect) {
      onSelect(selectedTime) // Call parent-provided onSelect function
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="grid grid-cols-4 gap-2 p-2">
          {hours.map(hour => (
            minutes.map(minute => {
              const timeString = `${hour}:${minute}`
              return (
                <Button
                  key={timeString}
                  variant="ghost"
                  className="h-8"
                  onClick={() => handleSelect(timeString)}
                >
                  {timeString}
                </Button>
              )
            })
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}