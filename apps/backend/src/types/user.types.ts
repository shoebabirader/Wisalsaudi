/**
 * User and Profile Type Definitions
 * Requirements: 1.1 - User Authentication and Authorization
 */

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: UserRole;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  preferred_language: 'en' | 'ar';
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  preferred_language?: 'en' | 'ar';
}

export interface UserWithProfile extends User {
  profile: UserProfile;
}
