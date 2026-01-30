/**
 * Product Routes
 * Defines routes for product management endpoints
 */

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/products
 * Create a new product (seller only)
 */
router.post(
  '/',
  authenticate,
  requireRole('seller', 'admin'),
  ProductController.createProduct
);

/**
 * GET /api/products
 * Get products with pagination and filtering
 */
router.get('/', ProductController.getProducts);

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', ProductController.getProduct);

/**
 * PUT /api/products/:id
 * Update a product (seller only, own products)
 */
router.put(
  '/:id',
  authenticate,
  requireRole('seller', 'admin'),
  ProductController.updateProduct
);

/**
 * DELETE /api/products/:id
 * Delete a product (seller only, own products)
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('seller', 'admin'),
  ProductController.deleteProduct
);

/**
 * PUT /api/products/:id/inventory
 * Update product inventory (seller only, own products)
 */
router.put(
  '/:id/inventory',
  authenticate,
  requireRole('seller', 'admin'),
  ProductController.updateInventory
);

export default router;
