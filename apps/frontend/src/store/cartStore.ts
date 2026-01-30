import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, CartItem } from '@/types/cart.types';

const STORAGE_KEY = 'wisal-cart';

// Calculate cart totals
const calculateTotals = (
  items: CartItem[],
  shipping: number,
  discount: number
) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, total };
};

// Validate stock availability for cart items
const validateStock = async (items: CartItem[]): Promise<CartItem[]> => {
  // TODO: Implement actual API call to validate stock
  // For now, return items as-is
  // In production, this would call the backend to check current stock levels
  
  try {
    // const response = await fetch('/api/cart/validate-stock', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    // });
    // const validatedItems = await response.json();
    // return validatedItems;
    
    return items;
  } catch (error) {
    console.error('Failed to validate stock:', error);
    return items;
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'SAR',
      discountCode: undefined,

      // Add item to cart
      addItem: (newItem) => {
        const { items } = get();
        
        // Check if item already exists
        const existingItemIndex = items.findIndex(
          (item) => item.productId === newItem.productId
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + newItem.quantity,
                    item.maxQuantity
                  ),
                }
              : item
          );
        } else {
          // Add new item
          updatedItems = [
            ...items,
            {
              ...newItem,
              id: `${newItem.productId}-${Date.now()}`,
            },
          ];
        }

        const { subtotal, total } = calculateTotals(
          updatedItems,
          get().shipping,
          get().discount
        );

        set({
          items: updatedItems,
          subtotal,
          total,
        });
      },

      // Remove item from cart
      removeItem: (itemId) => {
        const { items, shipping, discount } = get();
        const updatedItems = items.filter((item) => item.id !== itemId);
        const { subtotal, total } = calculateTotals(
          updatedItems,
          shipping,
          discount
        );

        set({
          items: updatedItems,
          subtotal,
          total,
        });
      },

      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        const { items, shipping, discount } = get();

        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: Math.min(quantity, item.maxQuantity),
              }
            : item
        );

        const { subtotal, total } = calculateTotals(
          updatedItems,
          shipping,
          discount
        );

        set({
          items: updatedItems,
          subtotal,
          total,
        });
      },

      // Clear cart
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          discountCode: undefined,
        });
      },

      // Apply discount code
      applyDiscountCode: (code) => {
        // TODO: Validate discount code with backend
        // For now, apply a mock discount
        const { items, shipping } = get();
        const mockDiscount = 10; // 10 SAR discount
        const { subtotal, total } = calculateTotals(
          items,
          shipping,
          mockDiscount
        );

        set({
          discountCode: code,
          discount: mockDiscount,
          subtotal,
          total,
        });
      },

      // Remove discount code
      removeDiscountCode: () => {
        const { items, shipping } = get();
        const { subtotal, total } = calculateTotals(items, shipping, 0);

        set({
          discountCode: undefined,
          discount: 0,
          subtotal,
          total,
        });
      },

      // Sync cart with backend for logged-in users
      syncWithBackend: async () => {
        try {
          // Validate stock availability
          const validatedItems = await validateStock(get().items);
          
          // TODO: Implement full backend sync when auth is ready
          // const response = await fetch('/api/cart', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(get().items),
          // });
          // const backendCart = await response.json();
          
          const { shipping, discount } = get();
          const { subtotal, total } = calculateTotals(
            validatedItems,
            shipping,
            discount
          );
          
          set({
            items: validatedItems,
            subtotal,
            total,
          });
          
          console.log('Cart sync with backend - to be implemented');
        } catch (error) {
          console.error('Failed to sync cart with backend:', error);
        }
      },

      // Load cart from storage (called on mount)
      loadFromStorage: () => {
        // This is handled automatically by persist middleware
        // But we can recalculate totals to ensure consistency
        const { items, shipping, discount } = get();
        const { subtotal, total } = calculateTotals(items, shipping, discount);
        set({ subtotal, total });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist cart items and discount code
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discount: state.discount,
        shipping: state.shipping,
      }),
    }
  )
);
