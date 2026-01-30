'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoFeed, VideoFeedItem } from '@/components/videos';
import { useTranslation } from '@/lib/i18n';

export default function VideosPage() {
  const { t, language } = useTranslation('common');
  const router = useRouter();
  const [videos, setVideos] = useState<VideoFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Fetch products with videos from the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products?page=${page}&limit=10&status=active`
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error?.message || 'Failed to fetch videos');
      }

      // Check if the response has the expected structure
      const products = data.data?.products || data.products || [];

      // Transform products into video feed items
      const videoItems: VideoFeedItem[] = products
        .filter((product: any) => product.videos && product.videos.length > 0)
        .flatMap((product: any) =>
          product.videos.map((video: any) => ({
            id: video.id,
            productId: product._id,
            videoUrl: video.url,
            hlsUrl: video.hlsUrl,
            thumbnail: video.thumbnail,
            product: {
              id: product._id,
              name: product.name,
              nameAr: product.nameAr,
              price: product.price,
              currency: product.currency,
              sellerId: product.sellerId,
              sellerName: product.sellerName,
              rating: product.rating?.average || 0,
              inStock: product.inventory?.inStock || false,
            },
            views: video.views || 0,
            likes: video.likes || 0,
            duration: video.duration,
          }))
        );

      setVideos((prev) => [...prev, ...videoItems]);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchVideos();
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', productId);
    // For now, just show an alert
    alert('Add to cart functionality coming soon!');
  };

  const handleViewDetails = (productId: string) => {
    // Navigate to product detail page
    router.push(`/products/${productId}`);
  };

  const handleToggleFavorite = (productId: string) => {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite:', productId);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center p-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchVideos}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center p-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg mb-2">No videos available</p>
          <p className="text-gray-400 text-sm">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <VideoFeed
      videos={videos}
      onLoadMore={handleLoadMore}
      onAddToCart={handleAddToCart}
      onViewDetails={handleViewDetails}
      onToggleFavorite={handleToggleFavorite}
      language={language as 'en' | 'ar'}
    />
  );
}
