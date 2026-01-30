/**
 * Authentication Service
 * Business logic for user authentication and registration
 * Requirements: 1.1, 1.2 - User Authentication
 */

import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { sendVerificationEmail } from '../utils/email';
import {
  RegistrationInput,
  registrationSchema,
  LoginInput,
  loginSchema,
} from '../utils/validation';
import {
  ValidationError,
  ConflictError,
  InternalServerError,
  AuthenticationError,
} from '../utils/errors';
import { UserWithProfile } from '../types/user.types';
import { generateTokenPair, TokenPair } from '../utils/jwt';
import crypto from 'crypto';

export class AuthService {
  /**
   * Register a new user
   * Requirements: 1.1 - User registration with email/phone verification
   */
  static async register(
    input: RegistrationInput
  ): Promise<{ user: UserWithProfile; message: string; messageAr: string }> {
    try {
      // Validate input
      const validatedInput = registrationSchema.parse(input);

      // Check if email already exists
      const existingUser = await UserModel.findByEmail(validatedInput.email);
      if (existingUser) {
        throw new ConflictError(
          'Email already registered',
          'البريد الإلكتروني مسجل بالفعل',
          { field: 'email' }
        );
      }

      // Check if phone already exists (if provided)
      if (validatedInput.phone) {
        const existingPhone = await UserModel.findByPhone(validatedInput.phone);
        if (existingPhone) {
          throw new ConflictError(
            'Phone number already registered',
            'رقم الهاتف مسجل بالفعل',
            { field: 'phone' }
          );
        }
      }

      // Hash password
      const passwordHash = await hashPassword(validatedInput.password);

      // Create user
      const user = await UserModel.create({
        ...validatedInput,
        password: passwordHash,
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as UserWithProfile,
        message:
          'Registration successful. Please check your email to verify your account.',
        messageAr:
          'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك.',
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }

      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any;
        const firstError = zodError.errors[0];
        throw new ValidationError(
          firstError.message,
          'خطأ في التحقق من البيانات',
          zodError.errors
        );
      }

      console.error('Registration error:', error);
      throw new InternalServerError();
    }
  }

  /**
   * Login user
   * Requirements: 1.2 - User login with JWT token generation
   */
  static async login(
    input: LoginInput
  ): Promise<{
    user: Omit<UserWithProfile, 'password_hash'>;
    tokens: TokenPair;
    message: string;
    messageAr: string;
  }> {
    try {
      // Validate input
      const validatedInput = loginSchema.parse(input);

      // Find user by email
      const user = await UserModel.findByEmailWithProfile(validatedInput.email);

      if (!user) {
        throw new AuthenticationError(
          'Invalid email or password',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        );
      }

      // Verify password
      const isPasswordValid = await comparePassword(
        validatedInput.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new AuthenticationError(
          'Invalid email or password',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        );
      }

      // Generate tokens
      const tokens = generateTokenPair(user);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
        message: 'Login successful',
        messageAr: 'تم تسجيل الدخول بنجاح',
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }

      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any;
        const firstError = zodError.errors[0];
        throw new ValidationError(
          firstError.message,
          'خطأ في التحقق من البيانات',
          zodError.errors
        );
      }

      console.error('Login error:', error);
      throw new InternalServerError();
    }
  }

  /**
   * Verify user email
   * Requirements: 1.1 - Email verification
   */
  static async verifyEmail(
    _token: string
  ): Promise<{ message: string; messageAr: string }> {
    // TODO: Implement token storage and verification
    // For now, this is a placeholder
    return {
      message: 'Email verified successfully',
      messageAr: 'تم التحقق من البريد الإلكتروني بنجاح',
    };
  }

  /**
   * Request password reset
   * Requirements: 1.5 - Password reset flow
   */
  static async forgotPassword(
    email: string
  ): Promise<{ message: string; messageAr: string }> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);

      // Always return success message to prevent email enumeration
      const successMessage = {
        message:
          'If an account exists with this email, you will receive a password reset link.',
        messageAr:
          'إذا كان هناك حساب بهذا البريد الإلكتروني، ستتلقى رابط إعادة تعيين كلمة المرور.',
      };

      if (!user) {
        return successMessage;
      }

      // Generate reset token
      const { PasswordResetModel } = await import(
        '../models/passwordReset.model'
      );
      const resetToken = await PasswordResetModel.create(user.id, 60); // 60 minutes

      // Send reset email
      const { sendPasswordResetEmail } = await import('../utils/email');
      await sendPasswordResetEmail(user.email, resetToken);

      return successMessage;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new InternalServerError();
    }
  }

  /**
   * Reset password with token
   * Requirements: 1.5 - Password reset flow
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string; messageAr: string }> {
    try {
      // Validate new password
      const { passwordSchema } = await import('../utils/validation');
      passwordSchema.parse(newPassword);

      // Find valid token
      const { PasswordResetModel } = await import(
        '../models/passwordReset.model'
      );
      const resetToken = await PasswordResetModel.findValidToken(token);

      if (!resetToken) {
        throw new ValidationError(
          'Invalid or expired reset token',
          'رمز إعادة التعيين غير صالح أو منتهي الصلاحية'
        );
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update user password
      await UserModel.updatePassword(resetToken.user_id, passwordHash);

      // Mark token as used
      await PasswordResetModel.markAsUsed(token);

      return {
        message: 'Password reset successful. You can now login with your new password.',
        messageAr:
          'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as any;
        const firstError = zodError.errors[0];
        throw new ValidationError(
          firstError.message,
          'خطأ في التحقق من البيانات',
          zodError.errors
        );
      }

      console.error('Reset password error:', error);
      throw new InternalServerError();
    }
  }
}
