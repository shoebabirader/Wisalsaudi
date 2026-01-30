/**
 * Address Routes
 * API routes for address management
 * Requirements: 11.1 - Address management for checkout
 */

import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All address routes require authentication
router.use(authenticate);

// Get all addresses for authenticated user
router.get('/', asyncHandler(AddressController.getAddresses));

// Get default address
router.get('/default', asyncHandler(AddressController.getDefaultAddress));

// Get specific address
router.get('/:id', asyncHandler(AddressController.getAddress));

// Create new address
router.post('/', asyncHandler(AddressController.createAddress));

// Update address
router.put('/:id', asyncHandler(AddressController.updateAddress));

// Delete address
router.delete('/:id', asyncHandler(AddressController.deleteAddress));

export default router;
