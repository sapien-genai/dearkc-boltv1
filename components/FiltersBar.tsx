'use client';

import { useState } from 'react';
import { SlidersHorizontal, DollarSign, Star, MapPin } from 'lucide-react';
import { CategoryChips } from './CategoryChips';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export type Filters = {
  categories: string[];
  neighborhood?: string;
  priceLevel?: string[];
  openNow: boolean;
  minRating: number;
  maxDistance: number;
};

type FiltersBarProps = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  neighborhoods: string[];
  className?: string;
};

const CATEGORIES = ['All', 'BBQ', 'Coffee', 'American', 'Arts', 'Nightlife', 'Outdoors'];

export function FiltersBar({
  filters,
  onFiltersChange,
  neighborhoods,
  className = ""
}: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    if (category === 'All') {
      onFiltersChange({ ...filters, categories: [] });
    } else {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category];
      onFiltersChange({ ...filters, categories: newCategories });
    }
  };

  const displayCategories = filters.categories.length === 0 ? ['All'] : filters.categories;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 overflow-hidden">
          <CategoryChips
            categories={CATEGORIES}
            selected={displayCategories}
            onSelect={handleCategorySelect}
          />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  Neighborhood
                </Label>
                <Select
                  value={filters.neighborhood || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      neighborhood: value === 'all' ? undefined : value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All neighborhoods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All neighborhoods</SelectItem>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4" />
                  Price Level
                </Label>
                <div className="flex gap-2">
                  {['$', '$$', '$$$'].map((level) => (
                    <Button
                      key={level}
                      variant={filters.priceLevel?.includes(level) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const current = filters.priceLevel || [];
                        const newLevels = current.includes(level)
                          ? current.filter(l => l !== level)
                          : [...current, level];
                        onFiltersChange({
                          ...filters,
                          priceLevel: newLevels.length > 0 ? newLevels : undefined
                        });
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  Minimum Rating: {filters.minRating}
                </Label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([value]) =>
                    onFiltersChange({ ...filters, minRating: value })
                  }
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="mb-3">Max Distance: {filters.maxDistance} mi</Label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={([value]) =>
                    onFiltersChange({ ...filters, maxDistance: value })
                  }
                  min={1}
                  max={25}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="open-now">Open Now</Label>
                <Switch
                  id="open-now"
                  checked={filters.openNow}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, openNow: checked })
                  }
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onFiltersChange({
                    categories: [],
                    openNow: false,
                    minRating: 0,
                    maxDistance: 25
                  });
                  setIsOpen(false);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
