'use client';

import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/i18n/formatters';

interface Specification {
  key: string;
  keyAr: string;
  value: string;
  valueAr: string;
}

interface ProductInfoProps {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  currency: 'SAR';
  sellerId: string;
  sellerName: string;
  rating: {
    average: number;
    count: number;
  };
  specifications: Specification[];
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    inStock: boolean;
  };
  language?: 'en' | 'ar';
}

export function ProductInfo({
  name,
  nameAr,
  description,
  descriptionAr,
  price,
  originalPrice,
  currency,
  sellerId,
  sellerName,
  rating,
  specifications,
  inventory,
  language = 'en',
}: ProductInfoProps) {
  const router = useRouter();

  const handleSellerClick = () => {
    // Navigate to seller's store page
    router.push(`/sellers/${sellerId}`);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getStockStatus = () => {
    if (!inventory.inStock) {
      return {
        text: language === 'ar' ? 'نفذت الكمية' : 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    }
    if (inventory.quantity <= inventory.lowStockThreshold) {
      return {
        text: language === 'ar' ? `${inventory.quantity} متبقي فقط` : `Only ${inventory.quantity} left`,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      };
    }
    return {
      text: language === 'ar' ? 'متوفر' : 'In Stock',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === 'ar' ? nameAr : name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {renderStars(rating.average)}
          </div>
          <span className="text-lg font-medium text-gray-900">
            {rating.average.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({rating.count} {language === 'ar' ? 'تقييم' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-primary">
          {formatPrice(price, language)}
        </span>
        {originalPrice && originalPrice > price && (
          <>
            <span className="text-2xl text-gray-400 line-through">
              {formatPrice(originalPrice, language)}
            </span>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {language === 'ar' ? 'خصم' : 'Save'}{' '}
              {Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${stockStatus.bgColor}`}>
        <div className={`w-2 h-2 rounded-full ${stockStatus.color.replace('text-', 'bg-')}`}></div>
        <span className={`font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </span>
      </div>

      {/* Seller Information */}
      <div className="border-t border-b border-gray-200 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {language === 'ar' ? 'البائع' : 'Sold by'}
            </p>
            <button
              onClick={handleSellerClick}
              className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {sellerName}
            </button>
          </div>
          <button
            onClick={handleSellerClick}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {language === 'ar' ? 'زيارة المتجر' : 'Visit Store'}
            <svg
              className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`}
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

      {/* Description */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          {language === 'ar' ? 'الوصف' : 'Description'}
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {language === 'ar' ? descriptionAr : description}
        </p>
      </div>

      {/* Specifications */}
      {specifications && specifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === 'ar' ? 'المواصفات' : 'Specifications'}
          </h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {specifications.map((spec, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3">
                      {language === 'ar' ? spec.keyAr : spec.key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {language === 'ar' ? spec.valueAr : spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
