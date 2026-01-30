import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateProductInput, UpdateProductInput, ProductQuery } from '../types/product.types';

export class ProductController {
  private static _productService: ProductService | null = null;

  private static get productService(): ProductService {
    if (!this._productService) {
      this._productService = new ProductService();
    }
    return this._productService;
  }

  /**
   * POST /api/products
   * Create a new product (seller only)
   */
  static async createProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.user!.id;
      const sellerName = req.user!.email; // In production, fetch from user profile
      const input: CreateProductInput = req.body;

      const product = await ProductController.productService.createProduct(
        sellerId,
        sellerName,
        input
      );

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products
   * Get products with pagination and filtering
   */
  static async getProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: ProductQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        categoryId: req.query.categoryId as string,
        sellerId: req.query.sellerId as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
        status: req.query.status as any,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await ProductController.productService.getProducts(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  static async getProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const product = await ProductController.productService.getProduct(id);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
            messageAr: 'المنتج غير موجود',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Update a product (seller only, own products)
   */
  static async updateProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const sellerId = req.user!.id;
      const input: UpdateProductInput = req.body;

      const product = await ProductController.productService.updateProduct(
        id,
        sellerId,
        input
      );

      if (!product) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found or you do not have permission to update it',
            messageAr: 'المنتج غير موجود أو ليس لديك صلاحية لتحديثه',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete a product (seller only, own products)
   */
  static async deleteProduct(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const sellerId = req.user!.id;

      const deleted = await ProductController.productService.deleteProduct(id, sellerId);

      if (!deleted) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found or you do not have permission to delete it',
            messageAr: 'المنتج غير موجود أو ليس لديك صلاحية لحذفه',
          },
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
        messageAr: 'تم حذف المنتج بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id/inventory
   * Update product inventory (seller only, own products)
   */
  static async updateInventory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        res.status(400).json({
          error: {
            code: 'INVALID_QUANTITY',
            message: 'Valid quantity is required',
            messageAr: 'الكمية الصحيحة مطلوبة',
          },
        });
        return;
      }

      const product = await ProductController.productService.updateInventory(id, quantity);

      if (!product) {
        res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
            messageAr: 'المنتج غير موجود',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
