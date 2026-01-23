"use client"

import React, { useState, useEffect, useRef } from 'react';

// Import sort options from FilterBar to maintain consistency
import { SORT_OPTIONS } from './FilterBar';

interface SortButtonProps {
  currentSort: string;
  onSortChange: (sortOption: string) => void;
}

const SortButton: React.FC<SortButtonProps> = ({ currentSort, onSortChange }) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortButtonRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    if (!showSortDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sortButtonRef.current &&
        !sortButtonRef.current.contains(target)
      ) {
        setShowSortDropdown(false);
      }
    };

    // Use a slight delay to avoid closing immediately when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showSortDropdown]);

  const toggleSortDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortDropdown(prev => !prev);
  };

  const handleSortChange = (sortOption: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSortChange(sortOption);
    setShowSortDropdown(false);
  };

  // Sort options array - ensure no duplicates
  const sortOptions = React.useMemo(() => {
    const options = [
      SORT_OPTIONS.FEATURED,
      SORT_OPTIONS.PRICE_LOW_TO_HIGH,
      SORT_OPTIONS.PRICE_HIGH_TO_LOW,
      SORT_OPTIONS.NEWEST,
    ];
    // Remove any duplicates
    return [...new Set(options)];
  }, []);

  return (
    <div className="relative inline-block" ref={sortButtonRef} style={{ overflow: 'visible' }}>
      <button
        onClick={toggleSortDropdown}
        className="white-glass-button flex items-center text-sm font-light px-4 py-2 rounded-full"
        aria-expanded={showSortDropdown}
        aria-haspopup="true"
      >
        <span className="mr-1">Sort: {currentSort}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`ml-1 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M1 1L5 5L9 1" stroke="#403b38" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Sort dropdown menu */}
      {showSortDropdown && (
        <div
          className="white-glass-button absolute right-0 top-full mt-2 rounded-2xl p-2 w-52 z-[100] shadow-lg"
          role="menu"
          aria-orientation="vertical"
          style={{ 
            position: 'absolute', 
            overflow: 'visible',
            background: 'rgba(245, 245, 245, 0.3)',
            backdropFilter: 'blur(0px) saturate(120%)',
            WebkitBackdropFilter: 'blur(0px) saturate(120%)'
          }}
        >
          {sortOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              className={`block w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                currentSort === option 
                  ? 'font-medium text-[#403b38] bg-[rgba(230,230,230,0.5)]' 
                  : 'font-light text-[#403b38] hover:bg-[rgba(230,230,230,0.9)]'
              } ${index !== sortOptions.length - 1 ? 'mb-1' : ''}`}
              onClick={(e) => handleSortChange(option, e)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButton;


