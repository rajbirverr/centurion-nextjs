"use client"

import React from 'react';
import BaseDropdown from './BaseDropdown';

// Define about sections
const aboutSections = [
  { name: "OUR STORY", path: "#" },
  { name: "MISSION", path: "#" },
  { name: "TEAM", path: "#" },
  { name: "PRESS", path: "#" },
  { name: "CAREERS", path: "#" }
];

// Define team members to showcase
const teamMembers = [
  {
    id: 1,
    name: "Emma Johnson",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    quote: "Creating beauty with purpose",
    path: "#"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    quote: "Design is the silent ambassador",
    path: "#"
  },
  {
    id: 3,
    name: "Sophia Rodriguez",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    quote: "Quality over everything",
    path: "#"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Chief Innovation Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    quote: "Pushing boundaries daily",
    path: "#"
  }
];

interface AboutDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const AboutDropdown: React.FC<AboutDropdownProps> = ({
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
      {/* About sections tabs */}
      <div className="flex justify-center border-b border-[#e5e2e0]">
        {aboutSections.map((section, index) => (
          <a
            key={index}
            href={section.path}
            className={`px-6 py-4 text-sm uppercase tracking-[0.1em] ${index === 0 ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
          >
            {section.name}
          </a>
        ))}
      </div>

      {/* About content */}
      <div className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Our story section */}
          <div className="text-center mb-8">
            <h2 className="text-[#5a4c46] text-2xl font-light mb-4">Our Story</h2>
            <p className="text-[#84756f] max-w-3xl mx-auto">
              Founded in 2022, Centurion is dedicated to creating premium beauty products that enhance your natural beauty. 
              Our mission is to provide innovative, high-quality products that are sustainable and inclusive.
            </p>
          </div>

          {/* Team members grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {teamMembers.map((member) => (
              <div key={member.id} className="group">
                <div className="relative">
                  <div className="bg-[#f3f0ef] aspect-square flex items-center justify-center relative mb-4 overflow-hidden rounded-full">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-[#5a4c46] text-center uppercase tracking-wider text-sm font-medium">
                    {member.name}
                  </h3>
                  <p className="text-[#84756f] text-center text-sm mt-1">{member.role}</p>
                  <p className="text-[#91594c] text-center italic text-sm mt-2">&quot;{member.quote}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About button */}
        <div className="flex justify-center pt-8 pb-6">
          <a
            href="#"
            className="border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-12 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
          >
            Learn More About Us
          </a>
        </div>
      </div>
    </BaseDropdown>
  );
};

export default AboutDropdown;
