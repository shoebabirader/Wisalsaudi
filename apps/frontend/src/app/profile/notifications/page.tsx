'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft,
  Bell,
  CheckCircle
} from 'lucide-react';

interface NotificationPreferences {
  orderUpdates: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  promotions: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  priceDrops: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  restockAlerts: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export default function NotificationSettingsPage() {
  const { t } = useTranslation('profile');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: { email: true, sms: true, push: true },
    promotions: { email: true, sms: false, push: true },
    priceDrops: { email: true, sms: false, push: true },
    restockAlerts: { email: true, sms: false, push: true }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/notifications/preferences', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setPreferences(data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setIsLoading(false);
    }
  };

  const handleToggle = (category: keyof NotificationPreferences, channel: 'email' | 'sms' | 'push') => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to save preferences
      // await fetch('/api/notifications/preferences', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(preferences)
      // });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationCategories: Array<{
    key: keyof NotificationPreferences;
    title: string;
    description: string;
  }> = [
    {
      key: 'orderUpdates',
      title: t('notifications.orderUpdates'),
      description: t('notifications.orderUpdatesDesc')
    },
    {
      key: 'promotions',
      title: t('notifications.promotions'),
      description: t('notifications.promotionsDesc')
    },
    {
      key: 'priceDrops',
      title: t('notifications.priceDrops'),
      description: t('notifications.priceDropsDesc')
    },
    {
      key: 'restockAlerts',
      title: t('notifications.restockAlerts'),
      description: t('notifications.restockAlertsDesc')
    }
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </Link>
            <h1 className="text-xl font-bold">{t('notifications.title')}</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('notifications.title')}</h1>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{t('notifications.saved')}</span>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          {notificationCategories.map((category) => (
            <div
              key={category.key}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              {/* Category Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </div>

              {/* Channel Toggles */}
              <div className="grid grid-cols-3 gap-3">
                {/* Email */}
                <button
                  onClick={() => handleToggle(category.key, 'email')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences[category.key].email
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      preferences[category.key].email
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {preferences[category.key].email && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      preferences[category.key].email
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}>
                      {t('notifications.email')}
                    </span>
                  </div>
                </button>

                {/* SMS */}
                <button
                  onClick={() => handleToggle(category.key, 'sms')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences[category.key].sms
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      preferences[category.key].sms
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {preferences[category.key].sms && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      preferences[category.key].sms
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}>
                      {t('notifications.sms')}
                    </span>
                  </div>
                </button>

                {/* Push */}
                <button
                  onClick={() => handleToggle(category.key, 'push')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences[category.key].push
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      preferences[category.key].push
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {preferences[category.key].push && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      preferences[category.key].push
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}>
                      {t('notifications.push')}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Saving...' : t('notifications.save')}
        </button>
      </div>
    </main>
  );
}
