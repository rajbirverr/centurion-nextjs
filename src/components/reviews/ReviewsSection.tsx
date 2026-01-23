'use client'

import { useEffect, useState } from 'react'
import { fetchProductReviews } from '@/lib/actions/reviews'
import ReviewForm from './ReviewForm'

interface ReviewsSectionProps {
  productId: string
  productName: string
}

interface Review {
  id: string
  rating: number
  title: string
  content: string
  author_name: string
  age_range?: string
  favorite_features?: string[]
  helpful_yes: number
  helpful_no: number
  is_verified_purchase: boolean
  created_at: string
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchProductReviews(productId, 'most_recent')
      
      if (result.success && result.reviews) {
        setReviews(result.reviews)
      } else {
        setError(result.error || 'Failed to load reviews')
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err)
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-light uppercase tracking-wide text-[#5a4c46] mb-8">
          Customer Reviews
        </h2>

        {/* Average Rating */}
        {reviews.length > 0 && (
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-light text-[#5a4c46]">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-8 mb-12">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-8 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[#5a4c46] mb-1">{review.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.author_name}</span>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.content}</p>
                {review.favorite_features && review.favorite_features.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Favorite Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.favorite_features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <button className="hover:text-[#5a4c46]">
                    Helpful ({review.helpful_yes})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        <ReviewForm productId={productId} productName={productName} onReviewSubmitted={loadReviews} />
      </div>
    </div>
  )
}

