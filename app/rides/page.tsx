"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";

let L: any = null;

// Dynamically import react-leaflet components to disable SSR
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FindRides() {
  const searchParams = useSearchParams();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [radius, setRadius] = useState(20)

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      L = leaflet;
      setLeafletReady(true);
    });
  }, []);

  const searchValues = useMemo(() => {
    const fromLat = parseFloat(searchParams.get("fromLat") || "0");
    const fromLon = parseFloat(searchParams.get("fromLng") || "0");
    const toLat = parseFloat(searchParams.get("toLat") || "0");
    const toLon = parseFloat(searchParams.get("toLng") || "0");

    return {
      fromLat: isNaN(fromLat) ? 0 : fromLat,
      fromLon: isNaN(fromLon) ? 0 : fromLon,
      toLat: isNaN(toLat) ? 0 : toLat,
      toLon: isNaN(toLon) ? 0 : toLon,
      rideDate: searchParams.get("date") || new Date().toISOString(),
      // radius: isNaN(radius) ? 20 : toLon,
    };
  }, [searchParams]);

  useEffect(() => {
    async function fetchRides() {
      setLoading(true);
      const { data, error } = await supabase.rpc("find_best_rides", {
        user_lat: searchValues.fromLat,
        user_lon: searchValues.fromLon,
        dest_lat: searchValues.toLat,
        dest_lon: searchValues.toLon,
        ride_date: searchValues.rideDate,
       search_radius: radius*1000
      });

      if (error) {
        console.error("Error fetching rides:", error);
      } else {
        setRides(data);
      }
      setLoading(false);
    }
    fetchRides();
  }, [searchValues, radius]);

  if (!leafletReady) {
    return <p>Loading map...</p>;
  }

  const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const rideIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="container mx-auto px-4 py-8">

        {/* Search Input Section */}
        <div>
          <Card className="p-6 mb-6">
            {/* <div className="grid grid-cols-2 gap-4 mb-4">
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
                <DatePicker 
                  selected={new Date(searchValues.rideDate)}
                  onChange={(date) => setSearchValues(prev => ({ ...prev, rideDate: date.toISOString() }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Passengers</label>
                <Input 
                  type="number" 
                  min="1" 
                  value={searchValues.passengers}
                  onChange={(e) => setSearchValues(prev => ({ ...prev, passengers: Number(e.target.value) }))}
                />
              </div>
            </div> */}

            {/* Radius Slider */}
            <div className="mt-4">
  <label className="text-sm font-medium mb-2 block">Search Radius (km)</label>
  <Slider 
    min={1}  
    max={50} 
    value={[radius]} 
    onValueChange={(val) => setRadius(val[0])} // Fix: Update radius correctly
  />
  <p className="text-sm text-gray-600">{radius} km</p> {/* Fix: Display updated radius */}
</div>
          </Card>
        </div>

      {loading ? (
        <p>Loading rides...</p>
      ) : rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Best Matched Rides</h2>

          {rides.map((ride) => {
            const userStartPosition: [number, number] = [searchValues.fromLat, searchValues.fromLon];
            const rideStartPosition: [number, number] = [ride.start_lat, ride.start_lon];
            const rideEndPosition: [number, number] = [ride.destination_lat, ride.destination_lon];
            const userDestinationPosition: [number, number] = [searchValues.toLat, searchValues.toLon];

            const waypoints: [number, number][] = (ride.waypoints || [])
              .map((wp: any) => {
                const lat = parseFloat(wp.lat);
                const lon = parseFloat(wp.lon);
                return isNaN(lat) || isNaN(lon) ? null : [lat, lon];
              })
              .filter((wp: any): wp is [number, number] => wp !== null);

            const filteredWaypoints = waypoints.filter((wp, index, arr) => {
              if (index === 0) return true;
              const prev = arr[index - 1];
              return Math.abs(wp[0] - prev[0]) > 0.0005 || Math.abs(wp[1] - prev[1]) > 0.0005;
            });

            const routePath: [number, number][] = [rideStartPosition, ...filteredWaypoints, rideEndPosition];
            console.log(routePath);
            return (
              <div key={ride.ride_id} className="mb-6 p-4 border rounded shadow">
                <h3 className="text-xl font-semibold">Ride ID: {ride.ride_id}</h3>
                <p><strong>Start Time:</strong> {new Date(ride.departure_time).toLocaleString()}</p>
                <p><strong>Waypoints:</strong> {filteredWaypoints.length}</p>
                {/* <p><strong>Distance to You:</strong> {ride.distance.toFixed(2)} km</p> */}

                <MapContainer center={rideStartPosition} zoom={12} style={{ height: "400px", width: "100%", marginTop: "10px" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  <Marker position={userStartPosition} icon={userIcon}>
                    <Popup>Your Start Location</Popup>
                  </Marker>

                  <Marker position={rideStartPosition} icon={rideIcon}>
                    <Popup>Ride Start</Popup>
                  </Marker>

                  <Marker position={rideEndPosition} icon={rideIcon}>
                    <Popup>Ride End</Popup>
                  </Marker>

                  <Marker position={userDestinationPosition} icon={userIcon}>
                    <Popup>Your Destination</Popup>
                  </Marker>

                  <Polyline positions={routePath} color="blue" />
                </MapContainer>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
