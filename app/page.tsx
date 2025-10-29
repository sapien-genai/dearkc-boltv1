'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { MapWithClusters } from '@/components/MapWithClusters';
import { Carousel } from '@/components/Carousel';
import { PlaceCard } from '@/components/PlaceCard';
import placesData from '@/data/places.json';
import { Place } from '@/lib/types';

const places = placesData as Place[];

const featuredPlaces = places.filter(p => p.featured);
const cultureHistoryPlaces = places.filter(p => p.category === 'Arts' || p.tags?.includes('historic')).slice(0, 6);
const localFlavors = places.filter(p => p.category === 'BBQ' || p.category === 'Coffee' || p.category === 'American').slice(0, 6);
const outdoorsFamilyPlaces = places.filter(p => p.category === 'Outdoors' || p.tags?.includes('family-friendly')).slice(0, 6);

export default function Home() {
  const router = useRouter();
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div className="space-y-8">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Where do you want to{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  explore
                </span>{' '}
                in KC?
              </h1>

              <div className="max-w-2xl mx-auto lg:mx-0">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <MapWithClusters
              places={featuredPlaces}
              selectedId={hoveredPlaceId || undefined}
              onSelect={(id) => router.push(`/places/${places.find(p => p.id === id)?.slug}`)}
              className="h-[400px] lg:h-[500px]"
            />
          </div>
        </div>

        <div className="space-y-12">
          <Carousel title="Local culture & history">
            {cultureHistoryPlaces.map(place => (
              <div key={place.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <PlaceCard
                  place={place}
                  onHover={setHoveredPlaceId}
                  className="h-full"
                />
              </div>
            ))}
          </Carousel>

          <Carousel title="The best in local flavors">
            {localFlavors.map(place => (
              <div key={place.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <PlaceCard
                  place={place}
                  onHover={setHoveredPlaceId}
                  className="h-full"
                />
              </div>
            ))}
          </Carousel>

          <Carousel title="Outdoors & family friendly">
            {outdoorsFamilyPlaces.map(place => (
              <div key={place.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <PlaceCard
                  place={place}
                  onHover={setHoveredPlaceId}
                  className="h-full"
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => router.push('/explore')}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Explore All Places
          </button>
        </div>
      </div>
    </main>
  );
}
