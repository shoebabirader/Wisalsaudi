import { ProductModel } from '../models/product.model';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  ProductListResponse,
} from '../types/product.types';

export class ProductService {
  private productModel: ProductModel;

  constructor() {
    this.productModel = new ProductModel();
  }

  async createProduct(
    sellerId: string,
    sellerName: string,
    input: CreateProductInput
  ): Promise<Product> {
    // Validate required fields
    if (!input.name || !input.nameAr) {
      throw new Error('Product name is required in both languages');
    }

    if (!input.description || !input.descriptionAr) {
      throw new Error('Product description is required in both languages');
    }

    if (!input.price || input.price <= 0) {
      throw new Error('Valid product price is required');
    }

    if (!input.categoryId) {
      throw new Error('Category is required');
    }

    if (!input.videos || input.videos.length === 0) {
      throw new Error('At least one product video is required');
    }

    if (!input.inventory || input.inventory.quantity < 0) {
      throw new Error('Valid inventory quantity is required');
    }

    return this.productModel.create(sellerId, sellerName, input);
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.productModel.findById(id);
  }

  async getProducts(query: ProductQuery): Promise<ProductListResponse> {
    return this.productModel.findMany(query);
  }

  async updateProduct(
    id: string,
    sellerId: string,
    input: UpdateProductInput
  ): Promise<Product | null> {
    // Validate price if provided
    if (input.price !== undefined && input.price <= 0) {
      throw new Error('Valid product price is required');
    }

    return this.productModel.update(id, sellerId, input);
  }

  async deleteProduct(id: string, sellerId: string): Promise<boolean> {
    return this.productModel.delete(id, sellerId);
  }

  async updateInventory(id: string, quantity: number): Promise<Product | null> {
    if (quantity < 0) {
      throw new Error('Inventory quantity cannot be negative');
    }

    return this.productModel.updateInventory(id, quantity);
  }

  async decrementInventory(id: string, quantity: number): Promise<Product | null> {
    if (quantity <= 0) {
      throw new Error('Quantity to decrement must be positive');
    }

    const product = await this.productModel.decrementInventory(id, quantity);
    
    if (!product) {
      throw new Error('Insufficient inventory or product not found');
    }

    return product;
  }
}
