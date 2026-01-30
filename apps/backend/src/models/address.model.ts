/**
 * Address Model
 * Database operations for user addresses
 * Requirements: 11.1 - Address management for checkout
 */

import { query } from '../db/postgres';
import { Address } from '../types/user.types';

export class AddressModel {
  /**
   * Create a new address for a user
   */
  static async create(
    userId: string,
    addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Address> {
    const result = await query(
      `INSERT INTO addresses (user_id, type, street, city, province, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        addressData.type,
        addressData.street,
        addressData.city,
        addressData.province,
        addressData.postal_code,
        addressData.country,
        addressData.is_default,
      ]
    );

    // If this address is set as default, unset other defaults
    if (addressData.is_default) {
      await query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2`,
        [userId, result.rows[0].id]
      );
    }

    return result.rows[0] as Address;
  }

  /**
   * Get all addresses for a user
   */
  static async findByUserId(userId: string): Promise<Address[]> {
    const result = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return result.rows as Address[];
  }

  /**
   * Get a specific address by ID
   */
  static async findById(addressId: string, userId: string): Promise<Address | null> {
    const result = await query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );

    return result.rows.length > 0 ? (result.rows[0] as Address) : null;
  }

  /**
   * Get default address for a user
   */
  static async findDefaultByUserId(userId: string): Promise<Address | null> {
    const result = await query(
      `SELECT * FROM addresses WHERE user_id = $1 AND is_default = true`,
      [userId]
    );

    return result.rows.length > 0 ? (result.rows[0] as Address) : null;
  }

  /**
   * Update an address
   */
  static async update(
    addressId: string,
    userId: string,
    updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Address> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(updates.type);
    }
    if (updates.street !== undefined) {
      fields.push(`street = $${paramCount++}`);
      values.push(updates.street);
    }
    if (updates.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(updates.city);
    }
    if (updates.province !== undefined) {
      fields.push(`province = $${paramCount++}`);
      values.push(updates.province);
    }
    if (updates.postal_code !== undefined) {
      fields.push(`postal_code = $${paramCount++}`);
      values.push(updates.postal_code);
    }
    if (updates.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(updates.country);
    }
    if (updates.is_default !== undefined) {
      fields.push(`is_default = $${paramCount++}`);
      values.push(updates.is_default);
    }

    fields.push(`updated_at = NOW()`);
    values.push(addressId, userId);

    const result = await query(
      `UPDATE addresses 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
      values
    );

    // If this address is set as default, unset other defaults
    if (updates.is_default) {
      await query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2`,
        [userId, addressId]
      );
    }

    return result.rows[0] as Address;
  }

  /**
   * Delete an address
   */
  static async delete(addressId: string, userId: string): Promise<void> {
    await query(
      `DELETE FROM addresses WHERE id = $1 AND user_id = $2`,
      [addressId, userId]
    );
  }
}
