/**
 * Authentication Controller
 * HTTP request handlers for authentication endpoints
 * Requirements: 1.1, 1.2 - User Authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegistrationInput, LoginInput } from '../utils/validation';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   * Requirements: 1.1 - User registration
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input: RegistrationInput = req.body;
      const result = await AuthService.register(input);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
        },
        message: result.message,
        messageAr: result.messageAr,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user and generate JWT tokens
   * Requirements: 1.2 - User login with JWT token generation
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await AuthService.login(input);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        message: result.message,
        messageAr: result.messageAr,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user and clear cookies
   * Requirements: 1.2 - User logout
   */
  static async logout(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      messageAr: 'تم تسجيل الخروج بنجاح',
    });
  }

  /**
   * GET /api/auth/verify-email
   * Verify user email with token
   * Requirements: 1.1 - Email verification
   */
  static async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Verification token is required',
            messageAr: 'رمز التحقق مطلوب',
          },
        });
        return;
      }

      const result = await AuthService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
        messageAr: result.messageAr,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   * Requirements: 1.5 - Password reset flow
   */
  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_EMAIL',
            message: 'Email is required',
            messageAr: 'البريد الإلكتروني مطلوب',
          },
        });
        return;
      }

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        messageAr: result.messageAr,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   * Requirements: 1.5 - Password reset flow
   */
  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Reset token is required',
            messageAr: 'رمز إعادة التعيين مطلوب',
          },
        });
        return;
      }

      if (!password || typeof password !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'New password is required',
            messageAr: 'كلمة المرور الجديدة مطلوبة',
          },
        });
        return;
      }

      const result = await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: result.message,
        messageAr: result.messageAr,
      });
    } catch (error) {
      next(error);
    }
  }
}
