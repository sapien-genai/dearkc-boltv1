import { API_BASE_URL, FALLBACK_IMAGE_URL } from './constants';
import { Event, Place } from './types';

type PaginationResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string | null;
};

export type BackendCategory = {
  _id: string;
  name: string;
  slug: string;
};

type BackendBusiness = {
  _id: string;
  slug?: string;
  name: string;
  description: string;
  address: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  categoryId?: string;
  images: string[];
  logoUrl?: string | null;
  hours?: string;
  priceRange?: string;
  rating?: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  tags: string[];
};

type BackendEvent = {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startDate: number;
  endDate: number;
  ticketUrl?: string;
  price?: string;
  tags: string[];
  featured: boolean;
  featuredImageUrl?: string | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function parseAddress(address?: string) {
  if (!address) return undefined;

  const [streetPart, cityPart, stateZipPart] = address.split(',').map((part) => part?.trim() ?? '');
  if (!streetPart && !cityPart) {
    return { full: address };
  }

  let state: string | undefined;
  let zip: string | undefined;
  if (stateZipPart) {
    const stateZip = stateZipPart.split(/\s+/).filter(Boolean);
    state = stateZip[0];
    zip = stateZip.slice(1).join(' ') || undefined;
  }

  return {
    street: streetPart || undefined,
    city: cityPart || undefined,
    state,
    zip,
    full: address,
  };
}

function formatPriceLevel(priceRange?: string): Place['price_level'] {
  if (!priceRange) return undefined;
  const normalized = priceRange.trim();
  if (normalized === '$' || normalized === '$$' || normalized === '$$$') {
    return normalized;
  }
  const count = (normalized.match(/\$/g) || []).length;
  if (count >= 1 && count <= 3) {
    return '$'.repeat(count) as Place['price_level'];
  }
  return undefined;
}

function mapBusinessToPlace(
  business: BackendBusiness,
  categoriesById: Map<string, BackendCategory>
): Place {
  const address = parseAddress(business.address);
  const categoryName = business.categoryId
    ? categoriesById.get(business.categoryId)?.name ?? 'Uncategorized'
    : 'Uncategorized';

  const location =
    typeof business.latitude === 'number' && typeof business.longitude === 'number'
      ? { lat: business.latitude, lng: business.longitude }
      : undefined;

  const images = business.images.length > 0 ? business.images : [FALLBACK_IMAGE_URL];

  return {
    id: business._id,
    name: business.name,
    slug: business.slug ?? business._id,
    category: categoryName,
    subcategory: business.tags[0],
    neighborhood: business.neighborhood ?? address?.city,
    price_level: formatPriceLevel(business.priceRange),
    rating: business.rating ?? undefined,
    reviews: business.reviewCount ?? undefined,
    tags: business.tags,
    address,
    location,
    hours: business.hours ?? undefined,
    images,
    ai_summary: business.description,
    featured: business.featured,
    phone: business.phone,
    website: business.website,
  };
}

function mapEventToEvent(event: BackendEvent): Event {
  const startsAt = new Date(event.startDate).toISOString();
  const endsAt = new Date(event.endDate).toISOString();
  const address = parseAddress(event.address);
  const location =
    typeof event.latitude === 'number' && typeof event.longitude === 'number'
      ? { lat: event.latitude, lng: event.longitude }
      : undefined;

  return {
    id: event._id,
    title: event.title,
    slug: event.slug ?? event._id,
    startsAt,
    endsAt,
    tags: event.tags,
    price: event.price,
    location,
    address,
    image: event.featuredImageUrl ?? FALLBACK_IMAGE_URL,
    description: event.description,
  };
}

export async function fetchCategories(): Promise<BackendCategory[]> {
  return fetchJson<BackendCategory[]>(`/api/categories`);
}

export async function fetchBusinesses(options: {
  limit?: number;
  featured?: boolean;
  verified?: boolean;
} = {}): Promise<{ places: Place[]; categories: BackendCategory[] }> {
  const [categories, businesses] = await Promise.all([
    fetchCategories(),
    fetchJson<PaginationResult<BackendBusiness>>(
      `/api/businesses?limit=${options.limit ?? 50}` +
        `${options.featured ? '&featured=true' : ''}` +
        `${options.verified ? '&verified=true' : ''}`
    ),
  ]);

  const categoriesById = new Map(categories.map((category) => [category._id, category]));
  const places = businesses.page.map((business) => mapBusinessToPlace(business, categoriesById));

  return { places, categories };
}

export async function fetchBusinessBySlug(slug: string, categories?: BackendCategory[]): Promise<Place | null> {
  try {
    const business = await fetchJson<BackendBusiness>(`/api/businesses/${slug}`);
    const categoriesToUse = categories ?? (await fetchCategories());
    const categoriesById = new Map(categoriesToUse.map((category) => [category._id, category]));
    return mapBusinessToPlace(business, categoriesById);
  } catch (error) {
    return null;
  }
}

export async function fetchEvents(options: { limit?: number; featured?: boolean } = {}): Promise<Event[]> {
  const events = await fetchJson<PaginationResult<BackendEvent>>(
    `/api/events?limit=${options.limit ?? 50}` + `${options.featured ? '&featured=true' : ''}`
  );

  return events.page.map((event) => mapEventToEvent(event));
}

export async function fetchEventBySlug(slug: string): Promise<Event | null> {
  try {
    const event = await fetchJson<BackendEvent>(`/api/events/${slug}`);
    return mapEventToEvent(event);
  } catch (error) {
    return null;
  }
}
