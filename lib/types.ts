export type Address = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  full?: string;
};

export type Coordinates = {
  lng: number;
  lat: number;
};

export type Place = {
  id: string;
  name: string;
  slug: string;
  category?: string;
  subcategory?: string;
  neighborhood?: string;
  price_level?: '$' | '$$' | '$$$';
  rating?: number;
  reviews?: number;
  tags?: string[];
  address?: Address;
  location?: Coordinates;
  hours?: Record<string, string> | string;
  images?: string[];
  ai_summary?: string;
  featured?: boolean;
  phone?: string;
  website?: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  tags?: string[];
  price?: string;
  location?: Coordinates;
  address?: Address;
  image?: string;
  description?: string;
};

export type Experience = {
  id: string;
  title: string;
  slug: string;
  category: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

export type MapBounds = {
  sw: [number, number];
  ne: [number, number];
};
