'use client';

import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Clock, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapWithClusters } from '@/components/MapWithClusters';
import eventsData from '@/data/events.json';
import { Event, Place } from '@/lib/types';

const events = eventsData as Event[];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const event = events.find(e => e.slug === slug);

  if (!event) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button onClick={() => router.push('/events')}>
            Back to Events
          </Button>
        </div>
      </main>
    );
  }

  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })}`;

  const eventAsPlace: Place = {
    id: event.id,
    name: event.title,
    slug: event.slug,
    category: 'Event',
    subcategory: '',
    neighborhood: event.address.city,
    price_level: '$',
    rating: 0,
    reviews: 0,
    address: event.address,
    location: event.location,
    hours: {},
    images: event.images,
    ai_summary: '',
    featured: false
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Events
          </button>
        </div>

        <div className="space-y-6">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden">
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Date & Time
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">{formattedDate}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Pricing
                  </h3>
                  {event.priceMin === 0 ? (
                    <Badge className="bg-green-600 text-white text-lg">Free Event</Badge>
                  ) : (
                    <p className="text-2xl font-bold">From ${event.priceMin}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">About This Event</h3>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-purple-600" />
                Location
              </h2>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 font-medium">{event.address.street}</p>
                <p className="text-gray-700">
                  {event.address.city}, {event.address.state} {event.address.zip}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden mb-4">
                <MapWithClusters
                  places={[eventAsPlace]}
                  center={[event.location.lng, event.location.lat]}
                  zoom={14}
                  className="h-[400px]"
                />
              </div>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600" asChild>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
