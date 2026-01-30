'use client';

/**
 * Checkout Page
 * Complete checkout flow with address, shipping, payment, and order review
 * Requirements: 11.1, 11.2, 11.3, 11.5 - Checkout flow
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useCartStore } from '@/store/cartStore';
import AddressSelection from '@/components/checkout/AddressSelection';
import ShippingMethod from '@/components/checkout/ShippingMethod';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderReview from '@/components/checkout/OrderReview';

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const { t } = useTranslation('checkout');
  const router = useRouter();
  const { items, total } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const steps: { key: CheckoutStep; label: string; labelAr: string }[] = [
    { key: 'address', label: 'Address', labelAr: 'العنوان' },
    { key: 'shipping', label: 'Shipping', labelAr: 'الشحن' },
    { key: 'payment', label: 'Payment', labelAr: 'الدفع' },
    { key: 'review', label: 'Review', labelAr: 'المراجعة' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleShippingSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId);
  };

  const handlePaymentSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleNext = () => {
    if (currentStep === 'address' && selectedAddressId) {
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping' && selectedShippingMethod) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && selectedPaymentMethod) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('address');
    } else if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('checkout', 'Checkout')}
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {t(step.key, step.label)}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentStep === 'address' && (
          <AddressSelection
            selectedAddressId={selectedAddressId}
            onSelect={handleAddressSelect}
            onNext={handleNext}
          />
        )}

        {currentStep === 'shipping' && (
          <ShippingMethod
            selectedMethodId={selectedShippingMethod}
            onSelect={handleShippingSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentMethod
            selectedMethodId={selectedPaymentMethod}
            onSelect={handlePaymentSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'review' && (
          <OrderReview
            addressId={selectedAddressId!}
            shippingMethodId={selectedShippingMethod!}
            paymentMethodId={selectedPaymentMethod!}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
