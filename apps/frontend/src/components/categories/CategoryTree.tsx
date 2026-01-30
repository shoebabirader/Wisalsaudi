'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
}

interface CategoryTreeProps {
  categories: Category[];
  language?: 'en' | 'ar';
  selectedCategoryId?: string | null;
}

export function CategoryTree({
  categories,
  language = 'en',
  selectedCategoryId,
}: CategoryTreeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    router.push(`/categories?${params.toString()}`);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingInlineStart: `${level * 1.5 + 0.75}rem` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-90' : 'rtl:rotate-180'
                }`}
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
          )}

          {/* Category Name */}
          <div
            onClick={() => handleCategoryClick(category.id)}
            className="flex-1 flex items-center justify-between"
          >
            <span className="text-sm">
              {language === 'ar' ? category.nameAr : category.name}
            </span>
            <span className="text-xs text-gray-500">({category.productCount})</span>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* All Categories Option */}
      <div
        onClick={() => handleCategoryClick('all')}
        className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
          !selectedCategoryId || selectedCategoryId === 'all'
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <span className="text-sm">
          {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
        </span>
      </div>

      {/* Category Tree */}
      {categories.map((category) => renderCategory(category))}
    </div>
  );
}
