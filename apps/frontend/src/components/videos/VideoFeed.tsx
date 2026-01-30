'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { VerticalVideoPlayer } from './VerticalVideoPlayer';
import { VideoOverlay } from './VideoOverlay';

export interface VideoFeedItem {
  id: string;
  productId: string;
  videoUrl: string;
  hlsUrl: string;
  thumbnail: string;
  product: {
    id: string;
    name: string;
    nameAr: string;
    price: number;
    currency: 'SAR';
    sellerId: string;
    sellerName: string;
    rating: number;
    inStock: boolean;
  };
  views: number;
  likes: number;
  duration: number;
}

interface VideoFeedProps {
  videos: VideoFeedItem[];
  onLoadMore?: () => void;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  language?: 'en' | 'ar';
}

export function VideoFeed({
  videos,
  onLoadMore,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  language = 'en',
}: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  // Preload next 2-3 videos
  useEffect(() => {
    const preloadCount = 3;
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(videos.length, currentIndex + preloadCount);

    for (let i = startIndex; i < endIndex; i++) {
      if (i !== currentIndex && videos[i]) {
        // Preload video
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = videos[i].hlsUrl || videos[i].videoUrl;
        document.head.appendChild(link);
      }
    }
  }, [currentIndex, videos]);

  // Load more videos when approaching the end
  useEffect(() => {
    if (currentIndex >= videos.length - 3 && onLoadMore) {
      onLoadMore();
    }
  }, [currentIndex, videos.length, onLoadMore]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex < videos.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, videos.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, isTransitioning]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      goToNext();
    } else if (isDownSwipe) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 50) {
        e.preventDefault();
        if (e.deltaY > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
    
    return undefined;
  }, [goToNext, goToPrevious]);

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>No videos available</p>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Current video */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          isTransitioning ? 'transform' : ''
        }`}
        style={{
          transform: isTransitioning
            ? touchEnd && touchStart && touchEnd < touchStart
              ? 'translateY(-100%)'
              : 'translateY(100%)'
            : 'translateY(0)',
        }}
      >
        <VerticalVideoPlayer
          videoUrl={currentVideo.videoUrl}
          hlsUrl={currentVideo.hlsUrl}
          thumbnail={currentVideo.thumbnail}
          autoPlay={true}
          muted={true}
        />

        <VideoOverlay
          product={currentVideo.product}
          views={currentVideo.views}
          likes={currentVideo.likes}
          onAddToCart={() => onAddToCart?.(currentVideo.productId)}
          onViewDetails={() => onViewDetails?.(currentVideo.productId)}
          onToggleFavorite={() => onToggleFavorite?.(currentVideo.productId)}
          language={language}
        />
      </div>

      {/* Navigation indicators */}
      <div className="absolute end-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Swipe hint (show on first video) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-8 h-8 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <p className="text-white/70 text-sm mt-2">Swipe up</p>
        </div>
      )}
    </div>
  );
}
