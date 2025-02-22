"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/date-picker"
import { Search, Users, Clock, Shield, MapPin } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1"
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from: searchParams.from,
      to: searchParams.to,
      date: searchParams.date,
      passengers: searchParams.passengers
    })
    router.push(`/rides?${params.toString()}`)
  }

  return (
    <main>
      <section className="relative min-h-screen flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
          alt="Hero background"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="container mx-auto px-4 z-10">
          <Card className="max-w-2xl mx-auto p-6 backdrop-blur-sm bg-background/95">
            <h1 className="text-3xl font-bold mb-6 text-center">Find Your Perfect Ride</h1>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From</label>
                  <Input 
                    placeholder="Enter departure city"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <Input 
                    placeholder="Enter destination city"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <DatePicker 
                    onSelect={(date) => setSearchParams(prev => ({ 
                      ...prev, 
                      date: date ? date.toISOString().split('T')[0] : "" 
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Passengers</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Search Rides
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How RideShare Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Find Your Route</h3>
              <p className="text-muted-foreground">
                Enter your departure and destination cities to discover available rides that match your travel plans.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Ride</h3>
              <p className="text-muted-foreground">
                Browse through verified drivers, compare prices, and select the ride that best suits your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Book Instantly</h3>
              <p className="text-muted-foreground">
                Book your seat with just a few clicks and get instant confirmation for your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Choose RideShare?</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join millions of users who trust RideShare for their travel needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Secure Booking</h3>
              <p className="text-sm text-muted-foreground">
                Verified profiles and secure payment system for peace of mind
              </p>
            </Card>
            <Card className="p-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                A trusted community of drivers and passengers
              </p>
            </Card>
            <Card className="p-6">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Flexible Times</h3>
              <p className="text-sm text-muted-foreground">
                Find rides that match your schedule
              </p>
            </Card>
            <Card className="p-6">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Wide Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Rides available across multiple cities and routes
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}