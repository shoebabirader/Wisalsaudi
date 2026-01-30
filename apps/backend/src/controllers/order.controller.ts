/**
 * Order Controller
 * HTTP request handlers for order endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OrderService } from '../services/order.service';
import { CreateOrderRequest, UpdateOrderStatusRequest, CancelOrderRequest, ReturnOrderRequest, OrderStatus } from '../types/order.types';
import { AppError } from '../utils/errors';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const orderRequest: CreateOrderRequest = req.body;
      
      const order = await this.orderService.createOrder(userId, orderRequest);

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'buyer';
      const orderId = req.params.id;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const order = await this.orderService.getOrderById(orderId, userId, userRole);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders
   * Get orders for the authenticated user (buyer view)
   */
  getBuyerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const filters = {
        status: req.query.status as OrderStatus | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const orders = await this.orderService.getBuyerOrders(userId, filters);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/seller/:sellerId
   * Get orders for a seller
   */
  getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'buyer';
      const sellerId = req.params.sellerId;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      // Only the seller themselves or admin can view seller orders
      if (userRole !== 'admin' && userId !== sellerId) {
        throw new AppError('Unauthorized to view these orders', 'غير مصرح لك بعرض هذه الطلبات', 403, 'FORBIDDEN');
      }

      const filters = {
        status: req.query.status as OrderStatus | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const orders = await this.orderService.getSellerOrders(sellerId, filters);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/orders/:id/status
   * Update order status (seller only)
   */
  updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'buyer';
      const orderId = req.params.id;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const updateRequest: UpdateOrderStatusRequest = req.body;

      const order = await this.orderService.updateOrderStatus(
        orderId,
        userId,
        userRole,
        updateRequest
      );

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/orders/:id/cancel
   * Cancel an order
   */
  cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role || 'buyer';
      const orderId = req.params.id;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const cancelRequest: CancelOrderRequest = req.body;

      const order = await this.orderService.cancelOrder(
        orderId,
        userId,
        userRole,
        cancelRequest
      );

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/orders/:id/return
   * Request order return
   */
  returnOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const orderId = req.params.id;

      if (!userId) {
        throw new AppError('Authentication required', 'المصادقة مطلوبة', 401, 'UNAUTHORIZED');
      }

      const returnRequest: ReturnOrderRequest = req.body;

      if (!returnRequest.reason) {
        throw new AppError('Return reason is required', 'سبب الإرجاع مطلوب', 400, 'VALIDATION_ERROR');
      }

      const order = await this.orderService.returnOrder(
        orderId,
        userId,
        returnRequest
      );

      res.json({
        success: true,
        data: order,
        message: 'Return request submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
