"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShopDropdown, 
  AboutDropdown, 
  FuturesDropdown,
  SearchDropdown,
  AccountDropdown,
  CartDropdown
} from './dropdowns';
import { getCategoriesWithSubcategories, CategoryWithSubcategories } from '@/lib/actions/categories';
import { useCart } from '@/context/CartContext';

// Define the dropdowns we have
type DropdownType = 'shop' | 'about' | 'futures' | 'search' | 'account' | 'cart' | null;

interface NavBarProps {
  onNavigate?: (page: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [navHeight, setNavHeight] = useState(0);
  const { items: cartItems, isLoggedIn } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  
  // The isHovering state is causing issues with proper closing
  // Let's use refs to track hover state on individual elements instead
  const navItemHoverRef = useRef(false);
  const dropdownHoverRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const openTimeoutRef = useRef<number | null>(null);

  const navBarRef = useRef<HTMLDivElement>(null);
  
  // Measure navbar height for dropdown positioning
  useEffect(() => {
    const handleResize = () => {
      if (navBarRef.current) {
        setNavHeight(navBarRef.current.offsetHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide dropdown when scrolling if not hovering on either trigger or dropdown
      if (activeDropdown && !navItemHoverRef.current && !dropdownHoverRef.current) {
        setActiveDropdown(null);
      }

      // Update sticky state
      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setIsSticky(true);
      } else if (currentScrollY <= 100) {
        setIsSticky(false);
      } else if (currentScrollY > lastScrollY) {
        setIsSticky(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, activeDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Only close if we're not hovering on either the dropdown or its trigger
      if (activeDropdown && 
          !navItemHoverRef.current && 
          !dropdownHoverRef.current &&
          navBarRef.current && 
          !navBarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      // Close any open dropdowns when opening mobile menu
      setActiveDropdown(null);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  // Fetch categories with subcategories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoriesWithSubcategories();
        setCategories(data);
        if (data.length > 0) {
          setActiveMobileCategory(data[0].slug);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  const toggleDropdown = (dropdown: DropdownType) => {
    // Clear any pending timeouts
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (openTimeoutRef.current) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handlers for mouse events
  const handleNavItemMouseEnter = (dropdown: DropdownType) => {
    // Clear any close timeout to prevent dropdown from closing
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Mark that we're hovering on a nav item
    navItemHoverRef.current = true;
    
    // Set a small delay to open dropdown (prevents accidental opening)
    if (openTimeoutRef.current) {
      window.clearTimeout(openTimeoutRef.current);
    }
    
    openTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(dropdown);
    }, 100);
  };

  const handleNavItemMouseLeave = () => {
    // Set navItemHover to false and start a timer to close
    navItemHoverRef.current = false;
    
    // Don't close immediately - give user time to move to dropdown
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    
    closeTimeoutRef.current = window.setTimeout(() => {
      // Only close if we're not hovering on either the nav item or dropdown
      if (!navItemHoverRef.current && !dropdownHoverRef.current) {
        setActiveDropdown(null);
      }
    }, 150);
  };

  const handleDropdownMouseEnter = (dropdown: DropdownType) => {
    // Clear any close timeout to prevent dropdown from closing
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Mark that we're hovering on the dropdown
    dropdownHoverRef.current = true;
    setActiveDropdown(dropdown);
  };

  const handleDropdownMouseLeave = () => {
    // Set dropdownHover to false and start a timer to close
    dropdownHoverRef.current = false;
    
    // Don't close immediately - give user time to move to nav item
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    
    closeTimeoutRef.current = window.setTimeout(() => {
      // Only close if we're not hovering on either the nav item or dropdown
      if (!navItemHoverRef.current && !dropdownHoverRef.current) {
        setActiveDropdown(null);
      }
    }, 150);
  };

  // Handle keyboard escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (activeDropdown || showMobileMenu)) {
        e.preventDefault();
        if (showMobileMenu) {
          setShowMobileMenu(false);
        } else {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDropdown, showMobileMenu]);

  // Handle focus trap for dropdown
  useEffect(() => {
    if (!activeDropdown) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && activeDropdown) {
        // Find all focusable elements in the dropdown
        const dropdownContainer = document.querySelector(`[data-dropdown="${activeDropdown}"]`);
        if (!dropdownContainer) return;

        const focusableElements = dropdownContainer.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        // If shift+tab is pressed and focus is on first element, move to last element
        if (e.shiftKey && document.activeElement === focusableElements[0]) {
          e.preventDefault();
          (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        } 
        // If tab is pressed and focus is on last element, move to first element
        else if (!e.shiftKey && document.activeElement === focusableElements[focusableElements.length - 1]) {
          e.preventDefault();
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [activeDropdown]);

  // Handle cart icon click with navigation
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('cart');
    } else {
      toggleDropdown('cart');
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#f3f0ef] py-2 text-center text-xs text-[#5a4c46]">
        <p>free shipping on orders over ₹1000</p>
      </div>

      <nav 
        className={`w-full bg-white border-b border-gray-100 py-4 shadow-sm ${activeDropdown ? 'z-50' : 'z-30'} relative ${isSticky ? 'fixed top-0 left-0 right-0 animate-slideDown' : ''}`} 
        ref={navBarRef}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-1">
            {/* Left menu items */}
            <div className="hidden md:flex items-center space-x-10">
              {/* Shop dropdown */}
              <div className="relative">
                <button
                  className={`text-[#5a4c46] hover:text-[#91594c] tracking-[0.2em] text-xs font-light uppercase focus:outline-none ${activeDropdown === 'shop' ? 'text-[#91594c]' : ''}`}
                  onClick={() => toggleDropdown('shop')}
                  onMouseEnter={() => handleNavItemMouseEnter('shop')}
                  onMouseLeave={handleNavItemMouseLeave}
                  aria-expanded="false"
                  aria-controls="shop-dropdown"
                >
                  Shop
                </button>
              </div>

              {/* About dropdown */}
              <div className="relative">
                <button
                  className={`text-[#5a4c46] hover:text-[#91594c] tracking-[0.2em] text-xs font-light uppercase focus:outline-none ${activeDropdown === 'about' ? 'text-[#91594c]' : ''}`}
                  onClick={() => toggleDropdown('about')}
                  onMouseEnter={() => handleNavItemMouseEnter('about')}
                  onMouseLeave={handleNavItemMouseLeave}
                  aria-expanded="false"
                  aria-controls="about-dropdown"
                >
                  About
                </button>
              </div>

              {/* Futures dropdown */}
              <div className="relative">
                <button
                  className={`text-[#5a4c46] hover:text-[#91594c] tracking-[0.2em] text-xs font-light uppercase focus:outline-none ${activeDropdown === 'futures' ? 'text-[#91594c]' : ''}`}
                  onClick={() => toggleDropdown('futures')}
                  onMouseEnter={() => handleNavItemMouseEnter('futures')}
                  onMouseLeave={handleNavItemMouseLeave}
                  aria-expanded="false"
                  aria-controls="futures-dropdown"
                >
                  Futures
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                className="text-[#5a4c46] focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded="false"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center logo */}
            <div className="flex-shrink-0 flex items-center mx-auto md:mx-0">
              <Link href="/" className="font-normal text-[#784D2C] text-3xl" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>
                centurion
              </Link>
            </div>

            {/* Right menu items */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Search button */}
              <div className="relative">
                <button
                  className={`text-[#5a4c46] hover:text-[#91594c] tracking-[0.2em] text-xs font-light uppercase focus:outline-none ${activeDropdown === 'search' ? 'text-[#91594c]' : ''}`}
                  onClick={() => toggleDropdown('search')}
                  onMouseEnter={() => handleNavItemMouseEnter('search')}
                  onMouseLeave={handleNavItemMouseLeave}
                  aria-expanded="false"
                  aria-controls="search-dropdown"
                >
                  Search
                </button>
              </div>
              
              {/* Account button */}
              <div className="relative">
                <button
                  className={`text-[#5a4c46] hover:text-[#91594c] tracking-[0.2em] text-xs font-light uppercase focus:outline-none ${activeDropdown === 'account' ? 'text-[#91594c]' : ''}`}
                  onClick={() => toggleDropdown('account')}
                  onMouseEnter={() => handleNavItemMouseEnter('account')}
                  onMouseLeave={handleNavItemMouseLeave}
                  aria-expanded="false"
                  aria-controls="account-dropdown"
                >
                  Account
                </button>
              </div>
              
              {/* Cart */}
              <div 
                onMouseEnter={() => handleNavItemMouseEnter('cart')}
                onMouseLeave={handleNavItemMouseLeave}
                className="relative"
              >
                <Link
                  href="/cart"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent transition-all"
                  aria-label="Cart"
                  onClick={handleCartClick}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="#5a4c46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="#5a4c46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 2H5L7.31 14.39C7.37481 14.8504 7.6197 15.264 7.98767 15.5583C8.35565 15.8526 8.82491 16.009 9.3 16H18.7C19.1751 16.009 19.6444 15.8526 20.0123 15.5583C20.3803 15.264 20.6252 14.8504 20.69 14.39L22 7H6" stroke="#5a4c46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    
                    {cartItemCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-[#784D2C] text-white text-xs font-medium">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>

            {/* Mobile right icons */}
            <div className="md:hidden flex items-center space-x-5">
              <button 
                className="text-[#5a4c46] focus:outline-none" 
                aria-label="Search"
                onClick={() => {
                  setShowMobileMenu(false); // Close mobile menu if open
                  toggleDropdown('search');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                className="text-[#5a4c46] focus:outline-none relative" 
                aria-label="Cart"
                onClick={() => {
                  setShowMobileMenu(false); // Close mobile menu if open
                  toggleDropdown('cart');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#5a4c46] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Shop Dropdown */}
      <div id="shop-dropdown" data-dropdown="shop">
        <ShopDropdown
          isOpen={activeDropdown === 'shop'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('shop')}
          onMouseLeave={handleDropdownMouseLeave}
          categories={categories}
        />
      </div>

      {/* About Dropdown */}
      <div id="about-dropdown" data-dropdown="about">
        <AboutDropdown
          isOpen={activeDropdown === 'about'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('about')}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </div>

      {/* Futures Dropdown */}
      <div id="futures-dropdown" data-dropdown="futures">
        <FuturesDropdown
          isOpen={activeDropdown === 'futures'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('futures')}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </div>
      
      {/* Search Dropdown */}
      <div id="search-dropdown" data-dropdown="search">
        <SearchDropdown
          isOpen={activeDropdown === 'search'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('search')}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </div>
      
      {/* Account Dropdown */}
      <div id="account-dropdown" data-dropdown="account">
        <AccountDropdown
          isOpen={activeDropdown === 'account'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('account')}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </div>
      
      {/* Cart Dropdown */}
      <div id="cart-dropdown" data-dropdown="cart">
        <CartDropdown
          isOpen={activeDropdown === 'cart'}
          navHeight={navHeight}
          onMouseEnter={() => handleDropdownMouseEnter('cart')}
          onMouseLeave={handleDropdownMouseLeave}
        />
      </div>

      {/* Overlay when dropdown is open on mobile */}
      {activeDropdown && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setActiveDropdown(null)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-[#f3f0ef] z-50 overflow-y-auto">
          <div className="px-4 py-4">
            {/* Mobile menu header */}
            <div className="flex justify-between items-center py-2 border-b border-gray-300">
              <div className="w-5"></div>
              <Link href="/" className="font-normal text-[#5a4c46] text-2xl" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>
                centurion
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="text-[#5a4c46] focus:outline-none"
                aria-label="Close mobile menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search input */}
            <div className="relative mt-5 mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Categories Section - Rhode Style */}
            {categories.length > 0 && (
              <div className="mt-4 bg-white border-b border-gray-300">
                {/* Category Tabs - Horizontal Scrollable */}
                <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide pb-3 border-b border-gray-200">
                  <div className="flex space-x-5 min-w-max">
                    {categories.map((category, index) => {
                      const isActive = activeMobileCategory === category.slug || (activeMobileCategory === null && index === 0);
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setActiveMobileCategory(isActive ? null : category.slug);
                          }}
                          className={`uppercase text-xs tracking-[0.1em] font-medium whitespace-nowrap pb-2 transition-colors ${
                            isActive
                              ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' 
                              : 'border-b-2 border-transparent text-[#84756f]'
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategories List - Rhode Style Horizontal Row */}
                {(() => {
                  const activeCategory = activeMobileCategory !== null 
                    ? categories.find(c => c.slug === activeMobileCategory)
                    : categories[0];
                  const subcategories = activeCategory?.subcategories || [];
                  
                  if (subcategories.length > 0) {
                    return (
                      <div className="px-4 py-4">
                        <div className="flex flex-col gap-3">
                          {subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={`/all-products?category=${activeCategory?.slug}&subcategory=${subcategory.slug}`}
                              onClick={() => setShowMobileMenu(false)}
                              className="group flex items-center space-x-3"
                            >
                              <div className="relative flex-shrink-0 w-20 h-20 bg-[#f3f0ef] flex items-center justify-center overflow-hidden">
                                {subcategory.image_url ? (
                                  <img
                                    src={subcategory.image_url}
                                    alt={subcategory.name}
                                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      className="w-10 h-10 text-[#84756f]"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-[#5a4c46] uppercase tracking-wider text-xs font-medium mb-0.5">
                                  {subcategory.name}
                                </h3>
                                {subcategory.description && (
                                  <p className="text-[#84756f] text-xs leading-relaxed">
                                    {subcategory.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        {/* Shop Button - Centered at bottom */}
                        <div className="flex justify-center pt-6 mt-2">
                          <Link
                            href={`/all-products?category=${activeCategory?.slug}`}
                            onClick={() => setShowMobileMenu(false)}
                            className="border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-10 py-2.5 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
                          >
                            Shop {activeCategory?.name.toUpperCase()}
                          </Link>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Navigation links */}
            <div className="mt-4 border-t border-gray-300 pt-4">
              <Link href="/all-products" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                SHOP
              </Link>
              <Link href="#" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                ABOUT
              </Link>
              <Link href="#" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                CENTURION FUTURES
              </Link>
              <Link href="#" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                IMPACT
              </Link>
              <Link href="#" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                FAQ
              </Link>
              <Link href="/account" className="block py-3 text-[#5a4c46] uppercase text-sm tracking-wider border-b border-gray-300">
                ACCOUNT
              </Link>
            </div>

            {/* Country selector */}
            <div className="mt-8">
              <div className="flex items-center text-[#5a4c46] text-sm">
                <span className="mr-3">Country/region:</span>
                <select className="bg-transparent border border-gray-300 py-1 px-2 text-sm" aria-label="Select country or region">
                  <option>United States (USD $)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
