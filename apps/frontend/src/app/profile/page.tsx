'use client';

import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard,
  Bell,
  Languages,
  HelpCircle,
  LogOut,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

interface UserStats {
  totalOrders: number;
  reviewsWritten: number;
  favoriteItems: number;
}

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalOrders: 0, reviewsWritten: 0, favoriteItems: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user data from API
    // For now, using mock data
    const mockUser: User = {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Al-Saud',
      email: 'ahmed@example.com',
      phone: '+966501234567'
    };
    
    const mockStats: UserStats = {
      totalOrders: 12,
      reviewsWritten: 5,
      favoriteItems: 8
    };

    setUser(mockUser);
    setStats(mockStats);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  };

  const menuItems = [
    {
      icon: ShoppingBag,
      label: t('menu.orders'),
      href: '/profile/orders',
      badge: stats.totalOrders > 0 ? stats.totalOrders : undefined
    },
    {
      icon: Heart,
      label: t('menu.favorites'),
      href: '/profile/favorites',
      badge: stats.favoriteItems > 0 ? stats.favoriteItems : undefined
    },
    {
      icon: MapPin,
      label: t('menu.addresses'),
      href: '/profile/addresses'
    },
    {
      icon: CreditCard,
      label: t('menu.paymentMethods'),
      href: '/profile/payment-methods'
    },
    {
      icon: Bell,
      label: t('menu.notifications'),
      href: '/profile/notifications'
    },
    {
      icon: Languages,
      label: t('menu.language'),
      href: '/profile/language'
    },
    {
      icon: HelpCircle,
      label: t('menu.help'),
      href: '/profile/help'
    }
  ];

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 p-4 pb-24">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 p-4 pb-24">
          <div className="max-w-md mx-auto mt-20 text-center">
            <UserCircle className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('userInfo.notLoggedIn')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('userInfo.loginPrompt')}
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Login
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        {/* User Info Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-600">{user.phone}</p>
                )}
              </div>

              <button
                className="text-sm text-primary hover:text-primary/80 font-medium"
                onClick={() => {/* TODO: Navigate to edit profile */}}
              >
                {t('userInfo.editProfile')}
              </button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <div className="text-xs text-gray-600">{t('stats.totalOrders')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.reviewsWritten}</div>
                <div className="text-xs text-gray-600">{t('stats.reviewsWritten')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.favoriteItems}</div>
                <div className="text-xs text-gray-600">{t('stats.favoriteItems')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-6 h-6 text-gray-600" />
                <span className="flex-1 text-gray-900">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-semibold bg-primary text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180" />
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-white border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-medium">{t('menu.logout')}</span>
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
