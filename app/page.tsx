'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { MapWithClusters } from '@/components/MapWithClusters';
import { Carousel } from '@/components/Carousel';
import { PlaceCard } from '@/components/PlaceCard';
import { Place } from '@/lib/types';
import { fetchBusinesses } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      try {
        setIsLoading(true);
        const { places: fetchedPlaces } = await fetchBusinesses({ limit: 60, verified: true });
        if (isMounted) {
          setPlaces(fetchedPlaces);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load featured places right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  const filterByKeywords = useMemo(
    () =>
      (keywords: string[]) =>
        places.filter((place) => {
          const haystack = [
            place.category?.toLowerCase() ?? '',
            place.subcategory?.toLowerCase() ?? '',
            ...(place.tags?.map((tag) => tag.toLowerCase()) ?? []),
            place.ai_summary?.toLowerCase() ?? '',
          ].join(' ');

          return keywords.some((keyword) => haystack.includes(keyword));
        }),
    [places]
  );

  const featuredPlaces = useMemo(
    () => places.filter((place) => place.featured).slice(0, 12),
    [places]
  );

  const cultureHistoryPlaces = useMemo(() => {
    const matches = filterByKeywords(['art', 'museum', 'history', 'culture']);
    return matches.length > 0 ? matches.slice(0, 6) : places.slice(0, 6);
  }, [filterByKeywords, places]);

  const localFlavors = useMemo(() => {
    const matches = filterByKeywords(['food', 'bbq', 'coffee', 'dining']);
    return matches.length > 0 ? matches.slice(0, 6) : places.slice(0, 6);
  }, [filterByKeywords, places]);

  const outdoorsFamilyPlaces = useMemo(() => {
    const matches = filterByKeywords(['park', 'outdoor', 'trail', 'family']);
    return matches.length > 0 ? matches.slice(0, 6) : places.slice(0, 6);
  }, [filterByKeywords, places]);

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

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-full px-4 py-2 inline-block">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            {isLoading ? (
              <div className="h-[400px] lg:h-[500px] rounded-2xl bg-gray-100 animate-pulse" />
            ) : (
              <MapWithClusters
                places={featuredPlaces.length > 0 ? featuredPlaces : places}
                selectedId={hoveredPlaceId || undefined}
                onSelect={(id) => {
                  const place = places.find((p) => p.id === id);
                  if (place?.slug) {
                    router.push(`/places/${place.slug}`);
                  }
                }}
                className="h-[400px] lg:h-[500px]"
              />
            )}
          </div>
        </div>

        {isLoading && places.length === 0 ? (
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
            <div className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
            <div className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-12">
            <Carousel title="Local culture & history">
              {cultureHistoryPlaces.map((place) => (
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
              {localFlavors.map((place) => (
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
              {outdoorsFamilyPlaces.map((place) => (
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
        )}

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
