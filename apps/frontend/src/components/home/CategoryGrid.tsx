'use client';

import { useRouter } from 'next/navigation';

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string; // emoji or icon identifier
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
  language?: 'en' | 'ar';
}

export function CategoryGrid({ categories, language = 'en' }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories?category=${categoryId}`);
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          {/* Icon Container */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
            <span className="text-3xl" role="img" aria-label={category.name}>
              {category.icon}
            </span>
          </div>

          {/* Category Name */}
          <p className="text-xs text-center text-gray-700 font-medium line-clamp-2">
            {language === 'ar' ? category.nameAr : category.name}
          </p>

          {/* Product Count (optional) */}
          {category.productCount !== undefined && (
            <p className="text-[10px] text-gray-500">
              {category.productCount}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
