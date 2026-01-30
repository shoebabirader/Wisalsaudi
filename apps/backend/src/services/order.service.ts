/**
 * Order Service
 * Business logic for order management
 */

import { OrderModel } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { 
  Order, 
  CreateOrderRequest, 
  CreateOrderItemData,
  OrderFilters,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  ReturnOrderRequest
} from '../types/order.types';
import { AppError } from '../utils/errors';

export class OrderService {
  private productModel: ProductModel;

  constructor() {
    this.productModel = new ProductModel();
  }

  /**
   * Create a new order from cart items
   */
  async createOrder(
    buyerId: string,
    request: CreateOrderRequest
  ): Promise<Order> {
    // Validate cart items
    if (!request.items || request.items.length === 0) {
      throw new AppError('Cart is empty', 'السلة فارغة', 400, 'VALIDATION_ERROR');
    }

    // Validate shipping address
    if (!request.shippingAddress) {
      throw new AppError('Shipping address is required', 'عنوان الشحن مطلوب', 400, 'VALIDATION_ERROR');
    }

    // Fetch product details and validate stock
    const orderItems: CreateOrderItemData[] = [];
    let subtotal = 0;
    let sellerId: string | null = null;

    for (const item of request.items) {
      const product = await this.productModel.findById(item.productId);
      
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, `المنتج ${item.productId} غير موجود`, 404, 'NOT_FOUND');
      }

      if (!product.inventory.inStock) {
        throw new AppError(`Product ${product.name} is out of stock`, `المنتج ${product.name} غير متوفر`, 400, 'OUT_OF_STOCK');
      }

