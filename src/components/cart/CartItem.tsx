"use client"

import React from 'react';
import { CartItem as CartItemType, useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  
  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1, item.color);
  };
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1, item.color);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id, item.color);
  };
  
  return (
    <div className="py-5 border-b border-[#eeeeee] last:border-none">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Product Image */}
        <div className="w-full md:w-1/5 flex-shrink-0">
          <div className="h-36 md:h-28 flex items-center justify-center bg-[#f9f9f9]">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-auto max-h-full object-contain"
            />
          </div>
        </div>
        
        {/* Product Info */}
        <div className="w-full md:w-4/5 flex flex-col md:flex-row">
          <div className="flex-grow">
            {/* Name displayed twice for emphasis */}
            <div className="uppercase text-[#5a4c46] tracking-wide font-light text-sm mb-1">{item.name}</div>
            <div className="uppercase text-[#784D2C] tracking-wide font-normal text-sm mb-3">{item.name}</div>
            
            {/* Price - show total (price * quantity) */}
            <div className="text-[#5a4c46] mb-3">₹{(item.price * item.quantity).toLocaleString()}</div>
            
            {/* Color */}
            <div className="text-[#5a4c46]/80 text-xs mb-4">Color: {item.color}</div>
          </div>
          
          {/* Quantity Controls */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:min-w-[140px]">
            <div className="flex items-center">
              <button 
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center text-[#5a4c46] border border-[#eeeeee] hover:border-[#5a4c46] transition-colors"
              >
                -
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-[#5a4c46]">
                {item.quantity}
              </span>
              <button 
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center text-[#5a4c46] border border-[#eeeeee] hover:border-[#5a4c46] transition-colors"
              >
                +
              </button>
            </div>
            
            {/* Remove Button */}
            <button 
              onClick={handleRemove}
              className="text-[#5a4c46]/70 text-xs underline hover:text-[#784D2C] transition-colors mt-2"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;


