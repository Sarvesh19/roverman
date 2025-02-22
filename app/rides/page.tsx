"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/date-picker"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function FindRides() {
  const searchParams = useSearchParams()
  const [searchValues, setSearchValues] = useState({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    date: searchParams.get("date") || "",
    passengers: searchParams.get("passengers") || "1"
  })

  const [rides] = useState([
    {
      id: 1,
      from: "Paris",
      to: "Lyon",
      date: "2024-03-25",
      time: "09:00",
      price: 25,
      seats: 3,
      driver: {
        name: "John D.",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100"
      },
      position: [48.8566, 2.3522]
    },
    {
      id: 2,
      from: "Lyon",
      to: "Marseille",
      date: "2024-03-25",
      time: "14:00",
      price: 30,
      seats: 2,
      driver: {
        name: "Sarah M.",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100"
      },
      position: [45.7578, 4.8320]
    }
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From</label>
                <Input 
                  placeholder="Enter departure city" 
                  value={searchValues.from}
                  onChange={(e) => setSearchValues(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To</label>
                <Input 
                  placeholder="Enter destination city"
                  value={searchValues.to}
                  onChange={(e) => setSearchValues(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <DatePicker />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Passengers</label>
                <Input 
                  type="number" 
                  min="1" 
                  value={searchValues.passengers}
                  onChange={(e) => setSearchValues(prev => ({ ...prev, passengers: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ride.driver.image} alt={ride.driver.name} />
                    <AvatarFallback>{ride.driver.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{ride.driver.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {ride.driver.rating}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">€{ride.price}</div>
                        <div className="text-sm text-muted-foreground">per seat</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{ride.from} → {ride.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{ride.date} at {ride.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{ride.seats} seats available</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Book Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="h-[calc(100vh-2rem)] sticky top-4">
          <Card className="h-full p-0 overflow-hidden">
            <MapContainer
              center={[46.2276, 2.2137]}
              zoom={6}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {rides.map((ride) => (
                <Marker key={ride.id} position={ride.position}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{ride.from} → {ride.to}</div>
                      <div>€{ride.price} · {ride.seats} seats</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>
      </div>
    </div>
  )
}