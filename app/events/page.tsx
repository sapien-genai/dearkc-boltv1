'use client';

import { useState, useMemo } from 'react';
import { MapWithClusters } from '@/components/MapWithClusters';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import eventsData from '@/data/events.json';
import { Event, Place } from '@/lib/types';

const events = eventsData as Event[];

const eventsAsPlaces: Place[] = events.map(event => ({
  id: event.id,
  name: event.title,
  slug: event.slug,
  category: 'Event',
  subcategory: event.tags[0] || 'General',
  neighborhood: event.address.city,
  price_level: event.priceMin === 0 ? '$' : event.priceMin < 20 ? '$$' : '$$$',
  rating: 0,
  reviews: 0,
  tags: event.tags,
  address: event.address,
  location: event.location,
  hours: {},
  images: event.images,
  ai_summary: event.description,
  featured: false
}));

export default function EventsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    if (selectedMonth === 'all') return events;

    return events.filter(event => {
      const eventDate = new Date(event.startsAt);
      const monthNum = eventDate.getMonth();
      return monthNum.toString() === selectedMonth;
    });
  }, [selectedMonth]);

  const sortedEvents = [...filteredEvents].sort((a, b) =>
    new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Kansas City Events</h1>
          <p className="text-gray-600 text-lg">
            Discover upcoming events, festivals, and activities around the city
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedMonth === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedMonth('all')}
            >
              All Events
            </Button>
            {[
              { label: 'June', value: '5' },
              { label: 'July', value: '6' },
              { label: 'August', value: '7' },
              { label: 'September', value: '8' },
              { label: 'October', value: '9' },
              { label: 'November', value: '10' }
            ].map(month => (
              <Button
                key={month.value}
                variant={selectedMonth === month.value ? 'default' : 'outline'}
                onClick={() => setSelectedMonth(month.value)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {month.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[45%_55%] gap-6 mb-8">
          <div>
            <MapWithClusters
              places={eventsAsPlaces}
              className="h-[400px] lg:h-[500px] lg:sticky lg:top-24"
            />
          </div>

          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'} found
              </p>
            </div>

            <div className="grid gap-4">
              {sortedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {sortedEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-2">No events found</p>
                <p className="text-sm text-gray-500">Try selecting a different month</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
