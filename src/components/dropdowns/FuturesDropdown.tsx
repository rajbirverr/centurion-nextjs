"use client"

import React from 'react';
import BaseDropdown from './BaseDropdown';

// Define futures sections
const futuresSections = [
  { name: "UPCOMING", path: "#" },
  { name: "INNOVATION", path: "#" },
  { name: "SUSTAINABILITY", path: "#" },
  { name: "COLLABORATIONS", path: "#" }
];

// Define upcoming initiatives
const upcomingInitiatives = [
  {
    id: 1,
    name: "SKIN REPAIR SYSTEM",
    description: "Revolutionary repair technology",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    date: "Coming Fall 2023",
    path: "#"
  },
  {
    id: 2,
    name: "ECO PACKAGING",
    description: "100% compostable packaging",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    date: "Coming Winter 2023",
    path: "#"
  },
  {
    id: 3,
    name: "ARTIST COLLABORATION",
    description: "Limited edition designs",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    date: "Spring 2024",
    path: "#"
  },
  {
    id: 4,
    name: "COMMUNITY INITIATIVES",
    description: "Supporting local artisans",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    date: "Ongoing",
    path: "#"
  }
];

interface FuturesDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const FuturesDropdown: React.FC<FuturesDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Futures sections tabs */}
      <div className="flex justify-center border-b border-[#e5e2e0]">
        {futuresSections.map((section, index) => (
          <a
            key={index}
            href={section.path}
            className={`px-6 py-4 text-sm uppercase tracking-[0.1em] ${index === 0 ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
          >
            {section.name}
          </a>
        ))}
      </div>

      {/* Futures content */}
      <div className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Title section */}
          <div className="text-center mb-8">
            <h2 className="text-[#5a4c46] text-2xl font-light mb-4">Centurion Futures</h2>
            <p className="text-[#84756f] max-w-3xl mx-auto">
              Exploring what&apos;s next in beauty. Our commitment to innovation, sustainability, and community shapes our vision for the future.
            </p>
          </div>

          {/* Initiatives grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {upcomingInitiatives.map((initiative) => (
              <div key={initiative.id} className="group">
                <div className="relative">
                  <div className="bg-[#f3f0ef] aspect-square flex items-center justify-center relative mb-4 overflow-hidden">
                    <img
                      src={initiative.image}
                      alt={initiative.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs uppercase tracking-wider px-3 py-1.5 border border-white rounded-sm">
                        Learn More
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#f3f0ef] absolute top-2 left-2 py-1 px-2 text-[#5a4c46] text-xs">
                    {initiative.date}
                  </div>
                  <h3 className="text-[#5a4c46] uppercase tracking-wider text-sm font-medium">
                    {initiative.name}
                  </h3>
                  <p className="text-[#84756f] text-sm mt-1">{initiative.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Futures button */}
        <div className="flex justify-center pt-8 pb-6">
          <a
            href="#"
            className="border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-12 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
          >
            View All Initiatives
          </a>
        </div>
      </div>
    </BaseDropdown>
  );
};

export default FuturesDropdown;
