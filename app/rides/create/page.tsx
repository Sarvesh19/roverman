"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { useState } from "react"

export default function CreateRide() {
  const [price, setPrice] = useState("0")

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Offer a Ride</h1>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Input placeholder="Enter departure city" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input placeholder="Enter destination city" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <DatePicker />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <TimePicker />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Available Seats</label>
              <Input type="number" min="1" max="8" defaultValue="4" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price per Seat (€)</label>
              <Input 
                type="number" 
                min="0" 
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Vehicle Details</label>
            <Input placeholder="Car model, color, etc." />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Information</label>
            <Textarea 
              placeholder="Add any details about the ride (luggage space, pets allowed, etc.)"
              className="h-24"
            />
          </div>

          <Button type="submit" className="w-full">Publish Ride</Button>
        </form>
      </Card>
    </div>
  )
}