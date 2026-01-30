/**
 * User Model
 * Database operations for users and user profiles
 * Requirements: 1.1 - User Authentication and Authorization
 */

import { query } from '../db/postgres';
import {
  User,
  UserProfile,
  UserWithProfile,
  CreateUserInput,
} from '../types/user.types';

export class UserModel {
  /**
   * Create a new user with profile
   */
  static async create(input: CreateUserInput): Promise<UserWithProfile> {
    await query('BEGIN');

    try {
      // Insert user
      const userResult = await query(
        `INSERT INTO users (email, phone, password_hash, role, email_verified, phone_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          input.email,
          input.phone || null,
          input.password, // This should be hashed before calling this method
          input.role,
          false,
          false,
        ]
      );

      const user = userResult.rows[0] as User;

      // Insert user profile
      const profileResult = await query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, preferred_language)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          user.id,
          input.first_name || null,
          input.last_name || null,
          input.preferred_language || 'en',
        ]
      );

      const profile = profileResult.rows[0] as UserProfile;

      await query('COMMIT');

      return {
        ...user,
        profile,
      };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    return result.rows.length > 0 ? (result.rows[0] as User) : null;
  }

  /**
   * Find user by phone
   */
  static async findByPhone(phone: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE phone = $1', [
      phone,
    ]);

    return result.rows.length > 0 ? (result.rows[0] as User) : null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);

    return result.rows.length > 0 ? (result.rows[0] as User) : null;
  }

  /**
   * Find user with profile by ID
   */
  static async findByIdWithProfile(
    id: string
  ): Promise<UserWithProfile | null> {
    const result = await query(
      `SELECT 
        u.*,
        json_build_object(
          'user_id', p.user_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'profile_picture_url', p.profile_picture_url,
          'preferred_language', p.preferred_language,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as profile
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [id]
    );

    return result.rows.length > 0 ? (result.rows[0] as UserWithProfile) : null;
  }

  /**
   * Find user with profile by email
   */
  static async findByEmailWithProfile(
    email: string
  ): Promise<UserWithProfile | null> {
    const result = await query(
      `SELECT 
        u.*,
        json_build_object(
          'user_id', p.user_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'profile_picture_url', p.profile_picture_url,
          'preferred_language', p.preferred_language,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) as profile
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email]
    );

    return result.rows.length > 0 ? (result.rows[0] as UserWithProfile) : null;
  }

  /**
   * Update user email verification status
   */
  static async verifyEmail(userId: string): Promise<void> {
    await query('UPDATE users SET email_verified = true WHERE id = $1', [
      userId,
    ]);
  }

  /**
   * Update user phone verification status
   */
  static async verifyPhone(userId: string): Promise<void> {
    await query('UPDATE users SET phone_verified = true WHERE id = $1', [
      userId,
    ]);
  }

  /**
   * Update user password
   */
  static async updatePassword(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      userId,
    ]);
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updates.last_name);
    }
    if (updates.profile_picture_url !== undefined) {
      fields.push(`profile_picture_url = $${paramCount++}`);
      values.push(updates.profile_picture_url);
    }
    if (updates.preferred_language !== undefined) {
      fields.push(`preferred_language = $${paramCount++}`);
      values.push(updates.preferred_language);
    }

    values.push(userId);

    const result = await query(
      `UPDATE user_profiles 
       SET ${fields.join(', ')}
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] as UserProfile;
  }

  /**
   * Delete user (cascade deletes profile and addresses)
   */
  static async delete(userId: string): Promise<void> {
    await query('DELETE FROM users WHERE id = $1', [userId]);
  }
}
