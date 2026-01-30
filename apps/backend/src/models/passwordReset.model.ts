/**
 * Password Reset Token Model
 * Database operations for password reset tokens
 * Requirements: 1.5 - Password reset flow
 */

import { query } from '../db/postgres';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class PasswordResetModel {
  /**
   * Create a password reset token
   * @param userId - User ID
   * @param expiresInMinutes - Token expiration time in minutes (default: 60)
   * @returns Password reset token
   */
  static async create(
    userId: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    // Insert token into database
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    return token;
  }

  /**
   * Find a valid password reset token
   * @param token - Reset token
   * @returns Password reset token or null
   */
  static async findValidToken(
    token: string
  ): Promise<PasswordResetToken | null> {
    const result = await query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1
       AND used = false
       AND expires_at > NOW()`,
      [token]
    );

    return result.rows.length > 0
      ? (result.rows[0] as PasswordResetToken)
      : null;
  }

  /**
   * Mark a token as used
   * @param token - Reset token
   */
  static async markAsUsed(token: string): Promise<void> {
    await query(
      `UPDATE password_reset_tokens
       SET used = true
       WHERE token = $1`,
      [token]
    );
  }

  /**
   * Delete expired tokens (cleanup)
   */
  static async deleteExpired(): Promise<void> {
    await query(
      `DELETE FROM password_reset_tokens
       WHERE expires_at < NOW()`
    );
  }

  /**
   * Delete all tokens for a user
   * @param userId - User ID
   */
  static async deleteByUserId(userId: string): Promise<void> {
    await query(
      `DELETE FROM password_reset_tokens
       WHERE user_id = $1`,
      [userId]
    );
  }
}
