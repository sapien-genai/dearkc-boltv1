export type Place = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  neighborhood: string;
  price_level: "$" | "$$" | "$$$";
  rating: number;
  reviews: number;
  tags?: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location: {
    lng: number;
    lat: number;
  };
  hours: Record<string, string>;
  images: string[];
  ai_summary: string;
  featured?: boolean;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  tags: string[];
  priceMin: number;
  location: {
    lng: number;
    lat: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  images: string[];
  description: string;
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
