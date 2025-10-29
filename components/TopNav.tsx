'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DearKC
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Explore
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Events
            </Link>
            <Link
              href="/lists"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              My Lists
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
