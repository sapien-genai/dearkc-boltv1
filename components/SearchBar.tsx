'use client';

import { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
  showMicButton?: boolean;
  className?: string;
};

export function SearchBar({
  onSearch,
  placeholder = "+ Ask anything",
  showMicButton = true,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center gap-2 ${className}`}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-14 pl-12 pr-4 rounded-full border-gray-200 shadow-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {showMicButton && (
        <button
          type="button"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Voice search"
        >
          <Mic className="h-5 w-5 text-white" />
        </button>
      )}

      <Button
        type="submit"
        className="h-14 px-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg"
      >
        Search
      </Button>
    </form>
  );
}
