"use client"

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const OrderSummary: React.FC = () => {
  const { 
    subtotal, 
    shippingMethod, 
    setShippingMethod, 
    shippingCost, 
    total 
  } = useCart();

  return (
    <div className="bg-[#f9f9f9] p-6 rounded-lg">
      <h3 className="uppercase text-[#5a4c46] tracking-wide font-medium text-sm mb-5">Order Summary</h3>
      
      {/* Subtotal */}
      <div className="flex justify-between py-2 border-b border-[#eeeeee]">
        <span className="text-[#5a4c46] text-sm">Subtotal</span>
        <span className="text-[#5a4c46] font-medium">₹{subtotal.toLocaleString()}</span>
      </div>
      
      {/* Shipping Options */}
      <div className="py-4 border-b border-[#eeeeee]">
        <div className="text-[#5a4c46] text-sm mb-3">Shipping</div>
        
        {/* Standard Shipping Option */}
        <div className="flex items-start mb-3">
          <input 
            type="radio" 
            id="standard-shipping"
            checked={shippingMethod === 'standard'}
            onChange={() => setShippingMethod('standard')}
            className="mt-1 mr-3"
          />
          <label htmlFor="standard-shipping" className="flex-grow">
            <div className="text-[#5a4c46] text-sm font-medium">Standard Shipping</div>
            <div className="text-[#5a4c46]/70 text-xs mt-1">3-5 business days</div>
            <div className="text-[#5a4c46] text-sm mt-1">₹120</div>
          </label>
        </div>
        
        {/* Express Shipping Option */}
        <div className="flex items-start">
          <input 
            type="radio" 
            id="express-shipping"
            checked={shippingMethod === 'express'}
            onChange={() => setShippingMethod('express')}
            className="mt-1 mr-3"
          />
          <label htmlFor="express-shipping" className="flex-grow">
            <div className="text-[#5a4c46] text-sm font-medium">Express Shipping</div>
            <div className="text-[#5a4c46]/70 text-xs mt-1">1-2 business days</div>
            <div className="text-[#5a4c46] text-sm mt-1">₹350</div>
          </label>
        </div>
      </div>
      
      {/* Total */}
      <div className="flex justify-between py-4 mb-6">
        <span className="text-[#5a4c46] font-medium">Total</span>
        <span className="text-[#784D2C] font-medium text-lg">₹{total.toLocaleString()}</span>
      </div>
      
      {/* Checkout Button */}
      <Link 
        href="/checkout" 
        className="block w-full bg-[#784D2C] text-white py-3 px-5 uppercase text-xs tracking-widest font-light hover:bg-[#5a4c46] transition-colors mb-3 text-center"
      >
        Checkout
      </Link>
      
      {/* Continue Shopping Button */}
      <Link 
        href="/all-products"
        className="block w-full bg-transparent border border-[#5a4c46] text-[#5a4c46] py-3 px-5 uppercase text-xs tracking-widest font-light hover:bg-[#f5f5f5] transition-colors text-center"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSummary;


