'use client';

import { Star, Heart } from 'lucide-react';
import { Place } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { FALLBACK_IMAGE_URL } from '@/lib/constants';

type PlaceCardProps = {
  place: Place;
  onHover?: (id: string | null) => void;
  className?: string;
};

export function PlaceCard({ place, onHover, className = "" }: PlaceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const imageUrl = useMemo(
    () => place.images?.[0] ?? FALLBACK_IMAGE_URL,
    [place.images]
  );

  const rating = place.rating ?? 0;
  const reviewCount = place.reviews ?? 0;
  const priceLevel = place.price_level ?? '—';
  const neighborhood = place.neighborhood ?? place.address?.city ?? 'Kansas City';
  const category = place.category ?? 'Uncategorized';

  const handleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsFavorited((prev) => !prev);
  };

  return (
    <Link href={`/places/${place.slug}`}>
      <Card
        className={`group overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
        onMouseEnter={() => onHover?.(place.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <Heart
              className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`}
            />
          </button>
          {place.featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              Popular
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
              {place.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="font-medium">{category}</span>
            <span>•</span>
            <span>{neighborhood}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount})</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-700">{priceLevel}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
