import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link, useNavigate } from 'react-router-dom';
import type { Database } from '../types/db';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon paths in Leaflet when bundling with Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_media?: { url: string; type: string; ord: number | null }[];
};

interface Props {
  properties: Property[];
}

export default function PropertyMap({ properties }: Props) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  const center = properties.length
    ? [properties[0].latitude ?? 51.505, properties[0].longitude ?? -0.09]
    : [51.505, -0.09];

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={13}
      className="h-96 w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup>
        {properties.map((p) => {
          if (p.latitude == null || p.longitude == null) return null;
          const first = p.property_media?.find((m) => m.type === 'photo');
          return (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude] as L.LatLngExpression}
              eventHandlers={{
                click: () => {
                  if (activeId === p.id) {
                    navigate(`/properties/${p.id}`);
                  } else {
                    setActiveId(p.id);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  {first && (
                    <img src={first.url} alt="thumbnail" className="w-32 h-20 object-cover mb-1" />
                  )}
                  <Link to={`/properties/${p.id}`} className="text-blue-600 underline">
                    {p.title}
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
