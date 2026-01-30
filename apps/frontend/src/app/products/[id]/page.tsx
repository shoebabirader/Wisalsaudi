'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/navigation';
import {
  VideoGallery,
  ProductInfo,
  ProductActions,
  ReviewsSection,
  RelatedProducts,
} from '@/components/products';

interface ProductDetailData {
  _id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  currency: 'SAR';
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryPath: string[];
  videos: Array<{
    id: string;
    url: string;
    hlsUrl: string;
    thumbnail: string;
    duration: number;
    order: number;
    views?: number;
    likes?: number;
  }>;
  specifications: Array<{
    key: string;
    keyAr: string;
    value: string;
    valueAr: string;
  }>;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
    inStock: boolean;
  };
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useTranslation('products');
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/${productId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Loading state
  if (loading) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pb-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-10 w-24 bg-gray-200 rounded mb-6"></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video gallery skeleton */}
                <div className="aspect-square bg-gray-200 rounded-lg"></div>

                {/* Product info skeleton */}
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 pb-24">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {language === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'ar'
                  ? 'عذراً، لم نتمكن من العثور على المنتج المطلوب'
                  : "Sorry, we couldn't find the product you're looking for"}
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
            <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
          </button>

          {/* Product Detail Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Video Gallery Section */}
            <div>
              <VideoGallery
                videos={product.videos}
                productName={language === 'ar' ? product.nameAr : product.name}
              />
            </div>

            {/* Product Information Section */}
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-white rounded-lg p-6">
                <ProductInfo
                  name={product.name}
                  nameAr={product.nameAr}
                  description={product.description}
                  descriptionAr={product.descriptionAr}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  currency={product.currency}
                  sellerId={product.sellerId}
                  sellerName={product.sellerName}
                  rating={product.rating}
                  specifications={product.specifications}
                  inventory={product.inventory}
                  language={language}
                />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg p-6">
                <ProductActions
                  productId={product._id}
                  productName={product.name}
                  productNameAr={product.nameAr}
                  price={product.price}
                  thumbnail={product.videos[0]?.thumbnail || ''}
                  sellerId={product.sellerId}
                  sellerName={product.sellerName}
                  inStock={product.inventory.inStock}
                  maxQuantity={product.inventory.quantity}
                  language={language}
                />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <ReviewsSection
              productId={product._id}
              rating={product.rating}
              language={language}
            />
          </div>

          {/* Related Products Section */}
          <RelatedProducts
            productId={product._id}
            categoryId={product.categoryId}
            language={language}
          />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
