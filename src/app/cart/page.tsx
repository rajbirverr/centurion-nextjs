"use client"

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CartItem, OrderSummary } from '@/components/cart';

export default function CartPage() {
  const { items } = useCart();
  
  // Check if cart is empty
  const isCartEmpty = items.length === 0;
  
  return (
    <div className="min-h-[calc(100vh-220px)] bg-white">
      <div className="max-w-[1440px] mx-auto px-4 py-12 md:px-8 lg:px-12">
        {/* Page Title */}
        <h1 className="uppercase text-[#784D2C] text-2xl font-light tracking-wide text-center mb-10">Your Shopping Bag</h1>
        
        {isCartEmpty ? (
          // Empty Cart Message
          <div className="text-center py-12">
            <p className="text-[#5a4c46] mb-6">Your shopping bag is empty.</p>
            <Link 
              href="/all-products"
              className="bg-transparent border border-[#5a4c46] text-[#5a4c46] py-3 px-5 uppercase text-xs tracking-widest font-light hover:bg-[#f5f5f5] transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart Content
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              {items.map(item => (
                <CartItem key={`${item.id}-${item.color}`} item={item} />
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
