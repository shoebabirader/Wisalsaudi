'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { SearchBar } from '@/components/search';
import { ProductCard } from '@/components/home';

interface Product {
  _id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  currency: string;
  videos: Array<{
    thumbnail: string;
    url: string;
  }>;
  rating: {
    average: number;
    count: number;
  };
  sellerId: string;
  sellerName: string;
  inventory: {
    inStock: boolean;
  };
}

interface SearchResults {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function SearchContent() {
  const { t, language } = useTranslation('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query && !category) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (minRating) params.append('minRating', minRating);
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', page.toString());
        params.append('limit', '20');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
        } else {
          throw new Error(data.error?.message || 'Search failed');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, category, minPrice, maxPrice, minRating, sortBy, page]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', newQuery);
    params.delete('page'); // Reset to first page
    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.delete('page'); // Reset to first page
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchBar onSearch={handleSearch} autoFocus={false} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Info and Filters */}
        {results && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {query ? (
                    <>
                      {t('search.resultsFor')} "{query}"
                    </>
                  ) : (
                    t('search.results')
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t('search.foundProducts', { count: results.total })}
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  {t('search.sortBy')}:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">{t('search.sort.relevance')}</option>
                  <option value="newest">{t('search.sort.newest')}</option>
                  <option value="price">{t('search.sort.priceLowHigh')}</option>
                  <option value="rating">{t('search.sort.rating')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && !error && results && results.products.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('search.noResults')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('search.noResultsDescription')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{t('search.suggestions.checkSpelling')}</p>
              <p>{t('search.suggestions.tryDifferent')}</p>
              <p>{t('search.suggestions.tryGeneral')}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && results && results.products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    id: product._id,
                    name: product.name,
                    nameAr: product.nameAr,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    currency: product.currency as 'SAR',
                    thumbnail: product.videos[0]?.thumbnail || '',
                    rating: product.rating.average,
                    reviewCount: product.rating.count,
                    sellerId: product.sellerId,
                    sellerName: product.sellerName,
                    inStock: product.inventory.inStock,
                  }}
                  language={language}
                />
              ))}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {t('pagination.previous')}
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, results.totalPages) }, (_, i) => {
                    let pageNum;
                    if (results.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= results.totalPages - 2) {
                      pageNum = results.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === results.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Initial State (no search yet) */}
        {!isLoading && !error && !results && (
          <div className="bg-white rounded-lg p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('search.startSearching')}
            </h2>
            <p className="text-gray-600">
              {t('search.startSearchingDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
