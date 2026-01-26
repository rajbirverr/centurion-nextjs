/**
 * Helper function to determine if an image should be unoptimized
 * Next.js Image optimization works with Supabase URLs via remotePatterns
 * Only unoptimize data URIs and external URLs not in remotePatterns
 */
export function shouldUnoptimizeImage(imageUrl: string | undefined | null): boolean {
  if (!imageUrl) return true
  // Only unoptimize data URIs - let Next.js optimize Supabase images
  return imageUrl.startsWith('data:')
}

/**
 * Get image src with fallback
 */
export function getImageSrc(imageUrl: string | undefined | null, fallback?: string): string {
  if (!imageUrl) return fallback || '/placeholder-image.png'
  return imageUrl
}
