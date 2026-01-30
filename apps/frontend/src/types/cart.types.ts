export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameAr: string;
  thumbnail: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  sellerId: string;
  sellerName: string;
  inStock: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: 'SAR';
  discountCode?: string;
}

export interface CartState extends Cart {
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscountCode: (code: string) => void;
  removeDiscountCode: () => void;
  syncWithBackend: () => Promise<void>;
  loadFromStorage: () => void;
}
