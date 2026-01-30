/**
 * Address Controller
 * Handles address management endpoints
 * Requirements: 11.1 - Address management for checkout
 */

import { Request, Response } from 'express';
import { AddressModel } from '../models/address.model';
import { NotFoundError, InternalServerError, ValidationError } from '../utils/errors';

export class AddressController {
  /**
   * Get all addresses for the authenticated user
   */
  static async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const addresses = await AddressModel.findByUserId(userId);

      res.json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      throw new InternalServerError('Failed to fetch addresses', 'فشل في جلب العناوين');
    }
  }

  /**
   * Get a specific address by ID
   */
  static async getAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const { id } = req.params;

      const address = await AddressModel.findById(id, userId);

      if (!address) {
        throw new NotFoundError('Address not found', 'العنوان غير موجود');
      }

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError('Failed to fetch address', 'فشل في جلب العنوان');
    }
  }

  /**
   * Create a new address
   */
  static async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const { type, street, city, province, postal_code, country, is_default } = req.body;

      // Validation
      if (!street || !city || !province || !country) {
        throw new ValidationError(
          'Missing required address fields',
          'حقول العنوان المطلوبة مفقودة'
        );
      }

      const address = await AddressModel.create(userId, {
        type: type || 'home',
        street,
        city,
        province,
        postal_code: postal_code || '',
        country,
        is_default: is_default || false,
      });

      res.status(201).json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new InternalServerError('Failed to create address', 'فشل في إنشاء العنوان');
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const { id } = req.params;
      const updates = req.body;

      // Check if address exists and belongs to user
      const existingAddress = await AddressModel.findById(id, userId);
      if (!existingAddress) {
        throw new NotFoundError('Address not found', 'العنوان غير موجود');
      }

      const address = await AddressModel.update(id, userId, updates);

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError('Failed to update address', 'فشل في تحديث العنوان');
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const { id } = req.params;

      // Check if address exists and belongs to user
      const existingAddress = await AddressModel.findById(id, userId);
      if (!existingAddress) {
        throw new NotFoundError('Address not found', 'العنوان غير موجود');
      }

      await AddressModel.delete(id, userId);

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError('Failed to delete address', 'فشل في حذف العنوان');
    }
  }

  /**
   * Get default address for the authenticated user
   */
  static async getDefaultAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const address = await AddressModel.findDefaultByUserId(userId);

      if (!address) {
        throw new NotFoundError('No default address found', 'لم يتم العثور على عنوان افتراضي');
      }

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError('Failed to fetch default address', 'فشل في جلب العنوان الافتراضي');
    }
  }
}
