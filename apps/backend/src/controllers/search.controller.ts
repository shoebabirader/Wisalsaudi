import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { ValidationError } from '../utils/errors';

const searchService = new SearchService();

/**
 * Search products
 * GET /api/search
 */
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    // Validate and parse query parameters
    const searchQuery = {
      q: q as string | undefined,
      category: category as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      sortBy: sortBy as 'relevance' | 'price' | 'rating' | 'newest' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    };

    // Validate numeric parameters
    if (searchQuery.minPrice !== undefined && isNaN(searchQuery.minPrice)) {
      throw new ValidationError('Invalid minPrice parameter', 'معامل minPrice غير صالح');
    }
    if (searchQuery.maxPrice !== undefined && isNaN(searchQuery.maxPrice)) {
      throw new ValidationError('Invalid maxPrice parameter', 'معامل maxPrice غير صالح');
    }
    if (searchQuery.minRating !== undefined && isNaN(searchQuery.minRating)) {
      throw new ValidationError('Invalid minRating parameter', 'معامل minRating غير صالح');
    }
    if (isNaN(searchQuery.page) || searchQuery.page < 1) {
      throw new ValidationError('Invalid page parameter', 'معامل الصفحة غير صالح');
    }
    if (isNaN(searchQuery.limit) || searchQuery.limit < 1 || searchQuery.limit > 100) {
      throw new ValidationError('Invalid limit parameter (must be between 1 and 100)', 'معامل الحد غير صالح (يجب أن يكون بين 1 و 100)');
    }

    // Validate sortBy
    const validSortBy = ['relevance', 'price', 'rating', 'newest'];
    if (searchQuery.sortBy && !validSortBy.includes(searchQuery.sortBy)) {
      throw new ValidationError('Invalid sortBy parameter', 'معامل sortBy غير صالح');
    }

    // Validate sortOrder
    if (searchQuery.sortOrder && !['asc', 'desc'].includes(searchQuery.sortOrder)) {
      throw new ValidationError('Invalid sortOrder parameter', 'معامل sortOrder غير صالح');
    }

    // Perform search
    const results = await searchService.search(searchQuery);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get search suggestions (autocomplete)
 * GET /api/search/suggestions
 */
export const getSearchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ValidationError('Query parameter "q" is required', 'معامل الاستعلام "q" مطلوب');
    }

    if (q.trim().length < 2) {
      res.json({
        success: true,
        data: {
          suggestions: [],
        },
      });
      return;
    }

    const suggestions = await searchService.getSuggestions(q, 10);

    res.json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending searches
 * GET /api/search/trending
 */
export const getTrendingSearches = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trending = await searchService.getTrendingSearches();

    res.json({
      success: true,
      data: {
        trending,
      },
    });
  } catch (error) {
    next(error);
  }
};
