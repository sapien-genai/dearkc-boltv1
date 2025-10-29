const DEFAULT_CONVEX_BASE_URL = 'https://pleasant-ermine-683.convex.cloud';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_CONVEX_BASE_URL
).replace(/\/$/, '');

export const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
