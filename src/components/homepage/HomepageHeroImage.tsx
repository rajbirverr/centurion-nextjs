import { getHeroImageUrl } from '@/lib/actions/homepage-hero'

export default async function HomepageHeroImage() {
  const heroImageUrl = await getHeroImageUrl()

  return (
    <div className="absolute inset-0 w-full h-full rounded-t-2xl overflow-hidden">
      {heroImageUrl ? (
        <div className="w-full h-full" style={{
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 2%'
        }}></div>
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse"></div>
      )}
    </div>
  )
}
