'use client'

import { useState, useEffect, useRef } from 'react'

interface ShineCarouselProduct {
    id: string
    name: string
    location: string
    image: string
}

interface ShineCarouselProps {
    products: ShineCarouselProduct[]
}

export default function ShineCarousel({ products }: ShineCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    // Handle auto-rotation
    useEffect(() => {
        if (products.length === 0) return

        startAutoRotation()

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [products.length])

    const startAutoRotation = () => {
        if (timerRef.current) clearInterval(timerRef.current)

        timerRef.current = setInterval(() => {
            if (!isAnimating && products.length > 0) {
                handleNextSlide()
            }
        }, 3000)
    }

    const pauseAutoRotation = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const resumeAutoRotation = () => {
        startAutoRotation()
    }

    const handleNextSlide = () => {
        if (isAnimating || products.length === 0) return

        setIsAnimating(true)
        setActiveIndex(prev => (prev + 1) % products.length)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handlePrevSlide = () => {
        if (isAnimating || products.length === 0) return

        setIsAnimating(true)
        setActiveIndex(prev => (prev - 1 + products.length) % products.length)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handleDotClick = (index: number) => {
        if (isAnimating || index === activeIndex) return

        setIsAnimating(true)
        setActiveIndex(index)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        pauseAutoRotation()
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const touchThreshold = 50
        const touchDiff = touchEndX.current - touchStartX.current

        if (Math.abs(touchDiff) > touchThreshold) {
            if (touchDiff > 0) {
                handlePrevSlide()
            } else {
                handleNextSlide()
            }
        }
        resumeAutoRotation()
    }

    if (products.length === 0) {
        return (
            <div className="absolute bottom-0 left-0 right-0 h-[75%] z-10 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No products in carousel</p>
            </div>
        )
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 h-[75%] z-10">
            {/* Carousel Container */}
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl">
                {/* Carousel items */}
                <div
                    className="relative w-full h-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {products.map((product, index) => {
                        const position = (index - activeIndex + products.length) % products.length
                        let normalizedPosition = position
                        if (position > Math.floor(products.length / 2)) {
                            normalizedPosition = position - products.length
                        }

                        const isActive = normalizedPosition === 0
                        const zIndex = isActive ? 2 : 1
                        const opacity = isActive ? 1 : 0

                        return (
                            <div
                                key={product.id}
                                className="absolute inset-0 transition-all duration-500 ease-in-out overflow-hidden"
                                style={{
                                    opacity,
                                    zIndex,
                                    transform: isActive ? 'scale(1)' : 'scale(0.95)',
                                    pointerEvents: isActive ? 'auto' : 'none'
                                }}
                                onClick={() => {
                                    pauseAutoRotation()
                                    handleDotClick(index)
                                    resumeAutoRotation()
                                }}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-in-out"
                                    style={{
                                        transform: isActive ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                />

                                <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                                    <div className="mt-auto text-center mb-2">
                                        <h3 className="text-white drop-shadow-lg text-xl sm:text-2xl font-medium" style={{
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                                            letterSpacing: '0.01em',
                                            fontWeight: '400',
                                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
                                        }}>{product.name}</h3>
                                        <p className="text-white/90 drop-shadow-md text-xs sm:text-sm uppercase tracking-[0.2em] font-light" style={{
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                                            fontWeight: '300',
                                            textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
                                        }}>{product.location}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-2 sm:space-x-3 z-20 px-4">
                    {products.map((_, index) => {
                        const isActive = activeIndex === index
                        return (
                            <button
                                key={index}
                                aria-label={`Go to slide ${index + 1}`}
                                className="relative transition-all duration-500 ease-out flex-shrink-0 focus:outline-none group"
                                onClick={() => {
                                    pauseAutoRotation()
                                    handleDotClick(index)
                                    resumeAutoRotation()
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    {isActive ? (
                                        <div className="relative">
                                            <div className="flex items-center space-x-1">
                                                <div
                                                    className="w-8 h-0.5 sm:w-10 sm:h-1 bg-[#784D2C] rounded-full transition-all duration-500"
                                                    style={{
                                                        boxShadow: '0 0 12px rgba(120, 77, 44, 0.5)'
                                                    }}
                                                ></div>
                                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#784D2C] rounded-full"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="w-6 h-0.5 sm:w-8 sm:h-0.5 bg-[#5a4c46]/30 rounded-full transition-all duration-300 group-hover:bg-[#5a4c46]/50 group-hover:w-7 group-hover:sm:w-9"
                                        ></div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
