'use client';

import { useTranslation } from '@/lib/i18n';
import { ShoppingBag } from 'lucide-react';

export function EmptyCart() {
  const { t } = useTranslation('cart');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Empty Cart Illustration */}
        <div className="mb-6 relative">
          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 start-0 w-full h-full">
            <div className="absolute top-4 start-1/4 w-3 h-3 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute bottom-8 end-1/4 w-2 h-2 bg-secondary/20 rounded-full animate-pulse delay-75" />
            <div className="absolute top-1/2 end-8 w-2.5 h-2.5 bg-accent/20 rounded-full animate-pulse delay-150" />
          </div>
        </div>

        {/* Empty State Text */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('empty.title')}
        </h2>
        <p className="text-gray-600 mb-8">{t('empty.subtitle')}</p>

        {/* Call to Action */}
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {t('empty.browseProducts')}
          </a>
          <a
            href="/videos"
            className="inline-block w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
          >
            {t('empty.watchVideos') || 'Watch Product Videos'}
          </a>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {t('empty.benefits') || 'Why shop with WISAL?'}
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-1">🚚</div>
              <p className="text-xs text-gray-600">
                {t('empty.freeShipping') || 'Free Shipping'}
              </p>
            </div>
            <div>
              <div className="text-2xl mb-1">✨</div>
              <p className="text-xs text-gray-600">
                {t('empty.quality') || 'Quality Products'}
              </p>
            </div>
            <div>
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs text-gray-600">
                {t('empty.secure') || 'Secure Payment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
