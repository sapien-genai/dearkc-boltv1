'use client';

import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { Event } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FALLBACK_IMAGE_URL } from '@/lib/constants';

type EventCardProps = {
  event: Event;
  className?: string;
};

export function EventCard({ event, className = "" }: EventCardProps) {
  const startDate = new Date(event.startsAt);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const imageUrl = event.image ?? FALLBACK_IMAGE_URL;
  const addressLine = event.address?.street ?? event.address?.full ?? 'Kansas City, MO';
  const isFree = !event.price || event.price.toLowerCase().includes('free');

  return (
    <Link href={`/events/${event.slug}`}>
      <Card
        className={`group overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isFree && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white border-0">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-3 group-hover:text-purple-600 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="line-clamp-1">{addressLine}</span>
            </div>

            {!isFree && event.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>{event.price}</span>
              </div>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
