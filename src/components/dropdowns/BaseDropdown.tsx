"use client"

import React, { useRef, useEffect } from 'react';

interface BaseDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

const BaseDropdown: React.FC<BaseDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave,
  children
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set dropdown position based on navbar height
    if (dropdownRef.current) {
      dropdownRef.current.style.top = `${navHeight}px`;
    }
  }, [navHeight]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed left-0 right-0 bg-[#f3f0ef] w-full shadow-md z-40"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseDropdown;
