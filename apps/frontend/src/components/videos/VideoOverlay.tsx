'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { formatPrice } from '@/lib/i18n/formatters';

interface VideoOverlayProps {
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
  onAddToCart?: () => void;
  onViewDetails?: () => void;
  onToggleFavorite?: () => void;
  language?: 'en' | 'ar';
}

export function VideoOverlay({
  product,
  views,
  likes,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  language = 'en',
}: VideoOverlayProps) {
  const { t } = useTranslation('common');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.();
  };

  const productName = language === 'ar' ? product.nameAr : product.name;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Top right actions */}
      <div className="absolute top-4 end-4 flex flex-col gap-3 pointer-events-auto">
        {/* Category filter button */}
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Filter by category"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>

      {/* Right side action buttons */}
      <div className="absolute end-4 bottom-32 flex flex-col gap-6 pointer-events-auto">
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="flex flex-col items-center gap-1"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <svg
              className="w-6 h-6"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="text-white text-xs">{likes.toLocaleString()}</span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <span className="text-white text-xs">{views.toLocaleString()}</span>
        </div>

        {/* Share button */}
        <button
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <div className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Bottom product information */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 pointer-events-auto">
        {/* Seller info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {product.sellerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{product.sellerName}</p>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-xs">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Product name */}
        <h2 className="text-white text-lg font-bold mb-2 line-clamp-2">
          {productName}
        </h2>

        {/* Price and stock */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white text-2xl font-bold">
            {formatPrice(product.price, language)}
          </span>
          {product.inStock ? (
            <span className="text-green-400 text-sm">
              {t('products.inStock')}
            </span>
          ) : (
            <span className="text-red-400 text-sm">
              {t('products.outOfStock')}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-full font-medium hover:bg-white/30 transition-colors"
          >
            {t('actions.viewDetails')}
          </button>
          <button
            onClick={onAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t('actions.addToCart')}
          </button>
        </div>
      </div>

      {/* Category filter modal (if shown) */}
      {showCategoryFilter && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end pointer-events-auto"
          onClick={() => setShowCategoryFilter(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{t('categories.filterByCategory')}</h3>
              <button
                onClick={() => setShowCategoryFilter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-600">Category filter options coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
