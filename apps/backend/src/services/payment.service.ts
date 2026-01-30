import axios, { AxiosInstance } from 'axios';

// Moyasar API types
export interface MoyasarPaymentSource {
  type: 'creditcard' | 'applepay' | 'stcpay';
  number?: string;
  cvc?: string;
  month?: string;
  year?: string;
  name?: string;
  token?: string;
}

export interface MoyasarPaymentRequest {
  amount: number; // in halalas (1 SAR = 100 halalas)
  currency: 'SAR';
  description: string;
  callback_url: string;
  source: MoyasarPaymentSource;
  metadata?: Record<string, any>;
}

export interface MoyasarPaymentResponse {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded';
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id: string | null;
  ip: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string;
    message: string;
    transaction_url: string;
  };
}

export interface MoyasarRefundRequest {
  amount: number; // in halalas
  description?: string;
}

export interface MoyasarRefundResponse {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

class PaymentService {
  private client: AxiosInstance;
  private apiKey: string;
  private secretKey: string;
  private baseURL: string = 'https://api.moyasar.com/v1';

  constructor() {
    this.apiKey = process.env.MOYASAR_API_KEY || '';
    this.secretKey = process.env.MOYASAR_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      console.warn('Moyasar API keys not configured. Payment service will not work.');
    }

    // Create axios instance with basic auth
    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.apiKey,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a payment intent with Moyasar
   */
  async createPayment(request: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      const response = await this.client.post<MoyasarPaymentResponse>('/payments', request);
      return response.data;
    } catch (error: any) {
      console.error('Moyasar payment creation error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to create payment with Moyasar'
      );
    }
  }

  /**
   * Retrieve payment details from Moyasar
   */
  async getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    try {
      const response = await this.client.get<MoyasarPaymentResponse>(`/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Moyasar payment retrieval error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to retrieve payment from Moyasar'
      );
    }
  }

  /**
   * Process a refund through Moyasar
   */
  async refundPayment(
    paymentId: string,
    request: MoyasarRefundRequest
  ): Promise<MoyasarRefundResponse> {
    try {
      const response = await this.client.post<MoyasarRefundResponse>(
        `/payments/${paymentId}/refund`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Moyasar refund error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to process refund with Moyasar');
    }
  }

  /**
   * Verify webhook signature from Moyasar
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Moyasar uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Convert SAR to halalas (Moyasar uses halalas)
   */
  sarToHalalas(sar: number): number {
    return Math.round(sar * 100);
  }

  /**
   * Convert halalas to SAR
   */
  halalasToSar(halalas: number): number {
    return halalas / 100;
  }

  /**
   * Validate payment status
   */
  isPaymentSuccessful(status: string): boolean {
    return status === 'paid' || status === 'captured';
  }

  /**
   * Validate payment amount matches expected amount
   */
  validatePaymentAmount(payment: MoyasarPaymentResponse, expectedAmount: number): boolean {
    return payment.amount === expectedAmount;
  }
}

export default new PaymentService();
