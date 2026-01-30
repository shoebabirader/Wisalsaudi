'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/navigation';
import { ProductCard, Product } from '@/components/home/ProductCard';
import {
  CategoryTree,
  Category,
  FilterPanel,
  FilterState,
  ProductToolbar,
  SortOption,
  ViewMode,
  ProductListItem,
} from '@/components/categories';

function CategoriesContent() {
  const { t, language } = useTranslation('products');
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const sortParam = searchParams.get('sort') as SortOption | null;
  const viewParam = searchParams.get('view') as ViewMode | null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string; nameAr: string }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    brands: [],
    sellers: [],
    rating: null,
    inStockOnly: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>(sortParam || 'relevance');
  const [viewMode, setViewMode] = useState<ViewMode>(viewParam || 'grid');

  // Intersection Observer ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // Mock data for filters
  const availableBrands = ['Samsung', 'Apple', 'Huawei', 'Xiaomi', 'Sony'];
  const availableSellers = ['Tech Store', 'Electronics Hub', 'Mobile World', 'Gadget Shop'];

  // Fetch products function
  const fetchProducts = useCallback(async (_pageNum: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setProducts([]);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock: No products for now, but in real implementation:
      // const response = await fetch(`/api/products?page=${_pageNum}&category=${categoryId}&sort=${sortBy}...`);
      // const data = await response.json();
      
      // For now, just set empty array and no more pages
      if (reset) {
        setProducts([]);
      }
      setHasMore(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryId, filters, sortBy]);

  // Initial load and when filters/sort change
  useEffect(() => {
    fetchProducts(1, true);
  }, [categoryId, filters, sortBy, fetchProducts]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, page, fetchProducts]);

  useEffect(() => {
    // TODO: Fetch categories from API
    // Mock categories data
    const mockCategories: Category[] = [
      {
        id: 'electronics',
        name: 'Electronics',
        nameAr: 'إلكترونيات',
        productCount: 150,
        children: [
          {
            id: 'phones',
            name: 'Phones & Tablets',
            nameAr: 'هواتف وأجهزة لوحية',
            parentId: 'electronics',
            productCount: 45,
          },
          {
            id: 'computers',
            name: 'Computers',
            nameAr: 'أجهزة كمبيوتر',
            parentId: 'electronics',
            productCount: 35,
          },
          {
            id: 'accessories',
            name: 'Accessories',
            nameAr: 'إكسسوارات',
            parentId: 'electronics',
            productCount: 70,
          },
        ],
      },
      {
        id: 'fashion',
        name: 'Fashion',
        nameAr: 'أزياء',
        productCount: 200,
        children: [
          {
            id: 'mens',
            name: "Men's Fashion",
            nameAr: 'أزياء رجالية',
            parentId: 'fashion',
            productCount: 80,
          },
          {
            id: 'womens',
            name: "Women's Fashion",
            nameAr: 'أزياء نسائية',
            parentId: 'fashion',
            productCount: 120,
          },
        ],
      },
      {
        id: 'home',
        name: 'Home & Kitchen',
        nameAr: 'المنزل والمطبخ',
        productCount: 95,
      },
      {
        id: 'beauty',
        name: 'Beauty & Health',
        nameAr: 'الجمال والصحة',
        productCount: 75,
      },
    ];
    
    setCategories(mockCategories);
    
    // Mock breadcrumbs
    if (categoryId && categoryId !== 'all') {
      setBreadcrumbs([
        { id: 'all', name: 'All Categories', nameAr: 'جميع الفئات' },
        { id: categoryId, name: 'Electronics', nameAr: 'إلكترونيات' }
      ]);
    } else {
      setBreadcrumbs([
        { id: 'all', name: 'All Categories', nameAr: 'جميع الفئات' }
      ]);
    }
  }, [categoryId]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        {/* Header with Breadcrumbs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-gray-400 rtl:rotate-180"
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
                  )}
                  <button
                    className={`${
                      index === breadcrumbs.length - 1
                        ? 'text-primary font-medium'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {language === 'ar' ? crumb.nameAr : crumb.name}
                  </button>
                </div>
              ))}
            </nav>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900">
              {breadcrumbs[breadcrumbs.length - 1]
                ? language === 'ar'
                  ? breadcrumbs[breadcrumbs.length - 1].nameAr
                  : breadcrumbs[breadcrumbs.length - 1].name
                : t('title')}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
              {/* Category Tree */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'الفئات' : 'Categories'}
                </h2>
                <CategoryTree
                  categories={categories}
                  language={language}
                  selectedCategoryId={categoryId}
                />
              </div>

              {/* Filter Panel */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  language={language}
                  availableBrands={availableBrands}
                  availableSellers={availableSellers}
                />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <ProductToolbar
                  productCount={products.length}
                  sortBy={sortBy}
                  viewMode={viewMode}
                  onSortChange={handleSortChange}
                  onViewModeChange={handleViewModeChange}
                  language={language}
                />
              </div>

              {/* Products Grid/List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : products.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          language={language}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <ProductListItem
                          key={product.id}
                          product={product}
                          language={language}
                        />
                      ))}
                    </div>
                  )}

                  {/* Infinite Scroll Trigger */}
                  <div ref={observerTarget} className="py-8">
                    {loadingMore && (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'ar'
                      ? 'جرب تغيير الفلاتر أو البحث عن شيء آخر'
                      : 'Try adjusting your filters or search for something else'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
