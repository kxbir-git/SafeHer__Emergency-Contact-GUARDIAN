import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { ShieldAlert, MapPin, Phone, Clock, Navigation } from 'lucide-react';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pulsingIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <div style="
        position:absolute;inset:0;
        background:#DC2626;
        border-radius:50%;
        opacity:0.25;
        animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;inset:6px;
        background:#DC2626;
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 2px 8px rgba(220,38,38,0.6);
      "></div>
    </div>
    <style>
      @keyframes ping {
        75%,100%{transform:scale(2.2);opacity:0}
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

export const LiveTrackPage = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || 'User';
  const phone = searchParams.get('phone') || '';
  const alertId = searchParams.get('alert') || '';

  const [position, setPosition] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const wsRef = useRef(null);
  const watchIdRef = useRef(null);

  // Broadcast this device's location via WebSocket (if the tracked person opens this link)
  // OR receive location from backend via WebSocket broadcast (for guardian viewer)
  useEffect(() => {
    // Try to connect to backend WebSocket for live location push
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = import.meta.env.VITE_WS_URL
      ? import.meta.env.VITE_WS_URL.replace(/\/$/, '')
      : `${proto}//127.0.0.1:8000`;
    const ws = new WebSocket(`${wsBase}/ws/alerts`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'location_updated' && data.data) {
          setPosition([data.data.lat, data.data.lng]);
          setLastUpdated(new Date(data.data.updated_at || Date.now()));
        }
      } catch (_) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  // Also use browser Geolocation API to show the current viewer's position
  // This is used when guardian opens the link — they see where the victim IS
  // The URL contains the lat/lng as query params for static fallback
  const initLat = parseFloat(searchParams.get('lat'));
  const initLng = parseFloat(searchParams.get('lng'));

  useEffect(() => {
    if (!isNaN(initLat) && !isNaN(initLng)) {
      setPosition([initLat, initLng]);
      setLastUpdated(new Date());
    }
  }, [initLat, initLng]);

  // Poll backend every 5s for updated location
  useEffect(() => {
    if (!alertId && isNaN(initLat)) return;
    const userId = searchParams.get('uid');
    if (!userId) return;

    const pollLocation = () => {
      fetch(`/api/locations/${userId}/live`)
        .then(r => r.json())
        .then(data => {
          if (data.lat && data.lng) {
            setPosition([data.lat, data.lng]);
            setLastUpdated(new Date());
          }
        })
        .catch(() => {});
    };

    pollLocation();
    const interval = setInterval(pollLocation, 5000);
    return () => clearInterval(interval);
  }, [alertId, initLat]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const openGoogleMaps = () => {
    if (position) {
      window.open(`https://maps.google.com/?q=${position[0]},${position[1]}`, '_blank');
    }
  };

  const callViaPhone = () => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col">
      {/* Emergency Header */}
      <div className="bg-[#DC2626] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-100">🚨 LIVE EMERGENCY LOCATION</p>
            <p className="text-sm font-semibold text-white">{name} is requesting help</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-red-200 uppercase font-bold">Tracking Active</p>
          <p className="text-xs text-white font-mono">{formatElapsed(elapsed)}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 py-2 flex items-center justify-between text-xs text-[#9CA3AF]">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${position ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span>{position ? `GPS Active — ${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : 'Waiting for GPS signal...'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '55vh' }}>
        {position ? (
          <MapContainer
            center={position}
            zoom={16}
            className="w-full h-full"
            style={{ minHeight: '55vh' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={pulsingIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-[#DC2626]">🚨 {name}</p>
                  <p className="text-gray-600">Last updated: {lastUpdated?.toLocaleTimeString()}</p>
                  <p className="font-mono text-gray-500">{position[0].toFixed(5)}, {position[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#111111]" style={{ minHeight: '55vh' }}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#9CA3AF]">Acquiring live GPS position...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Panel */}
      <div className="bg-[#1A1A1A] border-t border-[#2A2A2A] p-4 space-y-3">
        <div className="bg-[#2A1A1A] border border-[#7F1D1D] rounded-xl p-3">
          <p className="text-xs text-red-300 font-semibold uppercase tracking-wide mb-1">Emergency Alert</p>
          <p className="text-sm text-white">
            <span className="font-bold text-[#F87171]">{name}</span> has triggered a distress alert.
            This is their live GPS location. Please reach them immediately or call emergency services.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {phone && (
            <button
              onClick={callViaPhone}
              className="flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-semibold text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </button>
          )}
          <button
            onClick={openGoogleMaps}
            disabled={!position}
            className="flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigate</span>
          </button>
        </div>

        <button
          onClick={() => window.open(`tel:112`)}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl text-sm font-bold text-white transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Call Police 112 (Emergency)</span>
        </button>

        <p className="text-[10px] text-[#4B5563] text-center">
          This live tracking link was automatically sent by SafeHer on emergency trigger.
          Location updates every 5 seconds.
        </p>
      </div>
    </div>
  );
};
