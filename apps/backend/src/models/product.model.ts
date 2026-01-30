import { Collection, ObjectId, Filter } from 'mongodb';
import { getMongoDB } from '../db/mongodb';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  ProductListResponse,
} from '../types/product.types';

export class ProductModel {
  private collection: Collection<Product> | null = null;

  private getCollection(): Collection<Product> {
    if (!this.collection) {
      const db = getMongoDB();
      this.collection = db.collection<Product>('products');
    }
    return this.collection;
  }

  async create(sellerId: string, sellerName: string, input: CreateProductInput): Promise<Product> {
    const now = new Date();
    
    const product: Omit<Product, '_id'> = {
      ...input,
      currency: 'SAR',
      sellerId,
      sellerName,
      inventory: {
        quantity: input.inventory.quantity,
        lowStockThreshold: input.inventory.lowStockThreshold || 5,
        inStock: input.inventory.quantity > 0,
      },
      rating: {
        average: 0,
        count: 0,
      },
      tags: input.tags || [],
      specifications: input.specifications || [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.getCollection().insertOne(product as any);
    
    return {
      ...product,
      _id: result.insertedId.toString(),
    };
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.getCollection().findOne({ _id: new ObjectId(id) as any });
      
      if (!product) {
        return null;
      }

      return {
        ...product,
        _id: product._id?.toString(),
      };
    } catch (error) {
      return null;
    }
  }

  async findMany(query: ProductQuery): Promise<ProductListResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Filter<Product> = {};

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query.sellerId) {
      filter.sellerId = query.sellerId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.inStock !== undefined) {
      filter['inventory.inStock'] = query.inStock;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    if (query.minRating !== undefined) {
      filter['rating.average'] = { $gte: query.minRating };
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Build sort
    const sort: any = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'price') {
      sort.price = sortOrder;
    } else if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder;
    } else if (sortBy === 'name') {
      sort.name = sortOrder;
    } else {
      sort.createdAt = sortOrder;
    }

    // Execute query
    const collection = this.getCollection();
    const [products, total] = await Promise.all([
      collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        _id: p._id?.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, sellerId: string, input: UpdateProductInput): Promise<Product | null> {
    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    // Update inventory.inStock if quantity is being updated
    if (input.inventory?.quantity !== undefined) {
      updateData['inventory.quantity'] = input.inventory.quantity;
      updateData['inventory.inStock'] = input.inventory.quantity > 0;
      
      if (input.inventory.lowStockThreshold !== undefined) {
        updateData['inventory.lowStockThreshold'] = input.inventory.lowStockThreshold;
      }
      
      delete updateData.inventory;
    }

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id), sellerId } as any,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id?.toString(),
    };
  }

  async delete(id: string, sellerId: string): Promise<boolean> {
    const result = await this.getCollection().deleteOne({
      _id: new ObjectId(id),
      sellerId,
    } as any);

    return result.deletedCount > 0;
  }

  async updateInventory(id: string, quantity: number): Promise<Product | null> {
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          'inventory.quantity': quantity,
          'inventory.inStock': quantity > 0,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id?.toString(),
    };
  }

  async decrementInventory(id: string, quantity: number): Promise<Product | null> {
    const collection = this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), 'inventory.quantity': { $gte: quantity } } as any,
      {
        $inc: { 'inventory.quantity': -quantity },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    // Update inStock status if quantity is now 0
    if (result.inventory.quantity === 0) {
      await collection.updateOne(
        { _id: new ObjectId(id) } as any,
        { $set: { 'inventory.inStock': false } }
      );
      result.inventory.inStock = false;
    }

    return {
      ...result,
      _id: result._id?.toString(),
    };
  }

  async incrementInventory(id: string, quantity: number): Promise<Product | null> {
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $inc: { 'inventory.quantity': quantity },
        $set: { 
          'inventory.inStock': true,
          updatedAt: new Date() 
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id?.toString(),
    };
  }

  async updateRating(id: string, newRating: number): Promise<Product | null> {
    const product = await this.findById(id);
    
    if (!product) {
      return null;
    }

    const currentAverage = product.rating.average;
    const currentCount = product.rating.count;
    const newCount = currentCount + 1;
    const newAverage = (currentAverage * currentCount + newRating) / newCount;

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          'rating.average': Math.round(newAverage * 10) / 10,
          'rating.count': newCount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id?.toString(),
    };
  }
}
