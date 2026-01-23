"use client"

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getCartItems, addCartItem, updateCartItem, removeCartItem, clearCart as clearCartDB, type CartItemDB } from '@/lib/actions/cart';

// Define types
export type CartItem = {
  id: string; // Product ID (UUID from products table) - used for matching duplicates
  dbId: string; // Database cart_items.id (UUID from cart_items table) - used for DB operations
  name: string;
  price: number;
  color: string; // Size or color variant
  quantity: number;
  image: string;
};

type ShippingMethod = 'standard' | 'express';

type CartContextType = {
  items: CartItem[];
  isLoggedIn: boolean;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number, color?: string) => void;
  updateQuantity: (id: string | number, quantity: number, color?: string) => void;
  clearCart: () => void;
  subtotal: number;
  shippingMethod: ShippingMethod;
  setShippingMethod: (method: ShippingMethod) => void;
  shippingCost: number;
  total: number;
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Shipping costs
const SHIPPING_COSTS = {
  standard: 120, // ₹120
  express: 350, // ₹350
};

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with empty cart - no pre-filled items
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const processingRef = useRef<Set<string>>(new Set()); // Track items being processed
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map()); // Track timeouts for cleanup

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get shipping cost based on selected method
  const shippingCost = SHIPPING_COSTS[shippingMethod];

  // Calculate total
  const total = subtotal + shippingCost;

  // Convert CartItemDB to CartItem format
  const convertCartItemDBToCartItem = useCallback((dbItem: CartItemDB): CartItem => ({
    id: dbItem.product_id || '', // Use product_id as the main identifier for matching duplicates (fallback to empty string if null)
    dbId: dbItem.id, // Use cart_items.id for database operations
    name: dbItem.product_name,
    price: Number(dbItem.product_price),
    color: dbItem.variant,
    quantity: dbItem.quantity,
    image: dbItem.product_image || '/placeholder-product.png'
  }), []);

  // Load cart from database
  const loadCartFromDB = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getCartItems();

      if (result.success && result.items) {
        const cartItems = result.items.map(convertCartItemDBToCartItem);
        setItems(cartItems);
      } else {
        // If error or not authenticated, clear cart
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from DB:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [convertCartItemDBToCartItem]);

  // Check authentication and load cart on mount
  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setIsLoggedIn(true);
          await loadCartFromDB();
        } else {
          setIsLoggedIn(false);
          setItems([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
        setItems([]);
        setIsLoading(false);
      }
    };

    checkAuthAndLoadCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[CartContext] Auth State Change: ${event}`, session?.user?.id);

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        setIsLoggedIn(true);
        // Only load if not already loaded or empty (to avoid redundant calls)
        if (items.length === 0) {
          await loadCartFromDB();
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setItems([]);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setIsLoggedIn(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCartFromDB]);

  // Add item to cart - memoized to prevent recreation
  const addItem = useCallback(async (newItem: CartItem) => {
    // Check if user is logged in - if not, return early (ProductDetailClient will show login modal)
    if (!isLoggedIn) {
      console.log('User not logged in - cannot add to cart');
      return;
    }

    try {
      // Validate input
      if (!newItem || !newItem.id || !newItem.name) {
        console.error('Invalid cart item:', newItem);
        return;
      }

      if (!newItem.price || newItem.price <= 0) {
        console.error('Invalid price for cart item:', newItem);
        return;
      }

      if (!newItem.quantity || newItem.quantity < 1) {
        console.error('Invalid quantity for cart item:', newItem);
        return;
      }

      // Ensure product_id is a string (UUID)
      const productId = String(newItem.id);

      // Create a unique key for this item (id + color)
      const itemKey = `${productId}-${newItem.color}`;

      // Prevent duplicate processing - CRITICAL: Check BEFORE marking
      if (processingRef.current.has(itemKey)) {
        console.warn('[CartContext] Item already being added, skipping duplicate call:', itemKey);
        return;
      }

      // Mark as processing IMMEDIATELY to prevent race conditions
      processingRef.current.add(itemKey);
      console.log('[CartContext] Starting to add item:', itemKey, 'Quantity:', newItem.quantity);

      // Save to database
      console.log('[CartContext] Calling addCartItem server action for:', itemKey);
      const result = await addCartItem({
        product_id: productId,
        product_name: newItem.name,
        product_price: newItem.price,
        variant: newItem.color,
        quantity: newItem.quantity,
        product_image: newItem.image
      });

      console.log('[CartContext] Server action result:', result.success, result.item ? `Item quantity: ${result.item.quantity}` : result.error);

      if (result.success && result.item) {
        // Convert DB item to CartItem and update local state
        const cartItem = convertCartItemDBToCartItem(result.item);

        setItems(prevItems => {
          // Remove any duplicates first (filter by product_id + variant)
          // Use product_id (not dbId) for matching - ensure both are strings for comparison
          const filteredItems = prevItems.filter(
            item => !(String(item.id) === String(productId) && item.color === newItem.color)
          );

          // Add/update the item
          return [...filteredItems, cartItem];
        });
      } else {
        console.error('Failed to add item to cart:', result.error);
      }

      // Clear processing flag after state update
      const timeoutId = setTimeout(() => {
        processingRef.current.delete(itemKey);
        timeoutRefs.current.delete(itemKey);
      }, 100);
      timeoutRefs.current.set(itemKey, timeoutId);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Clear processing flag on error
      const itemKey = `${newItem.id}-${newItem.color}`;
      processingRef.current.delete(itemKey);
    }
  }, [isLoggedIn, convertCartItemDBToCartItem]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current.clear();
      processingRef.current.clear();
    };
  }, []);

  // Remove item from cart - matches by product_id + color to handle variants correctly
  const removeItem = useCallback(async (id: string | number, color?: string) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('User not logged in - cannot remove from cart');
      return;
    }

    try {
      // Find the item to remove - id is product_id
      const itemToRemove = items.find(item =>
        color
          ? (item.id === String(id) && item.color === color)
          : (item.id === String(id))
      );

      if (!itemToRemove || !itemToRemove.dbId) {
        console.error('Item not found or missing dbId:', { id, color });
        return;
      }

      // Remove from database
      const result = await removeCartItem(itemToRemove.dbId);

      if (result.success) {
        // Update local state - id is product_id
        setItems(prevItems => {
          if (color) {
            // Remove specific variant (product_id + color)
            return prevItems.filter(item => !(String(item.id) === String(id) && item.color === color));
          } else {
            // Fallback: remove all variants with this product_id (for backward compatibility)
            return prevItems.filter(item => String(item.id) !== String(id));
          }
        });
      } else {
        console.error('Failed to remove item from cart:', result.error);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }, [isLoggedIn, items]);

  // Update item quantity - matches by id + color to handle variants correctly
  const updateQuantity = useCallback(async (id: string | number, quantity: number, color?: string) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('User not logged in - cannot update cart');
      return;
    }

    try {
      // Validate input
      if (!id) {
        console.error('Invalid id for updateQuantity:', id);
        return;
      }

      if (quantity < 1) {
        // If quantity is 0 or less, remove item instead
        await removeItem(id, color);
        return;
      }

      // Find the item to update - id is product_id
      const itemToUpdate = items.find(item =>
        color
          ? (String(item.id) === String(id) && item.color === color)
          : (String(item.id) === String(id))
      );

      if (!itemToUpdate || !itemToUpdate.dbId) {
        console.error('Item not found or missing dbId:', { id, color });
        return;
      }

      // Update in database
      const result = await updateCartItem(itemToUpdate.dbId, quantity);

      if (result.success) {
        // Update local state - id is product_id
        setItems(prevItems => {
          if (color) {
            // Update specific variant (product_id + color)
            return prevItems.map(item =>
              (String(item.id) === String(id) && item.color === color)
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            );
          } else {
            // Fallback: update first matching product_id (for backward compatibility)
            const itemIndex = prevItems.findIndex(item => String(item.id) === String(id));
            if (itemIndex >= 0) {
              const updatedItems = [...prevItems];
              updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                quantity: Math.max(1, quantity)
              };
              return updatedItems;
            }
            return prevItems;
          }
        });
      } else {
        console.error('Failed to update cart item:', result.error);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [isLoggedIn, items, removeItem]);

  // Clear cart
  const clearCart = useCallback(async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setItems([]);
      return;
    }

    try {
      // Clear from database
      const result = await clearCartDB();

      if (result.success) {
        // Clear local state
        setItems([]);
      } else {
        console.error('Failed to clear cart:', result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [isLoggedIn]);

  const value = {
    items,
    isLoggedIn,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingMethod,
    setShippingMethod,
    shippingCost,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // During SSR or before provider is ready, return default values
    // This prevents crashes during server-side rendering
    if (typeof window === 'undefined') {
      // Server-side: return safe defaults
      return {
        items: [],
        isLoggedIn: false,
        isLoading: true,
        addItem: async () => { },
        removeItem: () => { },
        updateQuantity: () => { },
        clearCart: () => { },
        subtotal: 0,
        shippingMethod: 'standard' as const,
        setShippingMethod: () => { },
        shippingCost: 0,
        total: 0
      };
    }
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


