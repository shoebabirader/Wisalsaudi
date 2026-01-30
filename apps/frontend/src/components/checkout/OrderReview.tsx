'use client';

/**
 * Order Review Component
 * Final review and order placement with payment processing
 * Requirements: 11.5, 11.6, 11.8 - Order review and placement
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatPrice } from '@/lib/i18n/formatters';
import { useCartStore } from '@/store/cartStore';

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

interface OrderReviewProps {
  addressId: string;
  shippingMethodId: string;
  paymentMethodId: string;
  onBack: () => void;
}

export default function OrderReview({
  addressId,
  shippingMethodId,
  paymentMethodId,
  onBack,
}: OrderReviewProps) {
  const { t, language } = useTranslation('checkout');
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = shippingMethodId === 'standard' ? 0 : shippingMethodId === 'express' ? 25 : 50;
  const discount = 0;
  const finalTotal = total + shippingCost - discount;

  useEffect(() => {
    fetchAddress();
  }, [addressId]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/addresses/${addressId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAddress(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShippingMethodName = (id: string): string => {
    const methods: Record<string, { en: string; ar: string }> = {
      standard: { en: 'Standard Shipping', ar: 'الشحن القياسي' },
      express: { en: 'Express Shipping', ar: 'الشحن السريع' },
      'same-day': { en: 'Same Day Delivery', ar: 'التوصيل في نفس اليوم' },
    };
    return language === 'ar' ? methods[id]?.ar : methods[id]?.en;
  };

  const getPaymentMethodName = (id: string): string => {
    const methods: Record<string, { en: string; ar: string }> = {
      mada: { en: 'Mada', ar: 'مدى' },
      visa: { en: 'Visa / Mastercard', ar: 'فيزا / ماستركارد' },
      'apple-pay': { en: 'Apple Pay', ar: 'آبل باي' },
      'stc-pay': { en: 'STC Pay', ar: 'إس تي سي باي' },
    };
    return language === 'ar' ? methods[id]?.ar : methods[id]?.en;
  };

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) {
      setError(t('mustAgreeToTerms', 'You must agree to the terms and conditions'));
      return;
    }

    setError('');
    setPlacing(true);

    try {
      // Step 1: Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          shippingAddressId: addressId,
          shippingMethod: shippingMethodId,
          shippingCost: shippingCost,
          discount: discount,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.data.id;

      // Step 2: Create payment intent
      const paymentSource = getPaymentSource(paymentMethodId);
      
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: orderId,
          paymentSource: paymentSource,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();

      // Step 3: Confirm payment
      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: paymentData.paymentIntent.id,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push(`/orders/${orderId}?success=true`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setError(err.message || t('orderFailed', 'Failed to place order. Please try again.'));
    } finally {
      setPlacing(false);
    }
  };

  const getPaymentSource = (methodId: string) => {
    // Map payment method ID to Moyasar payment source format
    switch (methodId) {
      case 'mada':
      case 'visa':
        return {
          type: 'creditcard' as const,
          // In a real implementation, card details would be collected securely
          // For now, we'll use a placeholder that would be replaced with actual card data
        };
      case 'apple-pay':
        return {
          type: 'applepay' as const,
          // Apple Pay token would be provided here
        };
      case 'stc-pay':
        return {
          type: 'stcpay' as const,
          // STC Pay details would be provided here
        };
      default:
        return {
          type: 'creditcard' as const,
        };
    }
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
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('orderSummary', 'Order Summary')}
        </h2>

        {/* Items */}
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.thumbnail}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {t('quantity', 'Qty')}: {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.price * item.quantity, language)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>{t('subtotal', 'Subtotal')}</span>
            <span>{formatPrice(total, language)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{t('shippingFee', 'Shipping Fee')}</span>
            <span>
              {shippingCost === 0 ? t('free', 'Free') : formatPrice(shippingCost, language)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('discount', 'Discount')}</span>
              <span>-{formatPrice(discount, language)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>{t('total', 'Total')}</span>
            <span>{formatPrice(finalTotal, language)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-3">{t('deliveryAddress', 'Delivery Address')}</h3>
        {address && (
          <div className="text-gray-700">
            <p className="font-medium capitalize">{address.type}</p>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.province} {address.postal_code}
            </p>
            <p>{address.country}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{t('shippingMethod', 'Shipping Method')}</span>
            <span className="font-medium">{getShippingMethodName(shippingMethodId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('paymentMethod', 'Payment Method')}</span>
            <span className="font-medium">{getPaymentMethodName(paymentMethodId)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            {t('agreeToTerms', 'I agree to the terms and conditions')}
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={placing}
          className="flex-1 px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
        >
          {t('back', 'Back')}
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={!agreeToTerms || placing}
          className={`flex-1 px-8 py-3 rounded-lg font-medium ${
            agreeToTerms && !placing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {placing ? t('placingOrder', 'Placing Order...') : t('placeOrder', 'Place Order')}
        </button>
      </div>
    </div>
  );
}
