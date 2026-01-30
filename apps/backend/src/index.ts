import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import videoRoutes from './routes/video.routes';
import searchRoutes from './routes/search.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import addressRoutes from './routes/address.routes';
import { errorHandler } from './middleware/errorHandler';
import { connectMongoDB } from './db/mongodb';
import { SearchService } from './services/search.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'wisal-backend',
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'WISAL E-Commerce API',
    version: '1.0.0',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Video routes
app.use('/api/videos', videoRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Address routes
app.use('/api/addresses', addressRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      messageAr: 'المورد المطلوب غير موجود',
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  // Initialize MongoDB connection
  connectMongoDB()
    .then(async () => {
      // Initialize search indexes
      const searchService = new SearchService();
      await searchService.ensureIndexes();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

export default app;
