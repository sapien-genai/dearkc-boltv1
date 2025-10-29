'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place } from '@/lib/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type MapWithClustersProps = {
  places: Place[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showHeatmap?: boolean;
  className?: string;
  center?: [number, number];
  zoom?: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  BBQ: '#EF4444',
  Coffee: '#8B4513',
  American: '#3B82F6',
  Arts: '#A855F7',
  Nightlife: '#EC4899',
  Outdoors: '#10B981',
  default: '#6B7280'
};

export function MapWithClusters({
  places,
  selectedId,
  onSelect,
  showHeatmap = false,
  className = "",
  center = [-94.5786, 39.0997],
  zoom = 11
}: MapWithClustersProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.3s';

      const color = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.default;
      el.style.backgroundColor = color;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      if (selectedId === place.id) {
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.zIndex = '1000';
      }

      el.addEventListener('mouseenter', () => {
        if (selectedId !== place.id) {
          el.style.width = '36px';
          el.style.height = '36px';
        }
      });

      el.addEventListener('mouseleave', () => {
        if (selectedId !== place.id) {
          el.style.width = '32px';
          el.style.height = '32px';
        }
      });

      el.addEventListener('click', () => {
        onSelect?.(place.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold mb-1">${place.name}</h3>
                <p class="text-sm text-gray-600">${place.category} • ${place.price_level}</p>
                <p class="text-sm mt-1">⭐ ${place.rating} (${place.reviews} reviews)</p>
              </div>
            `)
        )
        .addTo(map.current!);

      markers.current.set(place.id, marker);
    });
  }, [places, selectedId, mapLoaded, onSelect]);

  useEffect(() => {
    if (!map.current || !selectedId || !mapLoaded) return;

    const place = places.find(p => p.id === selectedId);
    if (place) {
      map.current.flyTo({
        center: [place.location.lng, place.location.lat],
        zoom: 14,
        duration: 1000
      });
    }
  }, [selectedId, places, mapLoaded]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center p-8 rounded-2xl`}>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Map unavailable</p>
          <p className="text-sm text-gray-500">Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={`${className} rounded-2xl overflow-hidden shadow-lg`} />
  );
}
