'use client';

import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_BOUNDARIES } from '@/data/daneCountyBoundaries';
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet';

interface ServiceAreaMapProps {
  className?: string;
  height?: string;
}

export function ServiceAreaMap({ className, height = '500px' }: ServiceAreaMapProps) {
  const router = useRouter();

  return (
    <div
      className={className}
      style={{
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 40px rgba(34, 197, 94, 0.1)',
      }}
    >
      <MapContainer
        center={[43.073, -89.401]}
        zoom={10}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {CITY_BOUNDARIES.map((city) => (
          <Polygon
            key={city.slug}
            positions={city.coordinates as LatLngExpression[][]}
            pathOptions={{
              color: city.color,
              fillColor: city.color,
              fillOpacity: 0.25,
              weight: 2,
            }}
            eventHandlers={{
              click: () => {
                router.push('/locations/' + city.slug);
              },
              mouseover: (e: LeafletMouseEvent) => {
                e.target.setStyle({ fillOpacity: 0.45, cursor: 'pointer' });
              },
              mouseout: (e: LeafletMouseEvent) => {
                e.target.setStyle({ fillOpacity: 0.25 });
              },
            }}
          >
            <Tooltip sticky>{city.name}</Tooltip>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}

export default ServiceAreaMap;
