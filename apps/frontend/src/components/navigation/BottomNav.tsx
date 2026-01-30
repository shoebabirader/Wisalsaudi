'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useCartStore } from '@/store/cartStore';
import { 
  HomeIcon, 
  CategoryIcon, 
  VideoIcon, 
  CartIcon, 
  ProfileIcon 
} from './NavIcons';

interface NavItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ active: boolean }>;
  labelKey: string;
  badge?: number;
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation('common');
  const cartItemCount = useCartStore((state) => state.items.length);

  const navItems: NavItem[] = [
    {
      id: 'home',
      path: '/',
      icon: HomeIcon,
      labelKey: 'nav.home',
    },
    {
      id: 'categories',
      path: '/categories',
      icon: CategoryIcon,
      labelKey: 'nav.categories',
    },
    {
      id: 'videos',
      path: '/videos',
      icon: VideoIcon,
      labelKey: 'nav.videos',
    },
    {
      id: 'cart',
      path: '/cart',
      icon: CartIcon,
      labelKey: 'nav.cart',
      badge: cartItemCount,
    },
    {
      id: 'profile',
      path: '/profile',
      icon: ProfileIcon,
      labelKey: 'nav.profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200 relative
                ${isActive ? 'text-primary' : 'text-gray-600'}
                hover:text-primary active:scale-95
              `}
            >
              <div className="relative">
                <Icon active={isActive} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -end-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-accent rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`
                text-xs mt-1 font-medium
                ${isActive ? 'text-primary' : 'text-gray-600'}
              `}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
