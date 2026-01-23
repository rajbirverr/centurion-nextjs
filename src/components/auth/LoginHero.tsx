'use client'

export default function LoginHero() {
  return (
    <div className="relative w-full h-full min-h-[50vh] md:min-h-screen flex items-center justify-center bg-[#f3f0ef] overflow-hidden">
      {/* Hero Image - using a placeholder, replace with actual hero image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_HERO_IMAGE || '/a-photo-of-an-indian-supermodel-wearing-_ndzmXzg3SK-rLn8lD3m5YA_6agnmnUiS6m81W-isnTe-Q.jpeg'})`,
          backgroundColor: '#f3f0ef'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Overlay Text */}
      <div className="relative z-10 text-center px-8 md:px-12 max-w-md mx-auto auth-page">
        <p className="text-white text-xl md:text-2xl lg:text-3xl font-light tracking-wide leading-relaxed">
          It's time to invest in your <span className="font-medium">SKIN.</span>
        </p>
      </div>
    </div>
  )
}

