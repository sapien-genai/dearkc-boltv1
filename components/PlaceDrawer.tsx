'use client';

import { Place } from '@/lib/types';
import { Star, MapPin, DollarSign, Clock, ExternalLink, Heart, Bookmark } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type PlaceDrawerProps = {
  place: Place | null;
  open: boolean;
  onClose: () => void;
};

export function PlaceDrawer({ place, open, onClose }: PlaceDrawerProps) {
  if (!place) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{place.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={place.images[0]}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Add to List
            </Button>
            <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600" asChild>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Directions
              </a>
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{place.rating}</span>
              <span className="text-gray-600">({place.reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span>{place.price_level}</span>
              <span>•</span>
              <span>{place.category}</span>
            </div>

            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p>{place.address.street}</p>
                <p>{place.address.city}, {place.address.state} {place.address.zip}</p>
                <p className="text-sm text-gray-500 mt-1">{place.neighborhood}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Hours</p>
                <div className="space-y-1">
                  {Object.entries(place.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between gap-4">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-medium">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm font-medium mb-2 text-purple-900">AI Summary</p>
              <p className="text-sm text-gray-700">{place.ai_summary}</p>
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/places/${place.slug}`}>
                View Full Details
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
