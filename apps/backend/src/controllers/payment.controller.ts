import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import { OrderModel } from '../models/order.model';
import { TransactionModel } from '../models/transaction.model';
import { z } from 'zod';

// Validation schemas
const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid(),
  paymentSource: z.object({
    type: z.enum(['creditcard', 'applepay', 'stcpay']),
    number: z.string().optional(),
    cvc: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    name: z.string().optional(),
    token: z.string().optional(),
  }),
});

const confirmPaymentSchema = z.object({
  paymentId: z.string(),
});

const refundPaymentSchema = z.object({
  transactionId: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().min(1),
});

/**
 * Create a payment intent for an order
 * POST /api/payments/create-intent
 */
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate request body
    const validation = createPaymentIntentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors,
      });
      return;
    }

    const { orderId, paymentSource } = validation.data;

    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify user owns this order
    if (order.buyerId !== userId) {
      res.status(403).json({ error: 'Not authorized to pay for this order' });
      return;
    }

    // Check if order is already paid
    const existingTransaction = await TransactionModel.findByOrderId(orderId);
    if (existingTransaction && existingTransaction.status === 'completed') {
      res.status(400).json({ error: 'Order is already paid' });
      return;
    }

    // Create payment request for Moyasar
    const amountInHalalas = paymentService.sarToHalalas(order.total);
    const callbackUrl = `${process.env.API_URL}/api/payments/callback`;

    const paymentRequest = {
      amount: amountInHalalas,
      currency: 'SAR' as const,
      description: `Order ${order.orderNumber}`,
      callback_url: callbackUrl,
      source: paymentSource,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        buyerId: userId,
      },
    };

    // Create payment with Moyasar
    const moyasarPayment = await paymentService.createPayment(paymentRequest);

    // Create transaction record
    const transaction = await TransactionModel.create({
      orderId: order.id,
      moyasarPaymentId: moyasarPayment.id,
      amount: order.total,
      currency: 'SAR',
      status: 'pending',
      paymentMethod: paymentSource.type,
    });

    // Return payment intent to frontend
    res.status(200).json({
      success: true,
      paymentIntent: {
        id: moyasarPayment.id,
        transactionId: transaction.id,
        amount: order.total,
        currency: 'SAR',
        status: moyasarPayment.status,
        transactionUrl: moyasarPayment.source.transaction_url,
      },
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message,
    });
  }
};

/**
 * Confirm a payment after user completes payment flow
 * POST /api/payments/confirm
 */
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate request body
    const validation = confirmPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors,
      });
      return;
    }

    const { paymentId } = validation.data;

    // Get payment details from Moyasar
    const moyasarPayment = await paymentService.getPayment(paymentId);

    // Get transaction record
    const transaction = await TransactionModel.findByMoyasarPaymentId(paymentId);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Get order
    const order = await OrderModel.findById(transaction.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify user owns this order
    if (order.buyerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Verify payment status
    if (!paymentService.isPaymentSuccessful(moyasarPayment.status)) {
      await TransactionModel.updateStatus(transaction.id, 'failed');
      res.status(400).json({
        error: 'Payment failed',
        status: moyasarPayment.status,
        message: moyasarPayment.source.message,
      });
      return;
    }

    // Verify payment amount
    const expectedAmount = paymentService.sarToHalalas(order.total);
    if (!paymentService.validatePaymentAmount(moyasarPayment, expectedAmount)) {
      await TransactionModel.updateStatus(transaction.id, 'failed');
      res.status(400).json({
        error: 'Payment amount mismatch',
      });
      return;
    }

    // Update transaction status
    await TransactionModel.updateStatus(transaction.id, 'completed');

    // Update order status to confirmed
    await OrderModel.updateStatus(order.id, 'confirmed');

    res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: 'SAR',
        status: 'completed',
      },
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message,
    });
  }
};

/**
 * Get payment/transaction details
 * GET /api/payments/:id
 */
export const getPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Get transaction
    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Get order to verify ownership
    const order = await OrderModel.findById(transaction.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify user owns this order
    if (order.buyerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Failed to get payment details',
      message: error.message,
    });
  }
};

/**
 * Process a refund
 * POST /api/payments/refund
 */
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate request body
    const validation = refundPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors,
      });
      return;
    }

    const { transactionId, amount, reason } = validation.data;

    // Get transaction
    const transaction = await TransactionModel.findById(transactionId);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Get order
    const order = await OrderModel.findById(transaction.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify user is seller or admin
    const userRole = (req as any).user?.role;
    if (order.sellerId !== userId && userRole !== 'admin') {
      res.status(403).json({ error: 'Not authorized to refund this payment' });
      return;
    }

    // Check transaction status
    if (transaction.status !== 'completed') {
      res.status(400).json({ error: 'Can only refund completed transactions' });
      return;
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount || transaction.amount;
    if (refundAmount > transaction.amount) {
      res.status(400).json({ error: 'Refund amount exceeds transaction amount' });
      return;
    }

    // Process refund with Moyasar
    const refundRequest = {
      amount: paymentService.sarToHalalas(refundAmount),
      description: reason,
    };

    const moyasarRefund = await paymentService.refundPayment(
      transaction.moyasarPaymentId,
      refundRequest
    );

    // Update transaction status
    await TransactionModel.updateStatus(transaction.id, 'refunded');

    // Update order status
    await OrderModel.updateStatus(order.id, 'returned');

    res.status(200).json({
      success: true,
      refund: {
        id: moyasarRefund.id,
        transactionId: transaction.id,
        amount: refundAmount,
        currency: 'SAR',
        status: moyasarRefund.status,
      },
    });
  } catch (error: any) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      error: 'Failed to process refund',
      message: error.message,
    });
  }
};

/**
 * Handle Moyasar webhook callbacks
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get webhook signature from headers
    const signature = req.headers['x-moyasar-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing webhook signature' });
      return;
    }

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    const isValid = paymentService.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const { type, data } = req.body;

    // Get transaction by Moyasar payment ID
    const transaction = await TransactionModel.findByMoyasarPaymentId(data.id);
    if (!transaction) {
      console.warn(`Webhook received for unknown payment: ${data.id}`);
      res.status(200).json({ received: true });
      return;
    }

    // Handle different webhook types
    switch (type) {
      case 'payment.paid':
        await TransactionModel.updateStatus(transaction.id, 'completed');
        await OrderModel.updateStatus(transaction.orderId, 'confirmed');
        break;

      case 'payment.failed':
        await TransactionModel.updateStatus(transaction.id, 'failed');
        break;

      case 'payment.refunded':
        await TransactionModel.updateStatus(transaction.id, 'refunded');
        await OrderModel.updateStatus(transaction.orderId, 'returned');
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message,
    });
  }
};
