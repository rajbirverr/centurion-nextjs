"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

// Define account navigation links
const accountLinks = [
  { name: "ACCOUNT OVERVIEW", path: "/account" },
  { name: "ORDER HISTORY", path: "/account?tab=orders" },
  { name: "ADDRESS BOOK", path: "/account?tab=addresses" },
  { name: "WISHLIST", path: "/account?tab=wishlist" }
];

interface AccountDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // For demo purposes, toggle login state
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          {isLoggedIn ? (
            /* Logged in view */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account greeting */}
              <div className="md:border-r border-[#e5e2e0] md:pr-8">
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-[#5a4c46] text-xl font-light mb-2">Welcome back</h2>
                  <p className="text-[#84756f] text-sm">
                    Manage your account preferences and view your order history.
                  </p>
                </div>
                
                {/* Quick links */}
                <ul className="space-y-4">
                  {accountLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.path} 
                        className="text-[#5a4c46] hover:text-[#91594c] text-sm uppercase tracking-wider block py-1"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Sign out button */}
                <button 
                  className="mt-8 border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-6 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200 w-full md:w-auto"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
              
              {/* Recent order */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-sm tracking-wider mb-4 font-medium">RECENT ORDER</h3>
                <div className="bg-[#f3f0ef] p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[#5a4c46] text-xs">Order #CR29845</span>
                    <span className="text-[#5a4c46] text-xs">May 12, 2023</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="bg-white w-20 h-20 flex items-center justify-center">
                      <img 
                        src="https://www.rhodeskin.com/cdn/shop/files/mainimage-SQ-piggy_1024x1024.png?v=1717624055" 
                        alt="Pocket Blush" 
                        className="h-full w-full object-contain" 
                      />
                    </div>
                    <div>
                      <h4 className="text-[#5a4c46] text-sm font-medium">POCKET BLUSH</h4>
                      <p className="text-[#84756f] text-xs mt-1">₹1,200</p>
                      <p className="text-[#91594c] text-xs mt-2">Shipped • May 14, 2023</p>
                    </div>
                  </div>
                  <a href="#" className="text-[#5a4c46] text-xs uppercase tracking-wider mt-4 inline-block hover:text-[#91594c]">
                    View Order Details
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Not logged in view */
            <div>
              {/* Tabs for login/register */}
              <div className="flex justify-center mb-6 border-b border-[#e5e2e0]">
                <button 
                  className={`px-6 py-2 text-sm uppercase tracking-[0.1em] ${activeTab === 'login' ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </button>
                <button 
                  className={`px-6 py-2 text-sm uppercase tracking-[0.1em] ${activeTab === 'register' ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]' : 'text-[#84756f]'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Create Account
                </button>
              </div>
              
              {activeTab === 'login' ? (
                /* Login form */
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input 
                        type="password" 
                        id="password" 
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded" 
                        />
                        <label htmlFor="remember" className="text-[#84756f] text-xs">
                          Remember me
                        </label>
                      </div>
                      <a href="#" className="text-[#5a4c46] text-xs hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-[#5a4c46] text-white hover:bg-[#4a3c36] px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
                    >
                      Sign In
                    </button>
                  </form>
                </div>
              ) : (
                /* Registration form */
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleLogin}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          id="firstName" 
                          className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          id="lastName" 
                          className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="registerEmail" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="registerEmail" 
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="registerPassword" className="block text-[#5a4c46] text-xs uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <input 
                        type="password" 
                        id="registerPassword" 
                        className="w-full bg-[#f3f0ef] border-none px-4 py-2 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="newsletter" 
                          className="mr-2 h-4 w-4 text-[#5a4c46] focus:ring-[#5a4c46] rounded" 
                        />
                        <label htmlFor="newsletter" className="text-[#84756f] text-xs">
                          Subscribe to our newsletter
                        </label>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-[#5a4c46] text-white hover:bg-[#4a3c36] px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
                    >
                      Create Account
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseDropdown>
  );
};

export default AccountDropdown;
