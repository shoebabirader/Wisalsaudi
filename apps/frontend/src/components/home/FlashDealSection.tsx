'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductCard, type Product } from './ProductCard';

interface FlashDeal {
  id: string;
  products: Product[];
  endsAt: Date;
}

interface FlashDealSectionProps {
  deal: FlashDeal;
  title: string;
  language?: 'en' | 'ar';
  onViewAll?: () => void;
  viewAllText?: string;
  endsInText?: string;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: Set<string>;
}

export function FlashDealSection({
  deal,
  title,
  language = 'en',
  onViewAll,
  viewAllText = 'View All',
  endsInText = 'Ends in',
  onAddToCart,
  onToggleFavorite,
  favorites = new Set(),
}: FlashDealSectionProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(deal.endsAt).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [deal.endsAt]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  if (deal.products.length === 0 || !timeRemaining) {
    return null;
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="mb-8">
      {/* Section Header with Countdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          
          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{endsInText}:</span>
            <div className="flex items-center gap-1">
              <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[2.5rem] text-center">
                {formatNumber(timeRemaining.hours)}
              </div>
              <span className="text-gray-600 font-bold">:</span>
              <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[2.5rem] text-center">
                {formatNumber(timeRemaining.minutes)}
              </div>
              <span className="text-gray-600 font-bold">:</span>
              <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold min-w-[2.5rem] text-center">
                {formatNumber(timeRemaining.seconds)}
              </div>
            </div>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-primary hover:underline text-sm font-medium"
          >
            {viewAllText}
          </button>
        )}
      </div>

      {/* Products Container - Horizontal Scroll */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {deal.products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64 snap-start"
            >
              <ProductCard
                product={product}
                language={language}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.has(product.id)}
              />
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute start-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10 hidden md:block"
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={language === 'ar' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
            />
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute end-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors z-10 hidden md:block"
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={language === 'ar' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
