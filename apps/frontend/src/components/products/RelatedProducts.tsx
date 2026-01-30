'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/i18n/formatters';

interface RelatedProduct {
  _id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  currency: 'SAR';
  videos: Array<{
    thumbnail: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
  inventory: {
    inStock: boolean;
  };
}

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
  language?: 'en' | 'ar';
}

export function RelatedProducts({
  productId,
  categoryId,
  language = 'en',
}: RelatedProductsProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products?categoryId=${categoryId}&limit=12`
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out the current product
          const filtered = data.products.filter((p: RelatedProduct) => p._id !== productId);
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId]);

  useEffect(() => {
    const updateScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);

      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleProductClick = (id: string) => {
    router.push(`/products/${id}`);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
        </h2>

        {/* Scroll Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg border border-gray-300 transition-colors ${
              canScrollLeft
                ? 'hover:bg-gray-50 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label={language === 'ar' ? 'السابق' : 'Previous'}
          >
            <svg
              className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg border border-gray-300 transition-colors ${
              canScrollRight
                ? 'hover:bg-gray-50 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            aria-label={language === 'ar' ? 'التالي' : 'Next'}
          >
            <svg
              className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={product.videos[0]?.thumbnail || '/placeholder-product.jpg'}
                alt={language === 'ar' ? product.nameAr : product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Out of Stock Overlay */}
              {!product.inventory.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm">
                    {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Product Name */}
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                {language === 'ar' ? product.nameAr : product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.rating.count})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price, language)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice, language)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
