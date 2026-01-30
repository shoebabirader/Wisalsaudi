import { Collection, Filter } from 'mongodb';
import { getMongoDB } from '../db/mongodb';
import { Product } from '../types/product.types';

export interface SearchQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchSuggestion {
  type: 'product' | 'category';
  id: string;
  name: string;
  nameAr?: string;
  thumbnail?: string;
  price?: number;
}

export class SearchService {
  private productsCollection: Collection<Product> | null = null;

  private getCollection(): Collection<Product> {
    if (!this.productsCollection) {
      const db = getMongoDB();
      this.productsCollection = db.collection<Product>('products');
    }
    return this.productsCollection;
  }

  /**
   * Search products with filters and sorting
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Filter<Product> = {
      status: 'active', // Only show active products in search
    };

    // Text search
    if (query.q && query.q.trim()) {
      filter.$text = { $search: query.q.trim() };
    }

    // Category filter
    if (query.category) {
      filter.categoryId = query.category;
    }

    // Price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    // Rating filter
    if (query.minRating !== undefined) {
      filter['rating.average'] = { $gte: query.minRating };
    }

    // Build sort
    const sort: any = {};
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'price') {
      sort.price = sortOrder;
    } else if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder;
    } else if (sortBy === 'newest') {
      sort.createdAt = -1; // Always newest first
    } else if (sortBy === 'relevance' && query.q) {
      // When searching by text, sort by text score
      sort.score = { $meta: 'textScore' };
    } else {
      // Default sort by creation date
      sort.createdAt = -1;
    }

    // Execute query
    const findQuery = this.getCollection().find(filter);

    // Add text score projection if sorting by relevance
    if (sortBy === 'relevance' && query.q) {
      findQuery.project({ score: { $meta: 'textScore' } });
    }

    const [products, total] = await Promise.all([
      findQuery
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.getCollection().countDocuments(filter),
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

  /**
   * Get autocomplete suggestions
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = query.trim();

    // Search for products matching the query
    const products = await this.getCollection()
      .find({
        status: 'active',
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { nameAr: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } },
        ],
      })
      .limit(limit)
      .toArray();

    // Convert products to suggestions
    const suggestions: SearchSuggestion[] = products.map((product) => ({
      type: 'product' as const,
      id: product._id?.toString() || '',
      name: product.name,
      nameAr: product.nameAr,
      thumbnail: product.videos?.[0]?.thumbnail,
      price: product.price,
    }));

    return suggestions;
  }

  /**
   * Get trending search terms (placeholder for now)
   */
  async getTrendingSearches(): Promise<string[]> {
    // This would typically come from a search analytics collection
    // For now, return some common categories/terms
    return [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Beauty',
      'Sports',
    ];
  }

  /**
   * Ensure text indexes are created
   */
  async ensureIndexes(): Promise<void> {
    try {
      const collection = this.getCollection();
      
      // Create text index on searchable fields
      await collection.createIndex(
        {
          name: 'text',
          nameAr: 'text',
          description: 'text',
          descriptionAr: 'text',
          tags: 'text',
        },
        {
          weights: {
            name: 10,
            nameAr: 10,
            tags: 5,
            description: 1,
            descriptionAr: 1,
          },
          name: 'product_text_search',
        }
      );

      // Create indexes for filtering
      await collection.createIndex({ categoryId: 1 });
      await collection.createIndex({ price: 1 });
      await collection.createIndex({ 'rating.average': 1 });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ createdAt: -1 });

      console.log('✅ Search indexes created successfully');
    } catch (error) {
      console.error('Failed to create search indexes:', error);
      throw error;
    }
  }
}
