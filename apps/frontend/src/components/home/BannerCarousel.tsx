'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  linkType: 'product' | 'category' | 'external' | 'none';
  linkId?: string;
  linkUrl?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoRotateInterval?: number; // in milliseconds
  language?: 'en' | 'ar';
}

export function BannerCarousel({
  banners,
  autoRotateInterval = 5000,
  language = 'en',
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const router = useRouter();

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const interval = setInterval(goToNext, autoRotateInterval);
    return () => clearInterval(interval);
  }, [isPaused, autoRotateInterval, goToNext, banners.length]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe left - next slide
        goToNext();
      } else {
        // Swipe right - previous slide
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkType === 'product' && banner.linkId) {
      router.push(`/products/${banner.linkId}`);
    } else if (banner.linkType === 'category' && banner.linkId) {
      router.push(`/categories/${banner.linkId}`);
    } else if (banner.linkType === 'external' && banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Container */}
      <div
        className="relative h-64 md:h-80 lg:h-96 cursor-pointer"
        onClick={() => handleBannerClick(currentBanner)}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${currentBanner.imageUrl})`,
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {language === 'ar' ? currentBanner.titleAr : currentBanner.title}
          </h2>
          {(currentBanner.subtitle || currentBanner.subtitleAr) && (
            <p className="text-lg md:text-xl text-white/90">
              {language === 'ar' ? currentBanner.subtitleAr : currentBanner.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Previous banner"
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
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Next banner"
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
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
