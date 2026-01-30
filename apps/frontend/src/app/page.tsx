'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BottomNav } from '@/components/navigation';
import { SearchBar } from '@/components/search';
import { BannerCarousel, type Banner, CategoryGrid, type Category, ProductSection, FlashDealSection, type Product } from '@/components/home';

// Mock banner data - will be replaced with API call
const mockBanners: Banner[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    title: 'Summer Sale - Up to 50% Off',
    titleAr: 'تخفيضات الصيف - خصم يصل إلى 50%',
    subtitle: 'Shop the latest fashion trends',
    subtitleAr: 'تسوق أحدث صيحات الموضة',
    linkType: 'category',
    linkId: 'fashion',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop',
    title: 'New Electronics Arrivals',
    titleAr: 'وصل حديثاً من الإلكترونيات',
    subtitle: 'Discover the latest tech',
    subtitleAr: 'اكتشف أحدث التقنيات',
    linkType: 'category',
    linkId: 'electronics',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    title: 'Home & Living Essentials',
    titleAr: 'أساسيات المنزل والمعيشة',
    subtitle: 'Transform your space',
    subtitleAr: 'حول مساحتك',
    linkType: 'category',
    linkId: 'home',
  },
];

// Mock category data - will be replaced with API call
const mockCategories: Category[] = [
  { id: 'electronics', name: 'Electronics', nameAr: 'إلكترونيات', icon: '📱', productCount: 1234 },
  { id: 'fashion', name: 'Fashion', nameAr: 'أزياء', icon: '👗', productCount: 2456 },
  { id: 'home', name: 'Home & Living', nameAr: 'منزل ومعيشة', icon: '🏠', productCount: 987 },
  { id: 'beauty', name: 'Beauty', nameAr: 'جمال', icon: '💄', productCount: 654 },
  { id: 'sports', name: 'Sports', nameAr: 'رياضة', icon: '⚽', productCount: 432 },
  { id: 'toys', name: 'Toys', nameAr: 'ألعاب', icon: '🧸', productCount: 876 },
  { id: 'books', name: 'Books', nameAr: 'كتب', icon: '📚', productCount: 543 },
  { id: 'food', name: 'Food', nameAr: 'طعام', icon: '🍔', productCount: 321 },
];

// Mock product data - will be replaced with API call
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    nameAr: 'سماعات بلوتوث لاسلكية',
    price: 299.99,
    originalPrice: 399.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 128,
    sellerId: 'seller1',
    sellerName: 'Tech Store',
    inStock: true,
    badge: 'sale',
  },
  {
    id: '2',
    name: 'Smart Watch Series 5',
    nameAr: 'ساعة ذكية سلسلة 5',
    price: 899.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 256,
    sellerId: 'seller2',
    sellerName: 'Gadget Hub',
    inStock: true,
    badge: 'trending',
  },
  {
    id: '3',
    name: 'Premium Leather Backpack',
    nameAr: 'حقيبة ظهر جلدية فاخرة',
    price: 449.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    rating: 4.3,
    reviewCount: 89,
    sellerId: 'seller3',
    sellerName: 'Fashion Outlet',
    inStock: true,
    badge: 'new',
  },
  {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    nameAr: 'مكبر صوت بلوتوث محمول',
    price: 199.99,
    originalPrice: 249.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 342,
    sellerId: 'seller1',
    sellerName: 'Tech Store',
    inStock: true,
    badge: 'sale',
  },
  {
    id: '5',
    name: 'Fitness Tracker Band',
    nameAr: 'سوار تتبع اللياقة البدنية',
    price: 149.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop',
    rating: 4.4,
    reviewCount: 167,
    sellerId: 'seller4',
    sellerName: 'Sports Pro',
    inStock: true,
  },
  {
    id: '6',
    name: 'Wireless Gaming Mouse',
    nameAr: 'ماوس ألعاب لاسلكي',
    price: 179.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 203,
    sellerId: 'seller5',
    sellerName: 'Gaming World',
    inStock: true,
    badge: 'trending',
  },
  {
    id: '7',
    name: 'USB-C Fast Charger',
    nameAr: 'شاحن سريع USB-C',
    price: 89.99,
    originalPrice: 129.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 412,
    sellerId: 'seller1',
    sellerName: 'Tech Store',
    inStock: true,
    badge: 'sale',
  },
  {
    id: '8',
    name: 'Mechanical Keyboard RGB',
    nameAr: 'لوحة مفاتيح ميكانيكية RGB',
    price: 349.99,
    currency: 'SAR',
    thumbnail: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 178,
    sellerId: 'seller5',
    sellerName: 'Gaming World',
    inStock: true,
    badge: 'new',
  },
];

// Mock flash deal - ends in 2 hours from now
const mockFlashDeal = {
  id: 'flash-1',
  products: mockProducts.filter((p) => p.badge === 'sale'),
  endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
};

export default function Home() {
  const { t, language } = useTranslation('home');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleAddToCart = async (productId: string) => {
    // Find the product
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return;

    // Add to cart using the cart store
    const { addItem } = await import('@/store/cartStore').then((m) => m.useCartStore.getState());
    
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
      maxQuantity: 10, // Default max quantity
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      inStock: product.inStock,
    });

    // Show success feedback (could be a toast notification)
    console.log('Added to cart:', product.name);
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Header with Search Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">WISAL</h1>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <SearchBar />
              </div>

              {/* Language Switcher */}
              <div className="flex-shrink-0">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Hero Banner Carousel */}
          <section className="mb-8">
            <BannerCarousel banners={mockBanners} language={language} />
          </section>

          {/* Category Quick Access */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{t('sections.categories')}</h2>
            <CategoryGrid categories={mockCategories} language={language} />
          </section>

          {/* Trending Products */}
          <ProductSection
            title={t('sections.trending')}
            products={mockProducts.filter((p) => p.badge === 'trending')}
            language={language}
            viewAllText={t('deals.viewAll')}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            scrollable={true}
          />

          {/* Flash Deals */}
          <FlashDealSection
            deal={mockFlashDeal}
            title={t('sections.flashDeals')}
            language={language}
            viewAllText={t('deals.viewAll')}
            endsInText={t('deals.endsIn')}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />

          {/* New Arrivals */}
          <ProductSection
            title={t('sections.newArrivals')}
            products={mockProducts.filter((p) => p.badge === 'new')}
            language={language}
            viewAllText={t('deals.viewAll')}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            scrollable={false}
          />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
