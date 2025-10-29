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
import placesData from '@/data/places.json';
import neighborhoodsData from '@/data/neighborhoods.json';
import { Place } from '@/lib/types';

const places = placesData as Place[];
const neighborhoods = neighborhoodsData as string[];

type ViewMode = 'split' | 'map' | 'list';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    openNow: false,
    minRating: 0,
    maxDistance: 25
  });

  const filteredPlaces = useMemo(() => {
    let result = places;

    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    if (filters.neighborhood) {
      result = result.filter(p => p.neighborhood === filters.neighborhood);
    }

    if (filters.priceLevel && filters.priceLevel.length > 0) {
      result = result.filter(p => filters.priceLevel!.includes(p.price_level));
    }

    if (filters.minRating > 0) {
      result = result.filter(p => p.rating >= filters.minRating);
    }

    switch (sortBy) {
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [filters, sortBy]);

  const selectedPlace = selectedPlaceId ? places.find(p => p.id === selectedPlaceId) || null : null;

  useEffect(() => {
    if (queryParam) {
      const lowerQuery = queryParam.toLowerCase();
      if (lowerQuery.includes('bbq')) setFilters(f => ({ ...f, categories: ['BBQ'] }));
      else if (lowerQuery.includes('coffee')) setFilters(f => ({ ...f, categories: ['Coffee'] }));
      else if (lowerQuery.includes('art')) setFilters(f => ({ ...f, categories: ['Arts'] }));
    }
  }, [queryParam]);

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
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'} found
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

        <div className="grid lg:grid-cols-[45%_55%] gap-6">
          <div className={`${viewMode === 'map' && 'hidden'} lg:block`}>
            <MapWithClusters
              places={filteredPlaces}
              selectedId={hoveredPlaceId || selectedPlaceId || undefined}
              onSelect={setSelectedPlaceId}
              className="h-[400px] lg:h-[calc(100vh-280px)] lg:sticky lg:top-24"
            />
          </div>

          <div className={`${viewMode === 'list' && 'hidden'} lg:block`}>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onHover={setHoveredPlaceId}
                />
              ))}
            </div>

            {filteredPlaces.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-2">No places found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PlaceDrawer
        place={selectedPlace}
        open={!!selectedPlace}
        onClose={() => setSelectedPlaceId(null)}
      />
    </main>
  );
}
