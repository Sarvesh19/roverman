// components/map-picker.tsx
"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onSelect: (lat: number, lng: number) => void;
  initialPosition: [number, number];
}

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    console.log(lat, lng);

    onSelect(lat, lng);
  });
  return null;
};

const MapPicker = ({ onSelect, initialPosition }: MapPickerProps) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            console.log(lat, lng);
            setPosition([lat, lng]);
            onSelect(lat, lng);
          },
        }}
      >
        <Popup>Drag the marker to select your location.</Popup>
      </Marker>
      <MapClickHandler onSelect={(lat, lng) => {
        setPosition([lat, lng]);
        onSelect(lat, lng);
      }} />
    </MapContainer>
  );
};

export default MapPicker; // Default export