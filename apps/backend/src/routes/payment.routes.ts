import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPayment,
  refundPayment,
  handleWebhook,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Create payment intent (requires authentication)
router.post('/create-intent', authenticate, createPaymentIntent);

// Confirm payment (requires authentication)
router.post('/confirm', authenticate, confirmPayment);

// Get payment details (requires authentication)
router.get('/:id', authenticate, getPayment);

// Process refund (requires authentication)
router.post('/refund', authenticate, refundPayment);

// Webhook handler (no authentication - verified by signature)
router.post('/webhook', handleWebhook);

export default router;
