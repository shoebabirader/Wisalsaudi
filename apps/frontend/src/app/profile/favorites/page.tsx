'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Heart,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { formatPrice } from '@/lib/i18n/formatters';
import { useCartStore } from '@/store/cartStore';

interface FavoriteProduct {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  currency: 'SAR';
  thumbnail: string;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  inStock: boolean;
  addedAt: string;
}

export default function FavoritesPage() {
  const { t, language } = useTranslation('profile');
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/favorites', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockFavorites: FavoriteProduct[] = [
        {
          id: 'p1',
          name: 'Wireless Headphones',
          nameAr: 'سماعات لاسلكية',
          price: 299,
          originalPrice: 399,
          currency: 'SAR',
          thumbnail: 'https://via.placeholder.com/300x300?text=Headphones',
          rating: 4.5,
          reviewCount: 128,
          sellerId: 's1',
          sellerName: 'Tech Store',
          inStock: true,
          addedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'p2',
          name: 'Smart Watch',
          nameAr: 'ساعة ذكية',
          price: 899,
          currency: 'SAR',
          thumbnail: 'https://via.placeholder.com/300x300?text=Watch',
          rating: 4.8,
          reviewCount: 256,
          sellerId: 's2',
          sellerName: 'Gadget Hub',
          inStock: true,
          addedAt: '2024-01-20T14:20:00Z'
        },
        {
          id: 'p3',
          name: 'Laptop Stand',
          nameAr: 'حامل لابتوب',
          price: 149,
          currency: 'SAR',
          thumbnail: 'https://via.placeholder.com/300x300?text=Stand',
          rating: 4.2,
          reviewCount: 64,
          sellerId: 's1',
          sellerName: 'Tech Store',
          inStock: false,
          addedAt: '2024-01-25T09:15:00Z'
        }
      ];

      setFavorites(mockFavorites);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      // TODO: Call API to remove from favorites
      // await fetch(`/api/favorites/${productId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      setFavorites(favorites.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    if (!product.inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
      maxQuantity: 10,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      inStock: product.inStock
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </Link>
            <h1 className="text-xl font-bold">{t('favorites.title')}</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('favorites.title')}</h1>
          {favorites.length > 0 && (
            <span className="ms-auto text-sm text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="max-w-4xl mx-auto p-4">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('favorites.empty')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('favorites.emptyDescription')}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="absolute top-2 end-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  aria-label={t('favorites.remove')}
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>

                {/* Product Image */}
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={product.thumbnail}
                      alt={language === 'ar' ? product.nameAr : product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-white text-gray-900 text-sm font-semibold rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.originalPrice && (
                      <div className="absolute top-2 start-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-3">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">
                      {language === 'ar' ? product.nameAr : product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-xs text-gray-600 ms-1">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price, language)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice, language)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      product.inStock
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.inStock ? t('favorites.addToCart') : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
