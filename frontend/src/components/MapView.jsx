import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom lightweight SVG DivIcons for Leaflet
const createCustomIcon = (bgColor, iconChar, size = 30) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${bgColor};
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: ${size * 0.45}px;
        font-family: Inter, sans-serif;
      ">
        ${iconChar}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const userIcon = createCustomIcon('#DC2626', '●', 32);
const alertIcon = createCustomIcon('#B91C1C', '!', 32);
const policeIcon = createCustomIcon('#1E40AF', 'P', 28);
const hospitalIcon = createCustomIcon('#059669', 'H', 28);
const pharmacyIcon = createCustomIcon('#D97706', '+', 28);
const incidentIcon = createCustomIcon('#4B5563', '▲', 26);

// Helper component to center map when coords change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
}

export const MapView = ({
  center = [28.6328, 77.2197],
  zoom = 14,
  alerts = [],
  incidents = [],
  nearbyFacilities = [],
  userName = 'You',
  height = '420px',
  interactive = true
}) => {
  const position = [center[0] || 28.6328, center[1] || 77.2197];

  return (
    <div style={{ height }} className="w-full relative rounded-lg overflow-hidden border border-[#E5E7EB]">
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        className="w-full h-full"
      >
        <ChangeView center={position} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current User Marker */}
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div className="p-1">
              <p className="font-semibold text-xs text-[#111827]">{userName}'s Location</p>
              <p className="text-[11px] text-[#6B7280]">
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">● Live GPS Tracking</p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={position}
          radius={300}
          pathOptions={{ color: '#DC2626', fillColor: '#FEE2E2', fillOpacity: 0.2, weight: 1 }}
        />

        {/* Active Emergency Alerts */}
        {alerts.map((alert) => (
          <Marker
            key={`alert-${alert.id}`}
            position={[alert.lat, alert.lng]}
            icon={alertIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-xs text-[#DC2626]">
                  {alert.type?.toUpperCase()} Alert #{alert.id}
                </p>
                <p className="text-[11px] text-[#111827]">{alert.user_name || 'Ward'}</p>
                <p className="text-[10px] text-[#6B7280] capitalize">Status: {alert.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incidents */}
        {incidents.map((inc) => (
          <Marker
            key={`inc-${inc.id}`}
            position={[inc.lat, inc.lng]}
            icon={incidentIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-xs text-[#111827]">{inc.category}</p>
                <p className="text-[11px] text-[#6B7280]">{inc.description}</p>
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-[#111827]">
                  Severity: {inc.severity}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby Facilities (Police, Hospitals, Pharmacies) */}
        {nearbyFacilities.map((fac, idx) => {
          let facIcon = policeIcon;
          if (fac.type === 'hospital') facIcon = hospitalIcon;
          if (fac.type === 'pharmacy') facIcon = pharmacyIcon;

          return (
            <Marker
              key={`fac-${idx}`}
              position={[fac.lat, fac.lng]}
              icon={facIcon}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-semibold text-xs text-[#111827]">{fac.name}</p>
                  <p className="text-[11px] text-[#6B7280] capitalize">{fac.type} • {fac.phone}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{fac.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
