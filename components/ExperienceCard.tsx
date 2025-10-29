'use client';

import { Clock, Star } from 'lucide-react';
import { Experience } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

type ExperienceCardProps = {
  experience: Experience;
  className?: string;
};

export function ExperienceCard({ experience, className = "" }: ExperienceCardProps) {
  return (
    <Link href={`/experiences/${experience.slug}`}>
      <Card
        className={`group overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors">
            {experience.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {experience.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{experience.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{experience.rating}</span>
              <span className="text-gray-500">({experience.reviews})</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-lg font-bold">${experience.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
