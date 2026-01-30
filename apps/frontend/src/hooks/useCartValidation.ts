import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';

/**
 * Hook to periodically validate cart items stock availability
 * Runs validation when cart page is mounted and every 30 seconds
 */
export function useCartValidation() {
  const { items, syncWithBackend } = useCartStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Validate immediately on mount if there are items
    if (items.length > 0) {
      syncWithBackend();
    }

    // Set up periodic validation every 30 seconds
    intervalRef.current = setInterval(() => {
      if (items.length > 0) {
        syncWithBackend();
      }
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items.length, syncWithBackend]);

  return {
    hasOutOfStockItems: items.some((item) => !item.inStock),
    outOfStockCount: items.filter((item) => !item.inStock).length,
  };
}
