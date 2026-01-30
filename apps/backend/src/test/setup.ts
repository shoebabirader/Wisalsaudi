/**
 * Test Setup File
 * Loads test environment variables before running tests
 */

import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

console.log('🧪 Test environment loaded');
console.log('📦 MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');
