import { Place } from './types';

export type AISuggestion = {
  categories: string[];
  neighborhoods: string[];
  places: Place[];
  summary: string;
};

export async function askAI(query: string, context?: any): Promise<AISuggestion> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockCategories = ['BBQ', 'Coffee', 'Arts'];
  const mockNeighborhoods = ['Crossroads', 'Westport'];

  return {
    categories: mockCategories,
    neighborhoods: mockNeighborhoods,
    places: [],
    summary: `Based on your query "${query}", I recommend exploring Kansas City's vibrant BBQ scene, specialty coffee shops, and arts district. The Crossroads and Westport neighborhoods are particularly great for this combination of experiences.`
  };
}

export type ItineraryStop = {
  place: Place;
  order: number;
  estimatedDuration: number;
};

export type Itinerary = {
  stops: ItineraryStop[];
  totalDistance: number;
  totalTime: number;
  route: [number, number][];
};

export async function buildMyDay(places: Place[]): Promise<Itinerary> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const selectedPlaces = places.slice(0, 3);

  const placesWithLocation = selectedPlaces.filter(
    (place): place is Place & { location: NonNullable<Place['location']> } =>
      Boolean(place.location)
  );

  const stops: ItineraryStop[] = selectedPlaces.map((place, idx) => ({
    place,
    order: idx + 1,
    estimatedDuration: 60 + Math.floor(Math.random() * 60)
  }));

  const route: [number, number][] = placesWithLocation.map((place) => [
    place.location.lng,
    place.location.lat
  ]);

  return {
    stops,
    totalDistance: 8.5,
    totalTime: 240,
    route
  };
}
