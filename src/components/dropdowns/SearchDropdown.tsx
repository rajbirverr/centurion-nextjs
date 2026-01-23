"use client"

import React, { useState } from 'react';
import BaseDropdown from './BaseDropdown';

// Define popular searches
const popularSearches = [
  "Lip treatment", "Face serum", "Body cream", "Gift sets", "New arrivals"
];

// Define recent searches (would typically come from localStorage or backend)
const recentSearches = [
  "Face moisturizer", "Sunscreen", "Lip tint", "Blush", "Foundation"
];

// Sample search results for demonstration
const sampleResults = [
  {
    id: 1,
    name: "PEPTIDE LIP TREATMENT",
    category: "LIP CARE",
    image: "https://www.rhodeskin.com/cdn/shop/files/PBJ-tint-set_1_grande.png?v=1741911249",
    price: "₹1,600",
    path: "#"
  },
  {
    id: 2,
    name: "SKIN RENEWAL SERUM",
    category: "SKIN CARE",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "₹2,400",
    path: "#"
  },
  {
    id: 3,
    name: "DAILY MOISTURIZER",
    category: "SKIN CARE",
    image: "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "₹1,800",
    path: "#"
  }
];

interface SearchDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length > 0);
  };

  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search input */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, categories..."
                className="w-full bg-[#f3f0ef] border-none px-5 py-3 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                value={searchTerm}
                onChange={handleSearchInput}
                autoFocus
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button className="text-[#5a4c46] focus:outline-none" aria-label="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Show search results if user has typed something */}
          {showResults ? (
            <div className="mt-6">
              <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">RESULTS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sampleResults.map((result) => (
                  <a key={result.id} href={result.path} className="group block">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#f3f0ef] w-20 h-20 flex items-center justify-center">
                        <img src={result.image} alt={result.name} className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-[#84756f] text-xs">{result.category}</p>
                        <h4 className="text-[#5a4c46] text-sm font-medium">{result.name}</h4>
                        <p className="text-[#5a4c46] text-sm mt-1">{result.price}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="text-center mt-8">
                <a href="#" className="text-[#5a4c46] hover:text-[#91594c] text-sm underline">
                  View all results
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Popular searches */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">POPULAR SEARCHES</h3>
                <ul className="space-y-2">
                  {popularSearches.map((search, index) => (
                    <li key={index}>
                      <a 
                        href="#" 
                        className="text-[#84756f] hover:text-[#5a4c46] text-sm block py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchTerm(search);
                          setShowResults(true);
                        }}
                      >
                        {search}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent searches */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">RECENT SEARCHES</h3>
                <ul className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <li key={index}>
                      <a 
                        href="#" 
                        className="text-[#84756f] hover:text-[#5a4c46] text-sm block py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchTerm(search);
                          setShowResults(true);
                        }}
                      >
                        {search}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseDropdown>
  );
};

export default SearchDropdown;
