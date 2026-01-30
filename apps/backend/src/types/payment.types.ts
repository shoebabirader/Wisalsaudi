export interface PaymentIntent {
  orderId: string;
  amount: number; // in SAR
  currency: 'SAR';
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'creditcard' | 'applepay' | 'stcpay';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  orderId: string;
  moyasarPaymentId: string;
  amount: number; // in SAR
  currency: 'SAR';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  transactionId: string;
  amount: number; // in SAR
  reason: string;
}

export interface WebhookPayload {
  type: 'payment.paid' | 'payment.failed' | 'payment.refunded';
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata: Record<string, any>;
  };
}
