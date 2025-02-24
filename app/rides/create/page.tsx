"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { handleSaveNewRides } from "@/app/services/rides"
import toast, { Toaster } from "react-hot-toast";

// Dynamic import to avoid SSR issues with react-leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false })

export default function CreateRide() {
  const [price, setPrice] = useState("0")
  const [startLocation, setStartLocation] = useState({ lat: 19.0760, lng: 72.8777, name: "" })
  const [endLocation, setEndLocation] = useState({ lat: 19.0760, lng: 72.877745, name: "" })
  const [availableSeats, setAvailableSeats] = useState("")
  const [vehicleDetails, setVehicleDetails] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState<string>("")

  const [L, setL] = useState<any>(null)
  const startIconRef = useRef<any>(null)
  const endIconRef = useRef<any>(null)

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
  
      startIconRef.current = new leaflet.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448357.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
  
      endIconRef.current = new leaflet.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048314.png", // Carpool end icon
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    });
  }, []);
  

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const departureDateTime =
      date && time
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(time.split(":")[0]), parseInt(time.split(":")[1])).toISOString()
        : null

    const rideData = {
      driver_id: "badd1f33-3ae8-4246-acc6-7a26287bfe8e",
      start_location: startLocation.name,
      start_lat: startLocation.lat,
      start_lon: startLocation.lng,
      end_location: endLocation.name,
      end_lat: endLocation.lat,
      end_lon: endLocation.lng,
      departure_time: departureDateTime,
      available_seats: availableSeats,
      price: parseFloat(price),
      vehicle_detail: vehicleDetails,
      additional_info: additionalInfo,
    } 

    handleSaveNewRides(rideData)
    toast.success("Ride created sucessfully.");

  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Offer a Ride</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium mb-2 block">Select Start and End Points</label>
            <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: "300px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {L && startIconRef.current && endIconRef.current && (
                <>
                  <Marker
                    position={[startLocation.lat, startLocation.lng]}
                    icon={startIconRef.current}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        setStartLocation(prev => ({ ...prev, lat, lng }));
                      },
                    }}
                  >
                    <Popup>Start Point</Popup>
                  </Marker>
                  <Marker
                    position={[endLocation.lat, endLocation.lng]}
                    icon={endIconRef.current}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        setEndLocation(prev => ({ ...prev, lat, lng }));
                      },
                    }}
                  >
                    <Popup>End Point</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Price</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Available Seats</label>
            <Input value={availableSeats} onChange={(e) => setAvailableSeats(e.target.value)} placeholder="Number of seats" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Vehicle Details</label>
            <Input value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} placeholder="Car model, number, etc." />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Info</label>
            <Textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Any special instructions" />
          </div>

          <div className="flex gap-4">
          <DatePicker onSelect={setDate} />
          <TimePicker onSelect={setTime} />         
           </div>

          <Button type="submit" className="w-full">Publish Ride</Button>
        </form>
      </Card>
    </div>
  )
}
