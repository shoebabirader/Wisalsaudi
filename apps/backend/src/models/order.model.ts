/**
 * Order Model
 * Database operations for orders and order items
 */

import { query } from '../db/postgres';
import { 
  Order, 
  OrderItem, 
  OrderStatus, 
  CreateOrderItemData,
  OrderFilters,
  Address
} from '../types/order.types';

export class OrderModel {
  /**
   * Generate a unique order number
   */
  static async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WIS-${timestamp}-${random}`;
  }

  /**
   * Create a new order
   */
  static async create(
    buyerId: string,
    sellerId: string,
    subtotal: number,
    shippingCost: number,
    discount: number,
    total: number,
    shippingAddress: Address,
    currency: string = 'SAR'
  ): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();
    
    const result = await query(
      `INSERT INTO orders (
        order_number, buyer_id, seller_id, status, 
        subtotal, shipping_cost, discount, total, 
        currency, shipping_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        orderNumber,
        buyerId,
        sellerId,
        'pending',
        subtotal,
        shippingCost,
        discount,
        total,
        currency,
        JSON.stringify(shippingAddress)
      ]
    );

    return this.mapRowToOrder(result.rows[0]);
  }

  /**
   * Create order items
   */
  static async createItems(
    orderId: string,
    items: CreateOrderItemData[]
  ): Promise<OrderItem[]> {
    const values: any[] = [];
    const placeholders: string[] = [];
    
    items.forEach((item, index) => {
      const offset = index * 6;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
      values.push(
        orderId,
        item.productId,
        item.productName,
        item.productNameAr || null,
        item.quantity,
        item.unitPrice,
        item.subtotal
      );
    });

    const result = await query(
      `INSERT INTO order_items (
        order_id, product_id, product_name, product_name_ar, 
        quantity, unit_price, subtotal
      ) VALUES ${placeholders.join(', ')}
      RETURNING *`,
      values
    );

    return result.rows.map(this.mapRowToOrderItem);
  }

  /**
   * Find order by ID
   */
  static async findById(orderId: string): Promise<Order | null> {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const order = this.mapRowToOrder(result.rows[0]);
    order.items = await this.findItemsByOrderId(orderId);
    
    return order;
  }

  /**
   * Find order by order number
   */
  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const result = await query(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const order = this.mapRowToOrder(result.rows[0]);
    order.items = await this.findItemsByOrderId(order.id);
    
    return order;
  }

  /**
   * Find orders with filters
   */
  static async findMany(filters: OrderFilters): Promise<Order[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.buyerId) {
      conditions.push(`buyer_id = $${paramCount++}`);
      values.push(filters.buyerId);
    }

    if (filters.sellerId) {
      conditions.push(`seller_id = $${paramCount++}`);
      values.push(filters.sellerId);
    }

    if (filters.status) {
      conditions.push(`status = $${paramCount++}`);
      values.push(filters.status);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramCount++}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramCount++}`);
      values.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const result = await query(
      `SELECT * FROM orders 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return result.rows.map(this.mapRowToOrder);
  }

  /**
   * Find order items by order ID
   */
  static async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const result = await query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at',
      [orderId]
    );

    return result.rows.map(this.mapRowToOrderItem);
  }

  /**
   * Update order status
   */
  static async updateStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    estimatedDelivery?: Date
  ): Promise<Order | null> {
    const updates: string[] = ['status = $2'];
    const values: any[] = [orderId, status];
    let paramCount = 3;

    if (trackingNumber !== undefined) {
      updates.push(`tracking_number = $${paramCount++}`);
      values.push(trackingNumber);
    }

    if (estimatedDelivery !== undefined) {
      updates.push(`estimated_delivery = $${paramCount++}`);
      values.push(estimatedDelivery);
    }

    const result = await query(
      `UPDATE orders 
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOrder(result.rows[0]);
  }

  /**
   * Delete order (for testing purposes)
   */
  static async delete(orderId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM orders WHERE id = $1',
      [orderId]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Map database row to Order object
   */
  private static mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      orderNumber: row.order_number,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      status: row.status as OrderStatus,
      subtotal: parseFloat(row.subtotal),
      shippingCost: parseFloat(row.shipping_cost),
      discount: parseFloat(row.discount),
      total: parseFloat(row.total),
      currency: row.currency,
      shippingAddress: row.shipping_address,
      trackingNumber: row.tracking_number,
      estimatedDelivery: row.estimated_delivery ? new Date(row.estimated_delivery) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Map database row to OrderItem object
   */
  private static mapRowToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName: row.product_name,
      productNameAr: row.product_name_ar,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      subtotal: parseFloat(row.subtotal),
      createdAt: new Date(row.created_at)
    };
  }
}
