"use client"

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./ui/carousel";

interface DripProduct {
  id: number | string;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface ProductGridProps {
  products?: DripProduct[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products = [] }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle carousel API events
  useEffect(() => {
    if (!api) {
      return;
    }

    // Update current slide when the carousel changes
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    // Set initial index
    setCurrentIndex(api.selectedScrollSnap());

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Helper function to truncate description
  const truncateDescription = (text: string, maxLines: number = 2) => {
    if (!text) return '';
    // Simple word-based truncation (approximate)
    const words = text.split(' ');
    const maxWords = maxLines * 10; // Approximate words per line
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Product Card component for desktop view
  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <div className="flex flex-col items-center text-center h-full">
      <div className="mb-5 h-72 w-full overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <h4 className="text-sm font-light text-[#5a4c46] mb-1 tracking-wide">{product.name}</h4>
      <div className="text-xs text-[#5a4c46]/80 mb-5 px-4 leading-relaxed max-w-[200px]">
        <p className="line-clamp-2">
          {product.description}
        </p>
        <button
          className="text-[#784D2C] text-xs underline mt-1 hover:no-underline"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/product/${product.id}`;
          }}
        >
          for more information click
        </button>
      </div>
      <button
        className="mt-auto w-full max-w-[180px] py-2 px-4 bg-white text-[#5a4c46] text-[11px] uppercase tracking-[0.2em] font-light border border-[#ddd] shadow-sm hover:bg-transparent hover:border-[#5a4c46] hover:text-[#5a4c46] transition-all duration-200"
      >
        ADD TO BAG
        <span className="ml-2">₹{product.price}</span>
      </button>
    </div>
  );

  return (
    <div className="mb-16">
      {/* Combined section with white background */}
      <div className="pt-6 pb-6 md:pt-12 md:pb-12 px-4 md:px-8 lg:px-12 shadow-sm border-y border-gray-100 overflow-visible bg-white">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Title and Description */}
          <div className="text-center mb-2 md:mb-10">
            <h2 className="uppercase text-[#5a4c46] tracking-[0.2em] text-xs font-light mb-1">EXPLORE</h2>
            <h3 className="text-[#5a4c46] text-xl font-normal" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Drip for Days Under ₹500</h3>
          </div>

          {/* Mobile View - Split layout with fixed info */}
          <div className="md:hidden">
            {/* Image Carousel */}
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-0">
                {products.length > 0 ? (
                  products.map((product) => (
                    <CarouselItem key={product.id} className="basis-full pl-0">
                      <div className="p-0">
                        <div className="h-[30.4rem] md:h-72 w-full overflow-hidden relative rounded-t-2xl">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-t-2xl"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="basis-full pl-0">
                    <div className="p-1 flex justify-center items-center h-56 text-gray-500">
                      <p>No products available. Add products from the admin panel.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {/* White Rectangle Container - Arrows Section */}
              <div className="pt-4 pb-1" style={{ backgroundColor: '#d4cdc3' }}>
                <div className="flex justify-center items-center">
                  <CarouselPrevious className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5a4c46]" />
                  <CarouselNext className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5a4c46]" />
                </div>
              </div>
            </Carousel>

            {/* White Rectangle Container - Product Info Section */}
            <div className="pb-4 rounded-b-2xl" style={{ backgroundColor: '#d4cdc3' }}>
              {/* Fixed Product Info */}
              <div className="text-center pt-1">
                <h4 className="text-sm font-light text-[#5a4c46] mb-2 tracking-wide">
                  {products[currentIndex]?.name}
                </h4>
                <div className="text-xs text-[#5a4c46]/80 mb-3 px-4 leading-relaxed max-w-[300px] mx-auto">
                  <p className="line-clamp-2 mb-1">
                    {products[currentIndex]?.description}
                  </p>
                  <button
                    className="text-[#784D2C] text-xs underline hover:no-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      if (products[currentIndex]?.id) {
                        window.location.href = `/product/${products[currentIndex].id}`;
                      }
                    }}
                  >
                    for more information click
                  </button>
                </div>
                <button
                  className="w-full max-w-[180px] py-2 px-4 bg-white text-[#5a4c46] text-[11px] uppercase tracking-[0.2em] font-light border border-[#ddd] shadow-sm hover:bg-transparent hover:border-[#5a4c46] hover:text-[#5a4c46] transition-all duration-200 mx-auto block"
                >
                  ADD TO BAG
                  <span className="ml-2">₹{products[currentIndex]?.price}</span>
                </button>

                {/* Carousel indicator */}
                <div className="mt-3 text-xs text-[#5a4c46]">
                  {currentIndex + 1} / {products.length}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Grid View */}
          {products.length > 0 ? (
            <div className="hidden md:block">
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-[9px]">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden md:block text-center py-12 text-gray-500">
              <p>No products available in this carousel. Add products from the admin panel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