      if (product.inventory.quantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`,
          `مخزون غير كافٍ للمنتج ${product.name}. المتاح: ${product.inventory.quantity}`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      // For MVP, all items must be from the same seller
      if (sellerId === null) {
        sellerId = product.sellerId;
      } else if (sellerId !== product.sellerId) {
        throw new AppError(
          'All items must be from the same seller',
          'يجب أن تكون جميع العناصر من نفس البائع',
          400,
          'MULTIPLE_SELLERS'
        );
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id!,
        productName: product.name,
        productNameAr: product.nameAr,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal
      });
    }

    if (!sellerId) {
      throw new AppError('Invalid order: no seller found', 'طلب غير صالح: لم يتم العثور على بائع', 400, 'INVALID_ORDER');
    }

    // Calculate shipping cost (simplified - flat rate for now)
    const shippingCost = this.calculateShippingCost(request.shippingAddress);

    // Apply discount if discount code provided
    let discount = 0;
    if (request.discountCode) {
      discount = await this.applyDiscountCode(request.discountCode, subtotal);
    }

    // Calculate total
    const total = subtotal + shippingCost - discount;

    // Create order
    const order = await OrderModel.create(
      buyerId,
      sellerId,
      subtotal,
      shippingCost,
      discount,
      total,
      request.shippingAddress
    );

    // Create order items
    const items = await OrderModel.createItems(order.id, orderItems);
    order.items = items;

    // Update product inventory
    for (const item of request.items) {
      await this.productModel.decrementInventory(item.productId, item.quantity);
    }

    return order;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId: string, userRole: string): Promise<Order> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 'الطلب غير موجود', 404, 'NOT_FOUND');
    }

    // Check authorization
    if (userRole !== 'admin' && order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Unauthorized to view this order', 'غير مصرح لك بعرض هذا الطلب', 403, 'FORBIDDEN');
    }

    return order;
  }

  /**
   * Get orders for a buyer
   */
  async getBuyerOrders(
    buyerId: string,
    filters: Partial<OrderFilters> = {}
  ): Promise<Order[]> {
    return await OrderModel.findMany({
      ...filters,
      buyerId
    });
  }

  /**
   * Get orders for a seller
   */
  async getSellerOrders(
    sellerId: string,
    filters: Partial<OrderFilters> = {}
  ): Promise<Order[]> {
    return await OrderModel.findMany({
      ...filters,
      sellerId
    });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: string,
    request: UpdateOrderStatusRequest
  ): Promise<Order> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 'الطلب غير موجود', 404, 'NOT_FOUND');
    }

    // Only seller or admin can update order status
    if (userRole !== 'admin' && order.sellerId !== userId) {
      throw new AppError('Unauthorized to update this order', 'غير مصرح لك بتحديث هذا الطلب', 403, 'FORBIDDEN');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, request.status);

    // Update order
    const updatedOrder = await OrderModel.updateStatus(
      orderId,
      request.status,
      request.trackingNumber,
      request.estimatedDelivery
    );

    if (!updatedOrder) {
      throw new AppError('Failed to update order', 'فشل تحديث الطلب', 500, 'UPDATE_FAILED');
    }

    // TODO: Send notification to buyer about status change

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    userRole: string,
    _request: CancelOrderRequest
  ): Promise<Order> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 'الطلب غير موجود', 404, 'NOT_FOUND');
    }

    // Only buyer can cancel before shipping, seller/admin can cancel anytime
    if (userRole !== 'admin' && userRole !== 'seller') {
      if (order.buyerId !== userId) {
        throw new AppError('Unauthorized to cancel this order', 'غير مصرح لك بإلغاء هذا الطلب', 403, 'FORBIDDEN');
      }
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new AppError('Cannot cancel order after it has been shipped', 'لا يمكن إلغاء الطلب بعد شحنه', 400, 'INVALID_STATUS');
      }
    }

    // Update order status to cancelled
    const updatedOrder = await OrderModel.updateStatus(orderId, 'cancelled');

    if (!updatedOrder) {
      throw new AppError('Failed to cancel order', 'فشل إلغاء الطلب', 500, 'CANCEL_FAILED');
    }

    // Restore inventory
    if (order.items) {
      for (const item of order.items) {
        await this.productModel.incrementInventory(item.productId, item.quantity);
      }
    }

    // TODO: Initiate refund if payment was made

    return updatedOrder;
  }

  /**
   * Request order return
   */
  async returnOrder(
    orderId: string,
    userId: string,
    _request: ReturnOrderRequest
  ): Promise<Order> {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 'الطلب غير موجود', 404, 'NOT_FOUND');
    }

    // Only buyer can request return
    if (order.buyerId !== userId) {
      throw new AppError('Unauthorized to return this order', 'غير مصرح لك بإرجاع هذا الطلب', 403, 'FORBIDDEN');
    }

    // Can only return delivered orders
    if (order.status !== 'delivered') {
      throw new AppError('Can only return delivered orders', 'يمكن إرجاع الطلبات المسلمة فقط', 400, 'INVALID_STATUS');
    }

    // Update order status to returned
    const updatedOrder = await OrderModel.updateStatus(orderId, 'returned');

    if (!updatedOrder) {
      throw new AppError('Failed to process return', 'فشل معالجة الإرجاع', 500, 'RETURN_FAILED');
    }

    // TODO: Initiate refund process
    // TODO: Send notification to seller about return request

    return updatedOrder;
  }

  /**
   * Calculate shipping cost based on address
   * Simplified implementation - flat rate for now
   */
  private calculateShippingCost(_address: any): number {
    // TODO: Integrate with shipping provider API for accurate rates
    // For now, use flat rate
    const FLAT_RATE = 25; // 25 SAR
    return FLAT_RATE;
  }

  /**
   * Apply discount code
   * Simplified implementation - returns fixed discount for now
   */
  private async applyDiscountCode(_code: string, _subtotal: number): Promise<number> {
    // TODO: Implement discount code validation and calculation
    // For now, return 0 (no discount)
    return 0;
  }

  /**
   * Validate order status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned'],
      cancelled: [],
      returned: []
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        `انتقال حالة غير صالح من ${currentStatus} إلى ${newStatus}`,
        400,
        'INVALID_TRANSITION'
      );
    }
  }
}
