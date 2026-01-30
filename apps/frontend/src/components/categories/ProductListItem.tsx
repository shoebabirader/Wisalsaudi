'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/i18n/formatters';
import { Product } from '@/components/home/ProductCard';

interface ProductListItemProps {
  product: Product;
  language?: 'en' | 'ar';
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductListItem({
  product,
  language = 'en',
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: ProductListItemProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart?.(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  const getBadgeText = () => {
    if (!product.badge) return null;
    const badges = {
      new: { en: 'New', ar: 'جديد' },
      sale: { en: 'Sale', ar: 'تخفيض' },
      trending: { en: 'Trending', ar: 'رائج' },
    };
    return badges[product.badge][language];
  };

  const getBadgeColor = () => {
    const colors = {
      new: 'bg-green-500',
      sale: 'bg-red-500',
      trending: 'bg-amber-500',
    };
    return product.badge ? colors[product.badge] : '';
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex gap-4 p-4"
    >
      {/* Image */}
      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg">
        <img
          src={product.thumbnail}
          alt={language === 'ar' ? product.nameAr : product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        {product.badge && (
          <div
            className={`absolute top-2 start-2 ${getBadgeColor()} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {getBadgeText()}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-semibold">
              {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Product Name */}
          <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2">
            {language === 'ar' ? product.nameAr : product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Seller */}
          <p className="text-sm text-gray-500 mb-2">
            {language === 'ar' ? 'البائع:' : 'Seller:'} {product.sellerName}
          </p>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price, language)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice, language)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
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
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`py-2 px-6 rounded-lg font-medium transition-colors whitespace-nowrap ${
                product.inStock
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAddingToCart
                ? language === 'ar'
                  ? 'جاري الإضافة...'
                  : 'Adding...'
                : language === 'ar'
                ? 'أضف إلى السلة'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
