'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const severityColors = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

interface Pothole {
  _id: string;
  latitude: number;
  longitude: number;
  severity: 'High' | 'Medium' | 'Low';
  status: string;
}

interface AdminMapProps {
  potholes: Pothole[];
  onSelect?: (pothole: Pothole) => void;
  center?: [number, number];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function AdminMap({ potholes, onSelect, center = [28.6139, 77.2090] }: AdminMapProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView center={center} />

        {potholes.map((p) => {
          // Custom icon based on severity
          const coloredIcon = new L.DivIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${severityColors[p.severity]}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${severityColors[p.severity]}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker 
              key={p._id} 
              position={[p.latitude, p.longitude]} 
              icon={coloredIcon}
              eventHandlers={{
                click: () => onSelect && onSelect(p),
              }}
            >
              <Popup className="glass-popup">
                <div className="p-2 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pothole Info</p>
                  <p className="text-sm font-bold">Severity: <span style={{ color: severityColors[p.severity] }}>{p.severity}</span></p>
                  <p className="text-[10px] text-gray-500">ID: {p._id.slice(-6)}</p>
                  <p className="text-[10px] text-gray-500">Status: {p.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
