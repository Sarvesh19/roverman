"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
const StartIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "start-marker" // Optional: for custom styling
});

const EndIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "end-marker" // Optional: for custom styling
});

// Optional CSS to differentiate markers (add this to your global CSS or a stylesheet)
const markerStyles = `
  .start-marker { filter: hue-rotate(0deg); } /* Red hue */
  .end-marker { filter: hue-rotate(120deg); } /* Green hue */
`;

interface MapPickerProps {
  onSelect: (lat: number, lng: number, type: "from" | "to") => void;
  initialPosition: [number, number];
  markers: {
    position: [number, number];
    type: "from" | "to";
  }[];
}

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number, type: "from" | "to") => void }) => {
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    // For simplicity, we'll assign the first click to "from" if no markers exist, but this is handled by parent
    console.log(lat, lng);
    onSelect(lat, lng, "from"); // Default to "from" for new clicks, adjust as needed
  });
  return null;
};

const MapPicker = ({ onSelect, initialPosition, markers }: MapPickerProps) => {
  const [positions, setPositions] = useState<{ [key: string]: [number, number] }>({
    from: markers.find(m => m.type === "from")?.position || initialPosition,
    to: markers.find(m => m.type === "to")?.position || initialPosition,
  });

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      bounds={markers.length > 1 ? markers.map(m => m.position) : undefined}
      boundsOptions={{ padding: [50, 50] }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker) => (
        <Marker
          key={marker.type}
          position={marker.position}
          icon={marker.type === "from" ? StartIcon : EndIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              console.log(lat, lng, marker.type);
              setPositions((prev) => ({
                ...prev,
                [marker.type]: [lat, lng],
              }));
              onSelect(lat, lng, marker.type);
            },
          }}
        >
          <Popup>
            {marker.type === "from" ? "Start" : "End"} Location<br />
            Drag to adjust position.
          </Popup>
        </Marker>
      ))}
      <MapClickHandler onSelect={onSelect} />
    </MapContainer>
  );
};

export default MapPicker; // Keep as default export