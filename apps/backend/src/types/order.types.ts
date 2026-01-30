/**
 * Order Type Definitions
 * TypeScript interfaces for order-related data structures
 */

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Address {
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
  recipientName?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  discountCode?: string;
}

export interface CreateOrderItemData {
  productId: string;
  productName: string;
  productNameAr?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface ReturnOrderRequest {
  reason: string;
  items?: {
    orderItemId: string;
    quantity: number;
  }[];
}

export interface OrderFilters {
  status?: OrderStatus;
  buyerId?: string;
  sellerId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
