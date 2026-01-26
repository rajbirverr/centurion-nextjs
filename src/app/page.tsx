import { Suspense } from 'react'
import HomepageHero from '@/components/homepage/HomepageHero'
import HomepageShowcase from '@/components/homepage/HomepageShowcase'
import HomepageProductGrid from '@/components/homepage/HomepageProductGrid'
import HomepageSetsSection from '@/components/homepage/HomepageSetsSection'
import HomepageCategoryCarousel from '@/components/homepage/HomepageCategoryCarousel'
import { getHomepageSetsData } from '@/lib/actions/homepage-sets'

export const metadata = {
  title: 'CENTURION - Luxury Jewelry & Shine',
  description: 'Centurion makes jewelry that\'s playful, pretty, and totally extra — for days when you wanna shine like you mean it.',
};

// Note: revalidate is not compatible with cacheComponents
// Caching is handled automatically by cacheComponents

export default async function HomePage() {
  // Start fetching homepageSetsData but don't await - let it stream in
  // This allows the page to start rendering immediately
  const homepageSetsDataPromise = getHomepageSetsData()

  return (
    <main className="App">
      {/* Hero section - renders immediately, image streams in */}
      <HomepageHero />

      {/* Showcase section - streams in with Suspense */}
      <HomepageShowcase />

      {/* Product Grid - streams in with Suspense */}
      <HomepageProductGrid />

      {/* Homepage Sets Section - streams in with Suspense */}
      <Suspense fallback={<div className="mb-16 h-96 bg-gray-100 animate-pulse"></div>}>
        <HomepageSetsSectionWrapper dataPromise={homepageSetsDataPromise} />
      </Suspense>

      {/* Category Carousel - streams in with Suspense */}
      <HomepageCategoryCarousel />
    </main>
  );
}

// Wrapper component to handle the promise
async function HomepageSetsSectionWrapper({ dataPromise }: { dataPromise: Promise<any> }) {
  const homepageSetsData = await dataPromise
  return <HomepageSetsSection initialData={homepageSetsData} />
}
