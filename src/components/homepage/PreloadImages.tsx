import { getHeroImageUrl } from '@/lib/actions/homepage-hero'
import { getShowcaseCardImageUrl } from '@/lib/actions/homepage-showcase'

/**
 * Server component that preloads critical images
 * This runs in parallel and doesn't block rendering
 */
export default async function PreloadImages() {
  // Fetch images in parallel (non-blocking)
  const [heroImageUrl, showcaseImageUrl] = await Promise.all([
    getHeroImageUrl().catch(() => null),
    getShowcaseCardImageUrl().catch(() => null)
  ])

  return (
    <>
      {heroImageUrl && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}
      {showcaseImageUrl && (
        <link
          rel="preload"
          as="image"
          href={showcaseImageUrl}
          fetchPriority="high"
        />
      )}
    </>
  )
}
