import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the i18n hooks
vi.mock('@/lib/i18n', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    dir: 'ltr',
  }),
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'hero.title': 'Discover Products Through Video',
        'hero.subtitle': 'Shop the latest trends with immersive video shopping',
        'sections.trending': 'Trending Now',
        'sections.flashDeals': 'Flash Deals',
        'sections.newArrivals': 'New Arrivals',
        'sections.categories': 'Shop by Category',
      };
      return translations[key] || key;
    },
    language: 'en',
  }),
}));

// Mock the navigation component
vi.mock('@/components/navigation', () => ({
  BottomNav: () => <div data-testid="bottom-nav">Bottom Navigation</div>,
}));

// Mock the language switcher
vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// Mock the SearchBar component
vi.mock('@/components/search/SearchBar', () => ({
  default: () => <div data-testid="search-bar">Search Bar</div>,
}));

describe('Home Page', () => {
  it('should render the hero banner title', () => {
    render(<Home />);
    // The banner carousel shows the first banner's title
    expect(screen.getByText('Summer Sale - Up to 50% Off')).toBeInTheDocument();
  });

  it('should render the hero banner subtitle', () => {
    render(<Home />);
    // The banner carousel shows the first banner's subtitle
    expect(screen.getByText('Shop the latest fashion trends')).toBeInTheDocument();
  });

  it('should render the language switcher', () => {
    render(<Home />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('should render the bottom navigation', () => {
    render(<Home />);
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should render section cards', () => {
    render(<Home />);
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
    expect(screen.getByText('Flash Deals')).toBeInTheDocument();
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Shop by Category')).toBeInTheDocument();
  });
});
