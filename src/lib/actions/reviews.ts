'use server'

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'

export interface Review {
  id: string
  product_id: string
  user_id: string
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

export interface FetchReviewsResult {
  success: boolean
  reviews?: Review[]
  error?: string
}

export async function fetchProductReviews(
  productId: string,
  sortBy: 'most_recent' | 'oldest' | 'highest' | 'lowest' | 'most_helpful' = 'most_recent',
  filterRating?: number | null
): Promise<FetchReviewsResult> {
  try {
    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)

    // Filter by rating if provided
    if (filterRating && filterRating > 0) {
      query = query.eq('rating', filterRating)
    }

    // Sort based on sortBy parameter
    switch (sortBy) {
      case 'most_recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'highest':
        query = query.order('rating', { ascending: false })
        break
      case 'lowest':
        query = query.order('rating', { ascending: true })
        break
      case 'most_helpful':
        query = query.order('helpful_yes', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return { success: false, error: error.message }
    }

    return { success: true, reviews: (data || []) as Review[] }
  } catch (error: any) {
    console.error('Error in fetchProductReviews:', error)
    return { success: false, error: error.message || 'Failed to fetch reviews' }
  }
}

export interface SubmitReviewData {
  product_id: string
  rating: number
  title: string
  content: string
  author_name: string
  age_range?: string
  favorite_features?: string[]
  is_verified_purchase?: boolean
}

export async function submitReview(data: SubmitReviewData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to submit a review' }
    }

    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: data.product_id,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        content: data.content,
        author_name: data.author_name,
        age_range: data.age_range,
        favorite_features: data.favorite_features || [],
        is_verified_purchase: data.is_verified_purchase || false
      })

    if (error) {
      console.error('Error submitting review:', error)
      return { success: false, error: error.message || 'Failed to submit review' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in submitReview:', error)
    return { success: false, error: error.message || 'Failed to submit review' }
  }
}

export async function markReviewHelpful(reviewId: string, helpful: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    
    if (helpful) {
      const { error } = await supabase.rpc('increment_helpful_yes', { review_id: reviewId })
      if (error) {
        // Fallback to manual update if RPC doesn't exist
        const { data: review } = await supabase
          .from('reviews')
          .select('helpful_yes')
          .eq('id', reviewId)
          .single()
        
        if (review) {
          await supabase
            .from('reviews')
            .update({ helpful_yes: (review.helpful_yes || 0) + 1 })
            .eq('id', reviewId)
        }
      }
    } else {
      const { error } = await supabase.rpc('increment_helpful_no', { review_id: reviewId })
      if (error) {
        // Fallback to manual update if RPC doesn't exist
        const { data: review } = await supabase
          .from('reviews')
          .select('helpful_no')
          .eq('id', reviewId)
          .single()
        
        if (review) {
          await supabase
            .from('reviews')
            .update({ helpful_no: (review.helpful_no || 0) + 1 })
            .eq('id', reviewId)
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in markReviewHelpful:', error)
    return { success: false, error: error.message || 'Failed to mark review as helpful' }
  }
}

