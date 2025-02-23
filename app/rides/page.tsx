"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import MapContainer to disable SSR
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

  // Memoize searchValues to prevent unnecessary re-renders
  const searchValues = useMemo(
    () => ({
      fromLat: parseFloat(searchParams.get("fromLat") || "0"),
      fromLon: parseFloat(searchParams.get("fromLng") || "0"),
      toLat: parseFloat(searchParams.get("toLat") || "0"),
      toLon: parseFloat(searchParams.get("toLng") || "0"),
      rideDate: searchParams.get("date") || new Date().toISOString(),
    }),
    [searchParams]
  );

  useEffect(() => {
    async function fetchRides() {
      setLoading(true);
      const { data, error } = await supabase.rpc("find_best_rides", {
        user_lat: searchValues.fromLat,
        user_lon: searchValues.fromLon,
        dest_lat: searchValues.toLat,
        dest_lon: searchValues.toLon,
        ride_date: searchValues.rideDate,
      });

      if (error) {
        console.error("Error fetching rides:", error);
      } else {
        setRides(data);
      }
      setLoading(false);
    }

    fetchRides();
  }, [searchValues]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <p>Loading rides...</p>
      ) : rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Best Matched Rides</h2>

          {rides.map((ride) => (
            <div key={ride.ride_id} className="mb-6 p-4 border rounded shadow">
              {/* Ride Details */}
              <h3 className="text-xl font-semibold">Ride ID: {ride.ride_id}</h3>
              <p>
                <strong>Location:</strong> {ride.location_name}
              </p>
              <p>
                <strong>Start Time:</strong> {new Date(ride.departure_time).toLocaleString()}
              </p>
              <p>
                <strong>Waypoints:</strong> {ride.waypoints_count}
              </p>
              <p>
                <strong>Distance to You:</strong> {ride.distance.toFixed(2)} km
              </p>

              {/* Map for this ride */}
              <MapContainer center={[ride.lat, ride.lon]} zoom={12} style={{ height: "400px", width: "100%", marginTop: "10px" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Start Marker */}
                <Marker position={[ride.lat, ride.lon]}>
                  <Popup>Ride Start: {ride.location_name}</Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker position={[searchValues.toLat, searchValues.toLon]}>
                  <Popup>Destination</Popup>
                </Marker>

                {/* Polyline for the ride path */}
                <Polyline positions={[[ride.lat, ride.lon], [searchValues.toLat, searchValues.toLon]]} color="blue" />
              </MapContainer>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
