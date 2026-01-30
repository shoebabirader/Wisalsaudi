'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface SearchSuggestion {
  type: 'product' | 'category';
  id: string;
  name: string;
  nameAr?: string;
  thumbnail?: string;
  price?: number;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ onSearch, placeholder, autoFocus = false }: SearchBarProps) {
  const { t, language } = useTranslation('common');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setSuggestions(data.data.suggestions);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`);
    } else {
      router.push(`/categories?category=${suggestion.id}`);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(price);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder || t('search.placeholder')}
          autoFocus={autoFocus}
          className="w-full px-4 py-3 pe-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
          aria-label={t('search.submit')}
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              {t('search.loading')}
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.type}-${suggestion.id}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-start hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    {suggestion.thumbnail && (
                      <img
                        src={suggestion.thumbnail}
                        alt={language === 'ar' ? suggestion.nameAr || suggestion.name : suggestion.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {language === 'ar' ? suggestion.nameAr || suggestion.name : suggestion.name}
                      </div>
                      {suggestion.price !== undefined && (
                        <div className="text-sm text-gray-600">
                          {formatPrice(suggestion.price)}
                        </div>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              {t('search.noSuggestions')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
