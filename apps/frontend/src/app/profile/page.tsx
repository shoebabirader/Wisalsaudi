'use client';

import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ProfilePage() {
  const { t } = useTranslation('profile');

  return (
    <>
      <main className="min-h-screen p-8 pb-24">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {t('title')}
        </h1>
        
        <div className="space-y-4 max-w-md">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">{t('menu.language')}</h3>
            <LanguageSwitcher />
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold">{t('menu.orders')}</h3>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold">{t('menu.favorites')}</h3>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold">{t('menu.addresses')}</h3>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold">{t('menu.help')}</h3>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
