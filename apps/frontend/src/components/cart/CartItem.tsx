'use client';

import { CartItem as CartItemType } from '@/types/cart.types';
import { useTranslation } from '@/lib/i18n';
import { formatPrice } from '@/lib/i18n/formatters';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { t, language } = useTranslation('cart');

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.maxQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const itemName = language === 'ar' ? item.nameAr : item.name;
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={item.thumbnail}
          alt={itemName}
          className="w-24 h-24 object-cover rounded-md"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{itemName}</h3>
            <p className="text-sm text-gray-500">{item.sellerName}</p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label={t('actions.removeItem')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Status */}
        {!item.inStock ? (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ {t('item.outOfStock')}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {t('item.outOfStockMessage') || 'This item is currently unavailable and cannot be purchased'}
            </p>
          </div>
        ) : item.quantity >= item.maxQuantity ? (
          <p className="text-sm text-amber-600 mb-2 flex items-center gap-1">
            <span>⚠️</span>
            {t('item.lowStock', { count: item.maxQuantity })}
          </p>
        ) : null}

        {/* Price and Quantity Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('item.quantity')}:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={item.quantity >= item.maxQuantity || !item.inStock}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-end">
            <p className="text-sm text-gray-600">
              {formatPrice(item.price, language)} × {item.quantity}
            </p>
            <p className="font-semibold text-lg text-primary">
              {formatPrice(subtotal, language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
