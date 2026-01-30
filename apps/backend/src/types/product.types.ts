export interface ProductVideo {
  id: string;
  url: string;
  hlsUrl: string;
  thumbnail: string;
  duration: number;
  order: number;
  views?: number;
  likes?: number;
}

export interface Specification {
  key: string;
  keyAr: string;
  value: string;
  valueAr: string;
}

export interface Inventory {
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
}

export interface Rating {
  average: number;
  count: number;
}

export type ProductStatus = 'active' | 'inactive' | 'pending';

export interface Product {
  _id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  currency: 'SAR';
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryPath: string[];
  videos: ProductVideo[];
  specifications: Specification[];
  inventory: Inventory;
  rating: Rating;
  tags: string[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  categoryPath: string[];
  videos: Omit<ProductVideo, 'views' | 'likes'>[];
  specifications?: Specification[];
  inventory: {
    quantity: number;
    lowStockThreshold?: number;
  };
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price?: number;
  originalPrice?: number;
  categoryId?: string;
  categoryPath?: string[];
  videos?: Omit<ProductVideo, 'views' | 'likes'>[];
  specifications?: Specification[];
  inventory?: {
    quantity?: number;
    lowStockThreshold?: number;
  };
  tags?: string[];
  status?: ProductStatus;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  status?: ProductStatus;
  search?: string;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
