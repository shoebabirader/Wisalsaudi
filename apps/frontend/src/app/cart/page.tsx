'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/navigation';
import { useCartStore } from '@/store/cartStore';
import { useCartValidation } from '@/hooks/useCartValidation';
import { CartItem, CartSummary, EmptyCart } from '@/components/cart';

export default function CartPage() {
  const { t } = useTranslation('cart');
  const {
    items,
    subtotal,
    shipping,
    discount,
    total,
    discountCode,
    updateQuantity,
    removeItem,
    applyDiscountCode,
    removeDiscountCode,
    loadFromStorage,
  } = useCartStore();

  // Validate cart items stock availability
  const { hasOutOfStockItems, outOfStockCount } = useCartValidation();

  // Load cart from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const hasItems = items.length > 0;

  const handleCheckout = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout';
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('title')}
              {hasItems && (
                <span className="text-gray-500 text-lg ms-2">
                  ({items.length})
                </span>
              )}
            </h1>
            {hasOutOfStockItems && (
              <p className="text-sm text-red-600 mt-1">
                {t('validation.outOfStockWarning', {
                  count: outOfStockCount,
                  defaultValue: `${outOfStockCount} item(s) are out of stock`,
                })}
              </p>
            )}
          </div>
        </div>

        {/* Cart Content */}
        {hasItems ? (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  discount={discount}
                  total={total}
                  discountCode={discountCode}
                  onApplyDiscount={applyDiscountCode}
                  onRemoveDiscount={removeDiscountCode}
                  onCheckout={handleCheckout}
                  hasOutOfStockItems={hasOutOfStockItems}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}
      </main>
      <BottomNav />
    </>
  );
}
