'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapWithClusters } from '@/components/MapWithClusters';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceDrawer } from '@/components/PlaceDrawer';
import { FiltersBar, Filters } from '@/components/FiltersBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';
import { Place } from '@/lib/types';
import { fetchBusinesses } from '@/lib/api';

type ViewMode = 'split' | 'map' | 'list';

type LoadState = 'idle' | 'loading' | 'error';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    minRating: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoadState('loading');
        const { places: fetchedPlaces, categories: fetchedCategories } = await fetchBusinesses({
          limit: 100,
          verified: true,
        });

        if (!isMounted) return;

        setPlaces(fetchedPlaces);
        setCategories(fetchedCategories.map((category) => category.name));

        const uniqueNeighborhoods = Array.from(
          new Set(
            fetchedPlaces
              .map((place) => place.neighborhood ?? place.address?.city)
              .filter((value): value is string => Boolean(value))
          )
        );
        uniqueNeighborhoods.sort((a, b) => a.localeCompare(b));
        setNeighborhoods(uniqueNeighborhoods);
        setLoadState('idle');
      } catch (error) {
        if (isMounted) {
          setLoadState('error');
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    if (!queryParam) {
      setFilters((prev) => ({ ...prev, categories: [] }));
      return;
    }

    const lowerQuery = queryParam.toLowerCase();
    const matchedCategory = categories.find((category) =>
      category.toLowerCase().includes(lowerQuery)
    );

    setFilters((prev) => ({
      ...prev,
      categories: matchedCategory ? [matchedCategory] : [],
    }));
  }, [queryParam, categories]);

  const filteredPlaces = useMemo(() => {
    let result = places;

    if (filters.categories.length > 0) {
      result = result.filter((place) =>
        filters.categories.some((category) =>
          place.category?.toLowerCase() === category.toLowerCase()
        )
      );
    }

    if (filters.neighborhood) {
      result = result.filter((place) => {
        const neighborhood = place.neighborhood ?? place.address?.city;
        return neighborhood === filters.neighborhood;
      });
    }

    if (filters.priceLevel && filters.priceLevel.length > 0) {
      result = result.filter((place) =>
        place.price_level && filters.priceLevel?.includes(place.price_level)
      );
    }

    if (filters.minRating > 0) {
      result = result.filter((place) => (place.rating ?? 0) >= filters.minRating);
    }

    switch (sortBy) {
      case 'rating':
        result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'reviews':
        result = [...result].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [places, filters, sortBy]);

  const selectedPlace = selectedPlaceId
    ? places.find((place) => place.id === selectedPlaceId) ?? null
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Explore Kansas City</h1>
            <div className="md:hidden flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <FiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            neighborhoods={neighborhoods}
            categories={categories}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {loadState === 'loading'
                ? 'Loading places...'
                : `${filteredPlaces.length} ${filteredPlaces.length === 1 ? 'place' : 'places'} found`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadState === 'error' ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
            Unable to load places right now. Please try again later.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[45%_55%] gap-6">
            <div className={`${viewMode === 'map' && 'hidden'} lg:block`}>
              {loadState === 'loading' && places.length === 0 ? (
                <div className="h-[400px] lg:h-[calc(100vh-280px)] rounded-2xl bg-gray-100 animate-pulse" />
              ) : (
                <MapWithClusters
                  places={filteredPlaces}
                  selectedId={hoveredPlaceId || selectedPlaceId || undefined}
                  onSelect={setSelectedPlaceId}
                  className="h-[400px] lg:h-[calc(100vh-280px)] lg:sticky lg:top-24"
                />
              )}
            </div>

            <div className={`${viewMode === 'list' && 'hidden'} lg:block`}>
              {loadState === 'loading' && places.length === 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onHover={setHoveredPlaceId}
                    />
                  ))}
                </div>
              )}

              {filteredPlaces.length === 0 && loadState !== 'loading' && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-2">No places found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <PlaceDrawer
        place={selectedPlace}
        open={Boolean(selectedPlace)}
        onClose={() => setSelectedPlaceId(null)}
      />
    </main>
  );
}
