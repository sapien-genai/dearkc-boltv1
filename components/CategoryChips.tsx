'use client';

import { Badge } from '@/components/ui/badge';

type CategoryChipsProps = {
  categories: string[];
  selected: string[];
  onSelect: (category: string) => void;
  className?: string;
};

export function CategoryChips({ categories, selected, onSelect, className = "" }: CategoryChipsProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {categories.map((category) => {
        const isSelected = selected.includes(category);
        return (
          <Badge
            key={category}
            variant={isSelected ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 text-sm whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700'
                : 'hover:border-purple-400 hover:bg-purple-50'
            }`}
            onClick={() => onSelect(category)}
          >
            {category}
          </Badge>
        );
      })}
    </div>
  );
}
