import { describe, it, expect } from 'vitest';
import paymentService from './payment.service';

describe('PaymentService', () => {
  describe('Currency Conversion', () => {
    it('should convert SAR to halalas correctly', () => {
      expect(paymentService.sarToHalalas(1)).toBe(100);
      expect(paymentService.sarToHalalas(10.5)).toBe(1050);
      expect(paymentService.sarToHalalas(99.99)).toBe(9999);
      expect(paymentService.sarToHalalas(0)).toBe(0);
    });

    it('should convert halalas to SAR correctly', () => {
      expect(paymentService.halalasToSar(100)).toBe(1);
      expect(paymentService.halalasToSar(1050)).toBe(10.5);
      expect(paymentService.halalasToSar(9999)).toBe(99.99);
      expect(paymentService.halalasToSar(0)).toBe(0);
    });

    it('should handle round-trip conversion', () => {
      const amounts = [1, 10.5, 99.99, 123.45, 0.01];
      amounts.forEach((amount) => {
        const halalas = paymentService.sarToHalalas(amount);
        const sar = paymentService.halalasToSar(halalas);
        expect(sar).toBeCloseTo(amount, 2);
      });
    });
  });

  describe('Payment Status Validation', () => {
    it('should identify successful payment statuses', () => {
      expect(paymentService.isPaymentSuccessful('paid')).toBe(true);
      expect(paymentService.isPaymentSuccessful('captured')).toBe(true);
    });

    it('should identify unsuccessful payment statuses', () => {
      expect(paymentService.isPaymentSuccessful('initiated')).toBe(false);
      expect(paymentService.isPaymentSuccessful('failed')).toBe(false);
      expect(paymentService.isPaymentSuccessful('authorized')).toBe(false);
      expect(paymentService.isPaymentSuccessful('refunded')).toBe(false);
    });
  });

  describe('Payment Amount Validation', () => {
    it('should validate matching payment amounts', () => {
      const payment = {
        amount: 10000, // 100 SAR in halalas
      } as any;

      expect(paymentService.validatePaymentAmount(payment, 10000)).toBe(true);
    });

    it('should reject mismatched payment amounts', () => {
      const payment = {
        amount: 10000, // 100 SAR in halalas
      } as any;

      expect(paymentService.validatePaymentAmount(payment, 9999)).toBe(false);
      expect(paymentService.validatePaymentAmount(payment, 10001)).toBe(false);
    });
  });
});
