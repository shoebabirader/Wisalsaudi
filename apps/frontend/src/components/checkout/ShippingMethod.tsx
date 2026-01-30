'use client';

/**
 * Shipping Method Component
 * Allows users to select shipping method with delivery estimates
 * Requirements: 11.2 - Shipping method selection
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatPrice } from '@/lib/i18n/formatters';

interface ShippingOption {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  cost: number;
  estimatedDays: number;
  currency: string;
}

interface ShippingMethodProps {
  selectedMethodId: string | null;
  onSelect: (methodId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingMethod({
  selectedMethodId,
  onSelect,
  onNext,
  onBack,
}: ShippingMethodProps) {
  const { t, language } = useTranslation('checkout');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, we'll use mock data
      const mockOptions: ShippingOption[] = [
        {
          id: 'standard',
          name: 'Standard Shipping',
          nameAr: 'الشحن القياسي',
          description: 'Delivery within 5-7 business days',
          descriptionAr: 'التوصيل خلال 5-7 أيام عمل',
          cost: 0,
          estimatedDays: 6,
          currency: 'SAR',
        },
        {
          id: 'express',
          name: 'Express Shipping',
          nameAr: 'الشحن السريع',
          description: 'Delivery within 2-3 business days',
          descriptionAr: 'التوصيل خلال 2-3 أيام عمل',
          cost: 25,
          estimatedDays: 2,
          currency: 'SAR',
        },
        {
          id: 'same-day',
          name: 'Same Day Delivery',
          nameAr: 'التوصيل في نفس اليوم',
          description: 'Order before 12 PM for same-day delivery',
          descriptionAr: 'اطلب قبل الساعة 12 ظهراً للتوصيل في نفس اليوم',
          cost: 50,
          estimatedDays: 0,
          currency: 'SAR',
        },
      ];

      setShippingOptions(mockOptions);

      // Auto-select standard shipping if nothing selected
      if (!selectedMethodId) {
        onSelect(mockOptions[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch shipping options:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedDeliveryDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('selectShipping', 'Select Shipping Method')}
        </h2>

        <div className="space-y-3">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethodId === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                  <input
                    type="radio"
                    checked={selectedMethodId === option.id}
                    onChange={() => onSelect(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {language === 'ar' ? option.nameAr : option.name}
                      </span>
                      <span className="font-semibold text-lg">
                        {option.cost === 0
                          ? t('free', 'Free')
                          : formatPrice(option.cost, language)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {language === 'ar' ? option.descriptionAr : option.description}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {t('estimatedDelivery', 'Estimated Delivery')}:{' '}
                      <span className="font-medium text-gray-700">
                        {option.estimatedDays === 0
                          ? t('today', 'Today')
                          : getEstimatedDeliveryDate(option.estimatedDays)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          {t('back', 'Back')}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedMethodId}
          className={`flex-1 px-8 py-3 rounded-lg font-medium ${
            selectedMethodId
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('continue', 'Continue')}
        </button>
      </div>
    </div>
  );
}
