'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const travelerIcon = L.divIcon({
  className: 'traveler-marker',
  html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #3b82f6; animation: pulse 1.5s infinite"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const potholeIcon = L.divIcon({
  className: 'pothole-marker',
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px #ef4444"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface TravelerMapProps {
  center: [number, number];
  nearbyPotholes: any[];
  routeGeometry?: any;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function TravelerMap({ center, nearbyPotholes, routeGeometry }: TravelerMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="w-full h-full">
      <MapContainer 
        center={center} 
        zoom={16} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={center} />

        {/* Traveler Current Position */}
        <Marker position={center} icon={travelerIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Nearby Potholes */}
        {nearbyPotholes.map((p, i) => (
          <Marker 
            key={i} 
            position={[p.latitude, p.longitude]} 
            icon={potholeIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-danger uppercase tracking-widest">⚠️ Pothole Ahead</p>
                <p className="text-[10px] text-gray-400">Severity: {p.severity}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Safe Route Polyline */}
        {routeGeometry && (
          <Polyline 
            positions={routeGeometry.coordinates.map((c: any) => [c[1], c[0]])}
            pathOptions={{ color: '#00f2fe', weight: 6, opacity: 0.8, lineJoin: 'round' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
