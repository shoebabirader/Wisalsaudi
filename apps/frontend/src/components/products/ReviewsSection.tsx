'use client';

import { useState } from 'react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  media: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  helpful: number;
  verified: boolean;
  createdAt: string;
}

interface ReviewsSectionProps {
  productId: string;
  rating: {
    average: number;
    count: number;
  };
  language?: 'en' | 'ar';
}

export function ReviewsSection({
  productId,
  rating,
  language = 'en',
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  // Mock rating breakdown - in real app, fetch from API
  const ratingBreakdown = {
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2,
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const handleWriteReview = () => {
    // TODO: Open review modal or navigate to review page
    console.log('Write review for product:', productId);
  };

  const handleFilterByRating = (stars: number) => {
    setSelectedFilter(selectedFilter === stars ? null : stars);
    // TODO: Fetch filtered reviews from API
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'التقييمات والمراجعات' : 'Ratings & Reviews'}
        </h2>
        <button
          onClick={handleWriteReview}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {language === 'ar' ? 'اكتب مراجعة' : 'Write Review'}
        </button>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {rating.average.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {renderStars(rating.average, 'lg')}
          </div>
          <p className="text-gray-600">
            {language === 'ar' ? 'بناءً على' : 'Based on'} {rating.count.toLocaleString()}{' '}
            {language === 'ar' ? 'تقييم' : 'reviews'}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentage = ratingBreakdown[stars as keyof typeof ratingBreakdown];
            return (
              <button
                key={stars}
                onClick={() => handleFilterByRating(stars)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedFilter === stars ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-gray-700">{stars}</span>
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-end">{percentage}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-2">
              {language === 'ar' ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {language === 'ar'
                ? 'كن أول من يكتب مراجعة لهذا المنتج'
                : 'Be the first to write a review for this product'}
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            {language === 'ar' ? 'مشتري موثق' : 'Verified Purchase'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating, 'sm')}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                )}

                {/* Review Media */}
                {review.media && review.media.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {review.media.map((item, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Review media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <img
                              src={item.thumbnail || item.url}
                              alt={`Review video ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span>
                      {language === 'ar' ? 'مفيد' : 'Helpful'} ({review.helpful})
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <span className="text-gray-600">
                  {language === 'ar' ? 'صفحة' : 'Page'} {currentPage} {language === 'ar' ? 'من' : 'of'}{' '}
                  {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
