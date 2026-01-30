/**
 * JWT Token Utilities
 * Generate and verify JWT tokens for authentication
 */

import jwt from 'jsonwebtoken';
import { User } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Generate access token
 * @param user - User object
 * @returns JWT access token
 */
export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token
 * @param user - User object
 * @returns JWT refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate both access and refresh tokens
 * @param user - User object
 * @returns Token pair
 */
export function generateTokenPair(user: User): TokenPair {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: JWT_EXPIRES_IN,
  };
}

/**
 * Verify JWT token
 * @param token - JWT token
 * @returns Decoded token payload
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode JWT token without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded token payload or null
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
