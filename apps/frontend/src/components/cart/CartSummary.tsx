'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { formatPrice } from '@/lib/i18n/formatters';
import { Tag, X } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discountCode?: string;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
  onCheckout: () => void;
  hasOutOfStockItems?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  discount,
  total,
  discountCode,
  onApplyDiscount,
  onRemoveDiscount,
  onCheckout,
  hasOutOfStockItems = false,
}: CartSummaryProps) {
  const { t, language } = useTranslation('cart');
  const [discountInput, setDiscountInput] = useState('');
  const [showDiscountInput, setShowDiscountInput] = useState(!discountCode);

  const handleApplyDiscount = () => {
    if (discountInput.trim()) {
      onApplyDiscount(discountInput.trim());
      setDiscountInput('');
      setShowDiscountInput(false);
    }
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    setShowDiscountInput(true);
  };

  // Calculate estimated delivery date (7 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  const deliveryDate = new Intl.DateTimeFormat(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  ).format(estimatedDelivery);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {t('summary.title') || 'Order Summary'}
      </h2>

      {/* Summary Items */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-700">
          <span>{t('summary.subtotal')}</span>
          <span className="font-medium">{formatPrice(subtotal, language)}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>{t('summary.shipping')}</span>
          <span className="font-medium">
            {shipping === 0
              ? (t('summary.free') || 'Free')
              : formatPrice(shipping, language)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{t('summary.discount')}</span>
            <span className="font-medium">
              -{formatPrice(discount, language)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>{t('summary.total')}</span>
            <span>{formatPrice(total, language)}</span>
          </div>
        </div>
      </div>

      {/* Discount Code Section */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        {discountCode ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {discountCode}
              </span>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-green-600 hover:text-green-800"
              aria-label="Remove discount code"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : showDiscountInput ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder={t('actions.applyDiscount')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyDiscount();
                  }
                }}
              />
              <button
                onClick={handleApplyDiscount}
                disabled={!discountInput.trim()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('actions.apply') || 'Apply'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDiscountInput(true)}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            {t('actions.applyDiscount')}
          </button>
        )}
      </div>

      {/* Estimated Delivery */}
      <div className="mb-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-1">
          {t('summary.estimatedDelivery')}
        </p>
        <p>{deliveryDate}</p>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={hasOutOfStockItems}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {t('actions.proceedToCheckout')}
      </button>

      {hasOutOfStockItems && (
        <p className="text-sm text-red-600 text-center mt-2">
          {t('summary.outOfStockWarning') || 'Remove out of stock items to proceed'}
        </p>
      )}

      {/* Continue Shopping Link */}
      <a
        href="/"
        className="block text-center text-primary hover:text-primary/80 text-sm font-medium mt-4"
      >
        {t('actions.continueShopping')}
      </a>
    </div>
  );
}
