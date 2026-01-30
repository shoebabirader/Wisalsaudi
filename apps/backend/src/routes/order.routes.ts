/**
 * Order Routes
 * API routes for order management
 */

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticate);

// Create new order
router.post('/', orderController.createOrder);

// Get buyer's orders
router.get('/', orderController.getBuyerOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Get seller's orders
router.get('/seller/:sellerId', orderController.getSellerOrders);

// Update order status (seller only)
router.put('/:id/status', orderController.updateOrderStatus);

// Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

// Return order
router.post('/:id/return', orderController.returnOrder);

export default router;
