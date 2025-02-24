"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
});

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    fromLatLng: [19.0760, 72.8777] as [number, number], // Default start: Mumbai
    toLatLng: [19.0860, 72.8877] as [number, number],  // Default end: slightly north-east
    date: "",
    passengers: "1",
  });
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
     
      date: searchParams.date,
      passengers: searchParams.passengers,
      fromLat: searchParams.fromLatLng[0].toString(),
      fromLng: searchParams.fromLatLng[1].toString(),
      toLat: searchParams.toLatLng[0].toString(),
      toLng: searchParams.toLatLng[1].toString(),
    });
    router.push(`/rides?${params.toString()}`);
  }; 

 

  return (
    <main className="min-h-screen p-4">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Plan Your Ride</h1>
        
        {/* Map Section */}
        <div className="mb-6 h-[400px] relative">
          <MapPicker
            onSelect={(lat: number, lng: number, type: "from" | "to") => {
              setSearchParams((prev) => ({
                ...prev,
                [type === "from" ? "fromLatLng" : "toLatLng"]: [lat, lng],
              }));
            }}
            initialPosition={searchParams.fromLatLng}
            markers={[
              { position: searchParams.fromLatLng, type: "from" },
              { position: searchParams.toLatLng, type: "to" },
            ]}
          />
        </div>

        {/* Form Section */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <DatePicker
                onSelect={(date) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    date: date ? date.toISOString().split("T")[0] : "",
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Passengers</label>
              <Input
                type="number"
                min="1"
                value={searchParams.passengers}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, passengers: e.target.value }))
                }
              />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Search Rides
          </Button>
        </form>
      </Card>
    </main>
  );
}