import { Router } from 'express';
import {
  searchProducts,
  getSearchSuggestions,
  getTrendingSearches,
} from '../controllers/search.controller';

const router = Router();

/**
 * @route   GET /api/search
 * @desc    Search products with filters and sorting
 * @access  Public
 * @query   q - Search query (optional)
 * @query   category - Category ID filter (optional)
 * @query   minPrice - Minimum price filter (optional)
 * @query   maxPrice - Maximum price filter (optional)
 * @query   minRating - Minimum rating filter (optional)
 * @query   sortBy - Sort field: relevance, price, rating, newest (optional, default: relevance)
 * @query   sortOrder - Sort order: asc, desc (optional, default: desc)
 * @query   page - Page number (optional, default: 1)
 * @query   limit - Results per page (optional, default: 20, max: 100)
 */
router.get('/', searchProducts);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions for search
 * @access  Public
 * @query   q - Search query (required, min 2 characters)
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/search/trending
 * @desc    Get trending search terms
 * @access  Public
 */
router.get('/trending', getTrendingSearches);

export default router;
