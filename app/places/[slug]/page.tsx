'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, DollarSign, Clock, Heart, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapWithClusters } from '@/components/MapWithClusters';
import placesData from '@/data/places.json';
import { Place } from '@/lib/types';

const places = placesData as Place[];

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const place = places.find(p => p.slug === slug);
  const [showAISummary, setShowAISummary] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!place) {
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;

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
                  src={place.images[0]}
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
                    <span className="font-medium">{place.category}</span>
                    <span>•</span>
                    <span>{place.subcategory}</span>
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
                  <span className="font-semibold text-xl">{place.rating}</span>
                  <span className="text-gray-600">({place.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{place.price_level}</span>
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

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    Location
                  </h2>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-700">{place.address.street}</p>
                    <p className="text-gray-700">
                      {place.address.city}, {place.address.state} {place.address.zip}
                    </p>
                    <p className="text-sm text-gray-500">{place.neighborhood}</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <MapWithClusters
                      places={[place]}
                      center={[place.location.lng, place.location.lat]}
                      zoom={14}
                      className="h-[300px]"
                    />
                  </div>
                  <Button className="mt-4 w-full sm:w-auto" asChild>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    Hours
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(place.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="capitalize text-gray-600 font-medium">{day}</span>
                        <span className="text-gray-900">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600" asChild>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Itinerary
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
                    <span className="font-medium">{place.price_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{place.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neighborhood</span>
                    <span className="font-medium">{place.neighborhood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{place.rating} / 5.0</span>
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
