'use client';

import { useRef } from 'react';
import { ProductCard, type Product } from './ProductCard';

interface ProductSectionProps {
  title: string;
  products: Product[];
  language?: 'en' | 'ar';
  onViewAll?: () => void;
  viewAllText?: string;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: Set<string>;
  scrollable?: boolean;
}

export function ProductSection({
  title,
  products,
  language = 'en',
  onViewAll,
  viewAllText = 'View All',
  onAddToCart,
  onToggleFavorite,
  favorites = new Set(),
  scrollable = false,
}: ProductSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-primary hover:underline text-sm font-medium"
          >
            {viewAllText}
          </button>
        )}
      </div>

      {/* Products Container */}
      <div className="relative">
        {scrollable ? (
          <>
            {/* Scrollable Horizontal Layout */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => (
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
          </>
        ) : (
          /* Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
