import pool from '../db/postgres';
import { Transaction } from '../types/payment.types';

export class TransactionModel {
  /**
   * Create a new transaction record
   */
  static async create(transaction: {
    orderId: string;
    moyasarPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
  }): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (order_id, moyasar_payment_id, amount, currency, status, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, order_id as "orderId", moyasar_payment_id as "moyasarPaymentId", 
                amount, currency, status, payment_method as "paymentMethod", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [
      transaction.orderId,
      transaction.moyasarPaymentId,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.paymentMethod,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get transaction by ID
   */
  static async findById(id: string): Promise<Transaction | null> {
    const query = `
      SELECT id, order_id as "orderId", moyasar_payment_id as "moyasarPaymentId", 
             amount, currency, status, payment_method as "paymentMethod", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get transaction by Moyasar payment ID
   */
  static async findByMoyasarPaymentId(moyasarPaymentId: string): Promise<Transaction | null> {
    const query = `
      SELECT id, order_id as "orderId", moyasar_payment_id as "moyasarPaymentId", 
             amount, currency, status, payment_method as "paymentMethod", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions
      WHERE moyasar_payment_id = $1
    `;

    const result = await pool.query(query, [moyasarPaymentId]);
    return result.rows[0] || null;
  }

  /**
   * Get transaction by order ID
   */
  static async findByOrderId(orderId: string): Promise<Transaction | null> {
    const query = `
      SELECT id, order_id as "orderId", moyasar_payment_id as "moyasarPaymentId", 
             amount, currency, status, payment_method as "paymentMethod", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions
      WHERE order_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [orderId]);
    return result.rows[0] || null;
  }

  /**
   * Update transaction status
   */
  static async updateStatus(id: string, status: string): Promise<Transaction> {
    const query = `
      UPDATE transactions
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, order_id as "orderId", moyasar_payment_id as "moyasarPaymentId", 
                amount, currency, status, payment_method as "paymentMethod", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  /**
   * Get all transactions for a user (via their orders)
   */
  static async findByUserId(userId: string): Promise<Transaction[]> {
    const query = `
      SELECT t.id, t.order_id as "orderId", t.moyasar_payment_id as "moyasarPaymentId", 
             t.amount, t.currency, t.status, t.payment_method as "paymentMethod", 
             t.created_at as "createdAt", t.updated_at as "updatedAt"
      FROM transactions t
      INNER JOIN orders o ON t.order_id = o.id
      WHERE o.buyer_id = $1
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
