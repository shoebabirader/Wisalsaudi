'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'popularity';
export type ViewMode = 'grid' | 'list';

interface ProductToolbarProps {
  productCount: number;
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  language?: 'en' | 'ar';
}

export function ProductToolbar({
  productCount,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  language = 'en',
}: ProductToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortOptions: Array<{ value: SortOption; label: string; labelAr: string }> = [
    { value: 'relevance', label: 'Relevance', labelAr: 'الأكثر صلة' },
    { value: 'price-asc', label: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
    { value: 'price-desc', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
    { value: 'newest', label: 'Newest', labelAr: 'الأحدث' },
    { value: 'popularity', label: 'Most Popular', labelAr: 'الأكثر شعبية' },
  ];

  const handleSortChange = (newSort: SortOption) => {
    onSortChange(newSort);
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/categories?${params.toString()}`);
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    onViewModeChange(newMode);
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newMode);
    router.push(`/categories?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Product Count */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">{productCount}</span>{' '}
        {language === 'ar' ? 'منتج' : productCount === 1 ? 'product' : 'products'}
      </div>

      {/* Sort and View Controls */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
            {language === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {language === 'ar' ? option.labelAr : option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={language === 'ar' ? 'عرض شبكي' : 'Grid view'}
            title={language === 'ar' ? 'عرض شبكي' : 'Grid view'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={language === 'ar' ? 'عرض قائمة' : 'List view'}
            title={language === 'ar' ? 'عرض قائمة' : 'List view'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
