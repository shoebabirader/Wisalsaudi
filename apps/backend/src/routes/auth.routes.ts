/**
 * Authentication Routes
 * Defines routes for authentication endpoints
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', AuthController.register);

/**
 * POST /api/auth/login
 * Login user and generate JWT tokens
 */
router.post('/login', AuthController.login);

/**
 * POST /api/auth/logout
 * Logout user and clear cookies
 */
router.post('/logout', AuthController.logout);

/**
 * GET /api/auth/verify-email
 * Verify user email
 */
router.get('/verify-email', AuthController.verifyEmail);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;
