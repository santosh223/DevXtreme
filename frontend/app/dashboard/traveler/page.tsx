'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../lib/auth';
import socket from '../../../lib/socket';
import api from '../../../lib/api';
import { 
  Navigation, 
  Map as MapIcon, 
  Car, 
  ShieldAlert, 
  AlertTriangle, 
  Menu,
  ChevronRight,
  Target,
  Loader2,
  Route
} from 'lucide-react';

const TravelerMap = dynamic(() => import('../../../components/TravelerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full glass-panel flex items-center justify-center animate-pulse">
    <Loader2 className="animate-spin text-primary" size={40} />
  </div>
});

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090]; // Delhi mid-point

export default function TravelerDashboard() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(DEFAULT_CENTER);
  const [nearbyPotholes, setNearbyPotholes] = useState<any[]>([]);
  const [alert, setAlert] = useState<{ msg: string; count: number } | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Connect to socket if not already connected
    if (!socket.connected) socket.connect();

    // Listen for real-time proximity alerts
    socket.on('pothole:alert', (data: any) => {
      setAlert({ msg: data.message, count: data.count });
      setNearbyPotholes(data.potholes);
      // Auto-hide alert after 8s
      setTimeout(() => setAlert(null), 8000);
    });

    return () => {
      socket.off('pothole:alert');
    };
  }, [user]);

  // Effect to stream location when tracking is enabled
  useEffect(() => {
    let interval: any;
    if (isTracking) {
      interval = setInterval(() => {
        // In a real app, this would use navigator.geolocation.watchPosition
        // For demo, we simulate a slight drift from the baseline center
        const driftLat = (Math.random() - 0.5) * 0.0002;
        const driftLng = (Math.random() - 0.5) * 0.0002;
        
        setCurrentCoords(prev => {
          const newCoords: [number, number] = [prev[0] + driftLat, prev[1] + driftLng];
          // Stream to backend via socket
          socket.emit('traveler:location', { lat: newCoords[0], lng: newCoords[1] });
          return newCoords;
        });
      }, 3000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    if (!isTracking && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }
    setIsTracking(!isTracking);
  };

  const calculateSafeRoute = async () => {
    if (!currentCoords) return;
    setIsCalculatingRoute(true);
    try {
      // For demo, we simulate a destination near the traveler's coords
      const destLat = currentCoords[0] + 0.05;
      const destLng = currentCoords[1] + 0.05;

      const res = await api.get('/issues/route-check', {
        params: {
          originLat: currentCoords[0],
          originLng: currentCoords[1],
          destLat,
          destLng
        }
      });

      if (res.data.route) {
        setRouteData(res.data.route);
        setAlert({ msg: `✅ Safe Route Calculated: ${res.data.message}`, count: res.data.potholes_on_route || 0 });
      }
    } catch (err) {
      console.error('Route calculation failed', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  return (
    <div className="fixed inset-0 pt-20 bg-background overflow-hidden">
      {/* Sidebar Controls */}
      <div className="absolute top-24 left-8 z-[500] w-80 space-y-4">
        <div className="glass-card p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary pulse">
              <Navigation size={24} />
            </div>
            <h1 className="text-xl font-bold">Traveler View</h1>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={toggleTracking}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isTracking 
                  ? 'bg-danger/20 text-danger border border-danger/30' 
                  : 'bg-primary text-white shadow-lg shadow-primary/20'
              }`}
            >
              {isTracking ? <><Target size={20} className="animate-spin" /> Stop Tracking</> : <><Target size={20} /> Start Detection</>}
            </button>

            <button 
              onClick={calculateSafeRoute}
              disabled={isCalculatingRoute || !isTracking}
              className="w-full py-4 glass-panel hover:bg-white/5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              {isCalculatingRoute ? <Loader2 className="animate-spin" size={20} /> : <><Route size={20} className="group-hover:scale-110 transition-transform" /> Calculate Safe Route</>}
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span>Status</span>
              <span className={isTracking ? 'text-success' : 'text-danger'}>{isTracking ? 'LIVE' : 'STANDBY'}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span>Alert Radius</span>
              <span>200 METERS</span>
            </div>
          </div>
        </div>

        {/* Action History / Nearby List */}
        <div className="glass-card p-4 h-[calc(100vh-600px)] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 p-2 border-b border-white/5 mb-2">Live Proximity Feed</p>
          {nearbyPotholes.length === 0 ? (
            <p className="text-xs text-gray-600 italic p-4 text-center">No potholes detected in vicinity.</p>
          ) : (
            <div className="space-y-2">
              {nearbyPotholes.map((p, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-danger uppercase tracking-tighter">⚠️ POTHOLE</span>
                    <span className="text-[10px] text-gray-600">{p.severity}</span>
                  </div>
                  <p className="text-[9px] text-gray-500">Coord: {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="absolute inset-x-0 bottom-0 top-20 z-[400]">
        <TravelerMap 
          center={currentCoords} 
          nearbyPotholes={nearbyPotholes}
          routeGeometry={routeData?.geometry}
        />
      </div>

      {/* Floating Alerts */}
      {alert && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xl">
          <div className="glass-card !bg-danger/20 border-danger/40 p-6 flex items-center justify-between shadow-2xl animate-slide-up backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-danger/20 rounded-2xl">
                <AlertTriangle className="text-danger animate-pulse" size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold tracking-tight">Proximity Warning!</h4>
                <p className="text-sm text-gray-300 leading-tight">{alert.msg}</p>
              </div>
            </div>
            <button 
               onClick={calculateSafeRoute}
               className="bg-danger hover:bg-danger/80 text-white px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-danger/20"
            >
              REROUTE
            </button>
          </div>
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-[450] pointer-events-none" />
    </div>
  );
}
