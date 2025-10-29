'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, DollarSign, Clock, Heart, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapWithClusters } from '@/components/MapWithClusters';
import { Place } from '@/lib/types';
import { fetchBusinessBySlug } from '@/lib/api';
import { FALLBACK_IMAGE_URL } from '@/lib/constants';

type LoadState = 'loading' | 'ready' | 'error';

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [showAISummary, setShowAISummary] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPlace() {
      try {
        setStatus('loading');
        const fetchedPlace = await fetchBusinessBySlug(slug);
        if (!isMounted) return;

        if (fetchedPlace) {
          setPlace(fetchedPlace);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }
      }
    }

    loadPlace();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-24 w-24 mx-auto rounded-full bg-gray-100 animate-pulse" />
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </main>
    );
  }

  if (!place || status === 'error') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Place not found</h1>
          <Button onClick={() => router.push('/explore')}>
            Back to Explore
          </Button>
        </div>
      </main>
    );
  }

  const imageUrl = place.images?.[0] ?? FALLBACK_IMAGE_URL;
  const rating = place.rating ?? 0;
  const reviews = place.reviews ?? 0;
  const priceLevel = place.price_level ?? '—';
  const neighborhood = place.neighborhood ?? place.address?.city;
  const googleMapsUrl = place.location
    ? `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`
    : place.address?.full
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address.full)}`
    : undefined;

  const hoursEntries: Array<[string, string]> = (() => {
    if (!place.hours) return [];
    if (typeof place.hours === 'string') {
      return [["Hours", place.hours]];
    }
    return Object.entries(place.hours);
  })();

  const placeForMap: Place[] = place.location ? [place] : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              <div className="col-span-2 aspect-[16/9]">
                <img
                  src={imageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{place.name}</h1>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="font-medium">{place.category ?? 'Uncategorized'}</span>
                    {place.subcategory && (
                      <>
                        <span>•</span>
                        <span>{place.subcategory}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-xl">{rating.toFixed(1)}</span>
                  <span className="text-gray-600">({reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{priceLevel}</span>
                </div>
                {place.featured && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    Popular
                  </Badge>
                )}
              </div>

              {place.tags && place.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="capitalize">
                        {tag.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {place.ai_summary && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <button
                      onClick={() => setShowAISummary(!showAISummary)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">AI Summary</span>
                      </div>
                      <span className="text-sm text-purple-600">
                        {showAISummary ? 'Hide' : 'Show'}
                      </span>
                    </button>
                    {showAISummary && (
                      <p className="mt-4 text-gray-700 leading-relaxed">
                        {place.ai_summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    Location
                  </h2>
                  <div className="space-y-2 mb-4">
                    {place.address?.street && <p className="text-gray-700">{place.address.street}</p>}
                    {place.address?.city && (
                      <p className="text-gray-700">
                        {place.address.city}
                        {place.address.state ? `, ${place.address.state}` : ''}
                        {place.address.zip ? ` ${place.address.zip}` : ''}
                      </p>
                    )}
                    {neighborhood && <p className="text-sm text-gray-500">{neighborhood}</p>}
                  </div>
                  {placeForMap.length > 0 && (
                    <div className="rounded-2xl overflow-hidden">
                      <MapWithClusters
                        places={placeForMap}
                        center={[place.location!.lng, place.location!.lat]}
                        zoom={14}
                        className="h-[300px]"
                      />
                    </div>
                  )}
                  {googleMapsUrl && (
                    <Button className="mt-4 w-full sm:w-auto" asChild>
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  )}
                </div>

                {hoursEntries.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      Hours
                    </h2>
                    <div className="space-y-2">
                      {hoursEntries.map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="capitalize text-gray-600 font-medium">{day}</span>
                          <span className="text-gray-900">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {googleMapsUrl && (
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600" asChild>
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setIsFavorited(!isFavorited)}>
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="w-full">
                    Share with Friends
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Range</span>
                    <span className="font-medium">{priceLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{place.category ?? 'Uncategorized'}</span>
                  </div>
                  {neighborhood && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Neighborhood</span>
                      <span className="font-medium">{neighborhood}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
