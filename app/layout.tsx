import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TopNav } from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DearKC - Your AI-Assisted Kansas City Guide',
  description: 'Discover the best of Kansas City with personalized recommendations and local insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
