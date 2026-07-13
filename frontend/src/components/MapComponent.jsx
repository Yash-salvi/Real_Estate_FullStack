import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Resolve Leaflet icon packaging issues using public CDN URLs
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ latitude, longitude, title, address }) => {
  // Fallback coordinates if none exist
  const position = [latitude || 40.7128, longitude || -74.0060];

  return (
    <div className="h-[350px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner">
      <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-slate-800 text-xs">{title}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
