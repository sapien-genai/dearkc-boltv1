'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapWithClusters } from '@/components/MapWithClusters';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Event, Place } from '@/lib/types';
import { fetchEvents } from '@/lib/api';

type LoadState = 'idle' | 'loading' | 'error';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoadState('loading');
        const fetchedEvents = await fetchEvents({ limit: 60 });
        if (isMounted) {
          setEvents(fetchedEvents);
          setLoadState('idle');
        }
      } catch (error) {
        if (isMounted) {
          setLoadState('error');
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedMonth === 'all') return events;

    return events.filter((event) => {
      const eventDate = new Date(event.startsAt);
      const monthNum = eventDate.getMonth();
      return monthNum.toString() === selectedMonth;
    });
  }, [events, selectedMonth]);

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [filteredEvents]
  );

  const eventsAsPlaces: Place[] = useMemo(
    () =>
      events
        .filter((event) => event.location)
        .map((event) => ({
          id: event.id,
          name: event.title,
          slug: event.slug,
          category: 'Event',
          subcategory: event.tags?.[0],
          neighborhood: event.address?.city,
          price_level: undefined,
          rating: undefined,
          reviews: undefined,
          tags: event.tags,
          address: event.address,
          location: event.location ?? undefined,
          hours: undefined,
          images: event.image ? [event.image] : undefined,
          ai_summary: event.description,
          featured: false,
        })),
    [events]
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
              { label: 'January', value: '0' },
              { label: 'February', value: '1' },
              { label: 'March', value: '2' },
              { label: 'April', value: '3' },
              { label: 'May', value: '4' },
              { label: 'June', value: '5' },
              { label: 'July', value: '6' },
              { label: 'August', value: '7' },
              { label: 'September', value: '8' },
              { label: 'October', value: '9' },
              { label: 'November', value: '10' },
              { label: 'December', value: '11' },
            ].map((month) => (
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

        {loadState === 'error' ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
            Unable to load events right now. Please try again later.
          </div>
        ) : (
          <div className="grid lg:grid-cols-[45%_55%] gap-6 mb-8">
            <div>
              {loadState === 'loading' && events.length === 0 ? (
                <div className="h-[400px] lg:h-[500px] rounded-2xl bg-gray-100 animate-pulse" />
              ) : (
                <MapWithClusters
                  places={eventsAsPlaces}
                  className="h-[400px] lg:h-[500px] lg:sticky lg:top-24"
                />
              )}
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {loadState === 'loading'
                    ? 'Loading events...'
                    : `${sortedEvents.length} ${sortedEvents.length === 1 ? 'event' : 'events'} found`}
                </p>
              </div>

              {loadState === 'loading' && events.length === 0 ? (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {sortedEvents.length === 0 && loadState !== 'loading' && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-2">No events found</p>
                  <p className="text-sm text-gray-500">Try selecting a different month</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
