import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import CategoryCarousel from '@/components/CategoryCarousel';
import HomepageSetsSection from '@/components/homepage/HomepageSetsSection';
import ShineCarousel from '@/components/homepage/ShineCarousel';
import { getHomepageData } from '@/lib/actions/homepage';
import { getHomepageSetsData } from '@/lib/actions/homepage-sets';


export const metadata = {
  title: 'CENTURION - Luxury Jewelry & Shine',
  description: 'Centurion makes jewelry that\'s playful, pretty, and totally extra — for days when you wanna shine like you mean it.',
};

export default async function HomePage() {
  // Fetch all data in parallel on the server
  const [homepageData, homepageSetsData] = await Promise.all([
    getHomepageData(),
    getHomepageSetsData()
  ]);

  const {
    heroImageUrl,
    showcaseCardImageUrl,
    shineCarouselProducts,
    dripCarouselProducts,
    categoryCarouselItems
  } = homepageData;

  return (
    <main className="App">
      {/* Main home page content */}
      {/* Brand Statement Section with image and scrolling credits */}
      <section className="mb-4 px-4 md:px-8 lg:px-12 relative" aria-label="Hero Section">
        <div className="max-w-[1440px] mx-auto">
          {/* Full-width image container - reduced height to fit viewport with scrolling text */}
          <div className="w-full mb-4 relative" style={{ height: '450px' }}>
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
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

            {/* Fixed "Sparkle & Shine" text on image with sparkle effects only */}
            <div className="absolute top-[8%] left-[5%] z-20">
              <h3 className="sparkle-text text-[#784D2C] text-base sm:text-lg md:text-xl lg:text-2xl font-normal drop-shadow-md"
                style={{
                  fontFamily: "'Rhode', sans-serif",
                  letterSpacing: '0.01em',
                  textShadow: '0 0 3px white',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                Sparkle & Shine

                {/* Sparkle particles */}
                <span className="sparkle-particle" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></span>
                <span className="sparkle-particle" style={{ top: '30%', left: '80%', animationDelay: '0.3s' }}></span>
                <span className="sparkle-particle" style={{ top: '70%', left: '30%', animationDelay: '0.6s' }}></span>
                <span className="sparkle-particle" style={{ top: '60%', left: '70%', animationDelay: '0.9s' }}></span>
                <span className="sparkle-particle" style={{ top: '10%', left: '40%', animationDelay: '1.2s' }}></span>
                <span className="sparkle-particle" style={{ top: '80%', left: '60%', animationDelay: '1.5s' }}></span>
              </h3>
            </div>
          </div>

          {/* Scrolling text section below the image */}
          <div className="w-full mb-6">
            <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-1 text-center">
              WHAT WE&apos;RE ALL ABOUT
            </h2>

            {/* Credits container with mask for fade out effect - reduced height */}
            <div className="credits-container-compact relative">
              {/* Brand logo that toggles visibility */}
              <div className="brand-logo text-center">
                <h1 className="text-[#5a4c46] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider w-full text-center"
                  style={{
                    fontFamily: "'Rhode', sans-serif",
                    textAlign: "center"
                  }}>
                  CENTURION
                </h1>
                <div className="w-24 h-0.5 bg-[#784D2C] my-1 mx-auto"></div>
              </div>

              {/* Scrolling credits content */}
              <div className="credits-content">
                <div className="py-4 text-center">
                  <p className="text-[#5a4c46] text-lg md:text-xl lg:text-2xl font-medium tracking-wide leading-relaxed max-w-[950px] mx-auto">
                    Centurion makes jewelry that&apos;s playful, pretty, and totally extra — for days when you wanna shine like you mean it (and nights when you really do)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jewelry Showcase Grid - Two cards side by side */}
      <section className="mb-16 px-4 md:px-8 lg:px-12" aria-label="Featured Collections">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Title */}
          <div className="text-center mb-10">
            <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-2">FEATURED COLLECTIONS</h2>
            <h3 className="text-[#784D2C] text-xl font-normal" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Our Exclusive Designs</h3>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Jewelry Card */}
            <div className="relative overflow-hidden rounded-3xl bg-black group cursor-pointer shadow-lg">
              <div className="aspect-[4/5] relative">
                {showcaseCardImageUrl ? (
                  <img
                    src={showcaseCardImageUrl}
                    alt="Luxury jewelry"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    style={{ objectPosition: "center 10%" }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse"></div>
                )}

                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="text-[10px] font-light tracking-[0.3em] mb-2" style={{ color: 'rgba(90, 76, 70, 0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif', letterSpacing: '0.2em' }}>ELEGANT ESSENCE</div>
                  <div className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] mb-3 leading-none" style={{
                    color: 'rgba(120, 77, 44, 0.7)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                    fontWeight: '300',
                    letterSpacing: '0.01em'
                  }}>
                    The<br />
                    <span style={{
                      color: 'rgba(120, 77, 44, 0.8)',
                      fontWeight: '400'
                    }}>Jewelry</span>
                  </div>
                  <div className="text-lg md:text-xl lg:text-2xl text-right w-full leading-tight" style={{
                    color: 'rgba(120, 77, 44, 0.7)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                    fontWeight: '300',
                    letterSpacing: '0.01em'
                  }}>
                    Collection
                  </div>
                </div>

                {/* Visit site button */}
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href="/all-products">
                    <button className="flex items-center space-x-2 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm transition-all duration-300 border border-red-400/30 hover:bg-red-600/50" style={{
                      background: 'rgba(220, 38, 38, 0.4)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                      boxShadow: '0 2px 8px 0 rgba(220, 38, 38, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ color: '#ffffff', fontWeight: '400' }}>Visit shop</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Second Jewelry Card with Shine Carousel */}
            <div className="relative overflow-hidden rounded-3xl bg-black group shadow-lg">
              <div className="aspect-[4/5] relative">
                {/* Solid white background */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{ backgroundColor: "#ffffff" }}
                ></div>

                {/* Text overlay - positioned above carousel */}
                <div className="absolute top-2 sm:top-3 left-0 w-full p-4 sm:p-6 text-[#5a4c46] z-30 pointer-events-none">
                  <div className="flex flex-row items-start gap-2 sm:gap-3 md:gap-4">
                    {/* The Shine title - left side */}
                    <div className="text-[2rem] sm:text-[2.5rem] md:text-5xl lg:text-6xl font-light tracking-wide opacity-100 leading-none flex-shrink-0" style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                      color: '#5a4c46',
                      fontWeight: '300'
                    }}>
                      The<br />
                      <span className="text-[#784D2C] font-medium tracking-wide" style={{ fontWeight: '400' }}>Shine</span>
                    </div>
                    {/* Text box - right side on all screens */}
                    <div
                      className="backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg inline-block shadow-sm self-start flex-shrink"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.5) 0%, rgba(107, 114, 128, 0.5) 50%, rgba(0, 123, 255, 0.5) 100%)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        maxWidth: 'calc(100% - 120px)',
                        width: 'fit-content'
                      }}
                    >
                      <p className="text-white text-[10px] sm:text-xs md:text-base lg:text-lg max-w-[300px] sm:max-w-[400px] tracking-wide leading-relaxed" style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      }}>
                        Wear what feels good. Match your mood. Be the queen you are born to be.
                        <span className="inline-block ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                          </svg>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shine Carousel */}
                <ShineCarousel products={shineCarouselProducts} />

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid / Drip Carousel Section */}
      <ProductGrid products={dripCarouselProducts} />

      {/* Homepage Sets Section */}
      <HomepageSetsSection initialData={homepageSetsData} />

      {/* Category Carousel Section */}
      <CategoryCarousel categories={categoryCarouselItems} />

    </main>
  );
}
