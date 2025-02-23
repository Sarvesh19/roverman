import { supabase } from '../../lib/supabaseClient';
import toast, { Toaster } from "react-hot-toast";
//import { useRouter } from 'next/router';
import axios from "axios";

const user_id = 'badd1f33-3ae8-4246-acc6-7a26287bfe8e';


export const handleSaveNewRides = async (combinedContent: any) => {
    try {
      await handleSaveNewRides_(combinedContent);
      toast.success("Rides saved successfully!");
    } catch (error) {
      toast.error("Failed to save rides.");
      console.error(error);
    }
  };
  
  const handleSaveNewRides_ = async (ridesContent: any) => {
    try {
      // Ensure correct data types
      if (typeof ridesContent.available_seats === "string") {
        ridesContent.available_seats = parseInt(ridesContent.available_seats, 10);
      }
  
      // Save ride first
      const { data: rideData, error: rideError } = await supabase.from("rides").insert([ridesContent]).select("id").single();
  
      if (rideError) {
        console.error("Error saving ride:", rideError);
        throw rideError;
      }
  
      const rideId = rideData.id;
      
      // Fetch waypoints from OSRM
      const waypoints = await fetchWaypoints(ridesContent.start_lat, ridesContent.start_lon, ridesContent.end_lat, ridesContent.end_lon);
  
      // Insert waypoints into the waypoints table
      if (waypoints.length > 0) {
        await insertWaypoints(rideId, waypoints);
      }
  
      return rideData;
    } catch (error) {
      console.error("Error in handleSaveNewRides_:", error);
      throw error;
    }
  };
  
  const fetchWaypoints = async (startLat: number, startLon: number, endLat: number, endLon: number) => {
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      
      
      const response = await axios.get(url);
      const data = response.data;
  
      if (data && data.routes.length > 0) {
        const fullWaypoints = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => ({ lat, lon }));
        
        // Reduce waypoints: keep every 50th point (approx every 5km, depends on OSRM density)
        const optimizedWaypoints = fullWaypoints.filter((_: any, index: number) => index % 50 === 0);
        
        return optimizedWaypoints;
      }
  
      return [];
    } catch (error) {
      console.error("Error fetching waypoints:", error);
      return [];
    }
  };
  
  const insertWaypoints = async (rideId: string, waypoints: { lat: number; lon: number }[]) => {
    try {
      const waypointData = waypoints.map(({ lat, lon }) => ({
        ride_id: rideId,
        location_name: "Waypoint", // You can enhance this with a reverse geocoding API
        lat,
        lon,
      }));
  
      const { error } = await supabase.from("waypoints").insert(waypointData);
  
      if (error) {
        console.error("Error saving waypoints:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in insertWaypoints:", error);
      throw error;
    }
  };