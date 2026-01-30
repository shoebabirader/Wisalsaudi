'use client';

import { useState } from 'react';

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  sellers: string[];
  rating: number | null;
  inStockOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  language?: 'en' | 'ar';
  availableBrands?: string[];
  availableSellers?: string[];
}

export function FilterPanel({
  filters,
  onFiltersChange,
  language = 'en',
  availableBrands = [],
  availableSellers = [],
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'rating', 'availability'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...localFilters.priceRange] as [number, number];
    newRange[index] = value;
    const newFilters = { ...localFilters, priceRange: newRange };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter((b) => b !== brand)
      : [...localFilters.brands, brand];
    const newFilters = { ...localFilters, brands: newBrands };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSellerToggle = (seller: string) => {
    const newSellers = localFilters.sellers.includes(seller)
      ? localFilters.sellers.filter((s) => s !== seller)
      : [...localFilters.sellers, seller];
    const newFilters = { ...localFilters, sellers: newSellers };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newRating = localFilters.rating === rating ? null : rating;
    const newFilters = { ...localFilters, rating: newRating };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleInStockToggle = () => {
    const newFilters = { ...localFilters, inStockOnly: !localFilters.inStockOnly };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 10000],
      brands: [],
      sellers: [],
      rating: null,
      inStockOnly: false,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    localFilters.brands.length > 0 ||
    localFilters.sellers.length > 0 ||
    localFilters.rating !== null ||
    localFilters.inStockOnly ||
    localFilters.priceRange[0] > 0 ||
    localFilters.priceRange[1] < 10000;

  const renderSection = (
    id: string,
    title: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-3 text-start hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isExpanded && <div className="pb-4">{content}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {language === 'ar' ? 'الفلاتر' : 'Filters'}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-0">
        {/* Price Range */}
        {renderSection(
          'price',
          language === 'ar' ? 'نطاق السعر' : 'Price Range',
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">
                  {language === 'ar' ? 'من' : 'Min'}
                </label>
                <input
                  type="number"
                  value={localFilters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  min={0}
                  max={localFilters.priceRange[1]}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">
                  {language === 'ar' ? 'إلى' : 'Max'}
                </label>
                <input
                  type="number"
                  value={localFilters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  min={localFilters.priceRange[0]}
                  max={10000}
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={localFilters.priceRange[1]}
              onChange={(e) => handlePriceChange(1, Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        )}

        {/* Brands */}
        {availableBrands.length > 0 &&
          renderSection(
            'brands',
            language === 'ar' ? 'العلامات التجارية' : 'Brands',
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          )}

        {/* Sellers */}
        {availableSellers.length > 0 &&
          renderSection(
            'sellers',
            language === 'ar' ? 'البائعون' : 'Sellers',
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableSellers.map((seller) => (
                <label
                  key={seller}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.sellers.includes(seller)}
                    onChange={() => handleSellerToggle(seller)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{seller}</span>
                </label>
              ))}
            </div>
          )}

        {/* Rating */}
        {renderSection(
          'rating',
          language === 'ar' ? 'التقييم' : 'Rating',
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  localFilters.rating === rating
                    ? 'bg-primary/10 border border-primary'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-700">
                  {language === 'ar' ? 'وأعلى' : '& Up'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Availability */}
        {renderSection(
          'availability',
          language === 'ar' ? 'التوفر' : 'Availability',
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={localFilters.inStockOnly}
              onChange={handleInStockToggle}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              {language === 'ar' ? 'المتوفر فقط' : 'In Stock Only'}
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
