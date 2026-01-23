"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useCart, CartItem as ExistingCartItem } from './CartContext';
import { createOrder } from '@/lib/actions/orders';

// Types
export type CartItem = ExistingCartItem;

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express';
}

export interface BillingInfo {
  sameAsShipping: boolean;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type PaymentMethod = 'creditCard' | 'upi' | 'paypal';

export interface PaymentInfo {
  method: PaymentMethod;
  // Credit Card fields
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  // UPI
  upiId?: string;
  // PayPal
  paypalEmail?: string;
}

export type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutContextType {
  // Cart data from existing cart context
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;

  // Step state
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Order info
  orderNumber: string;

  // Shipping
  shippingInfo: ShippingInfo;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;

  // Billing
  billingInfo: BillingInfo;
  updateBillingInfo: (info: Partial<BillingInfo>) => void;

  // Payment
  paymentInfo: PaymentInfo;
  updatePaymentInfo: (info: Partial<PaymentInfo>) => void;

  // Actions
  placeOrder: () => Promise<boolean>;
  isProcessing: boolean;

  // Real-time Shipping State
  isCheckingShipping: boolean;
  shippingError: string | null;
  availableShippingMethods: any[];
}

const defaultShippingInfo: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  shippingMethod: 'standard',
};

const defaultBillingInfo: BillingInfo = {
  sameAsShipping: true,
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
};

const defaultPaymentInfo: PaymentInfo = {
  method: 'creditCard',
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: '',
  upiId: '',
  paypalEmail: '',
};

// Create context
const CheckoutContext = createContext<CheckoutContextType>({} as CheckoutContextType);

// Provider component
export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  try {
    // Use the existing cart context
    const { items, subtotal, shippingCost: cartShippingCost } = useCart();

    // Step state
    const [currentStep, setCurrentStep] = useState(1);

    // Order info
    const [orderNumber, setOrderNumber] = useState('');

    // User info state
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(defaultShippingInfo);
    const [billingInfo, setBillingInfo] = useState<BillingInfo>(defaultBillingInfo);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(defaultPaymentInfo);

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate tax - assuming 18% GST
    const tax = subtotal * 0.18;

    // If shipping method changes in checkout, we need to track it here
    const [localShippingCost, setLocalShippingCost] = useState(cartShippingCost);
    const [availableShippingMethods, setAvailableShippingMethods] = useState<any[]>([]);
    const [isCheckingShipping, setIsCheckingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    // Calculate shipping when Pincode changes
    useEffect(() => {
      const checkShipping = async () => {
        const pincode = shippingInfo.zipCode;

        // Only check if we have a valid 6-digit pincode
        if (pincode && /^\d{6}$/.test(pincode)) {
          setIsCheckingShipping(true);
          setShippingError(null);

          try {
            // Import dynamically to avoid server-action-in-client-context issues if any (though usually fine)
            // But better to import at top. We will fix import in a moment.
            // For now assume calculateShipping is imported.
            const { calculateShipping } = await import('@/lib/actions/shipping');
            const rates = await calculateShipping(pincode);

            if (rates && rates.length > 0) {
              setAvailableShippingMethods(rates);

              // Auto-select the first valid method if current method is invalid or not in list
              const currentMethodValid = rates.find(r => r.method === shippingInfo.shippingMethod);
              if (currentMethodValid) {
                setLocalShippingCost(currentMethodValid.cost);
              } else {
                // Default to first available
                updateShippingInfo({ shippingMethod: rates[0].method });
                setLocalShippingCost(rates[0].cost);
              }
            } else {
              setShippingError('Shipping not available for this pincode.');
              setAvailableShippingMethods([]);
              setLocalShippingCost(0);
            }
          } catch (err) {
            console.error('Failed to calculate shipping:', err);
            setShippingError('Unable to calculate shipping rates.');
          } finally {
            setIsCheckingShipping(false);
          }
        }
      };

      const debounceTimer = setTimeout(() => {
        checkShipping();
      }, 500); // Debounce to avoid too many calls

      return () => clearTimeout(debounceTimer);
    }, [shippingInfo.zipCode]); // Only re-run when zipCode changes

    // Update cost when method changes (from the available list)
    useEffect(() => {
      if (availableShippingMethods.length > 0) {
        const selected = availableShippingMethods.find(m => m.method === shippingInfo.shippingMethod);
        if (selected) {
          setLocalShippingCost(selected.cost);
        }
      } else {
        // Fallback for initial load or static default
        const shipping = shippingInfo.shippingMethod === 'express' ? 250 : 100;
        setLocalShippingCost(shipping);
      }
    }, [shippingInfo.shippingMethod, availableShippingMethods]);

    // Calculate total with local shipping cost
    const total = subtotal + tax + localShippingCost;

    // Update shipping info
    const updateShippingInfo = (info: Partial<ShippingInfo>) => {
      setShippingInfo(prev => ({
        ...prev,
        ...info
      }));

      // If billing is same as shipping, update billing too
      if (billingInfo.sameAsShipping) {
        const relevantFields: (keyof ShippingInfo)[] = [
          'firstName', 'lastName', 'address', 'apartment', 'city', 'state', 'zipCode', 'country'
        ];

        const billingUpdates: Partial<BillingInfo> = {};

        relevantFields.forEach(field => {
          if (field in info) {
            (billingUpdates as Record<string, unknown>)[field] = info[field as keyof typeof info];
          }
        });

        if (Object.keys(billingUpdates).length > 0) {
          setBillingInfo(prev => ({
            ...prev,
            ...billingUpdates
          }));
        }
      }
    };

    // Update billing info
    const updateBillingInfo = (info: Partial<BillingInfo>) => {
      setBillingInfo(prev => ({
        ...prev,
        ...info
      }));

      // If toggling sameAsShipping to true, sync with shipping info
      if (info.sameAsShipping === true) {
        const { firstName, lastName, address, apartment, city, state, zipCode, country } = shippingInfo;
        setBillingInfo(prev => ({
          ...prev,
          firstName,
          lastName,
          address,
          apartment,
          city,
          state,
          zipCode,
          country,
          sameAsShipping: true
        }));
      }
    };

    // Update payment info
    const updatePaymentInfo = (info: Partial<PaymentInfo>) => {
      setPaymentInfo(prev => ({
        ...prev,
        ...info
      }));
    };

    // Place order
    const placeOrder = async (): Promise<boolean> => {
      setIsProcessing(true);

      try {
        // Prepare shipping address
        const shippingAddress = {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          apartment: shippingInfo.apartment,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        };

        // Prepare billing address
        const billingAddress = billingInfo.sameAsShipping ? shippingAddress : {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          address: billingInfo.address,
          apartment: billingInfo.apartment,
          city: billingInfo.city,
          state: billingInfo.state,
          zipCode: billingInfo.zipCode,
          country: billingInfo.country,
        };

        // Prepare order items
        // Note: CartItem.id is a number, but product_id in DB is UUID
        // We'll store it as string for now, or null if not available
        const orderItems = items.map(item => ({
          product_id: item.id ? String(item.id) : null,
          product_name: item.name || 'Unknown Product',
          product_sku: (item as any).sku || undefined,
          quantity: item.quantity,
          price: item.price || 0,
        }));

        // Get payment method name
        const paymentMethodNames: Record<PaymentMethod, string> = {
          creditCard: 'Credit Card',
          upi: 'UPI',
          paypal: 'PayPal',
        };

        // Create order in database
        const result = await createOrder({
          customer_email: shippingInfo.email,
          customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          customer_phone: shippingInfo.phone,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          subtotal: subtotal,
          shipping_cost: localShippingCost,
          tax: tax,
          total: total,
          payment_method: paymentMethodNames[paymentInfo.method],
          items: orderItems,
        });

        if (!result.success) {
          console.error('Error creating order:', result.error);
          setIsProcessing(false);
          return false;
        }

        // Set order number (use order ID or generate a short version)
        const orderNum = result.orderId ? result.orderId.slice(0, 8).toUpperCase() : `SKM${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderNumber(orderNum);

        // Move to confirmation step
        setCurrentStep(3);
        setIsProcessing(false);
        return true;
      } catch (error) {
        console.error('Error placing order:', error);
        setIsProcessing(false);
        return false;
      }
    };

    const value = {
      items,
      subtotal,
      shippingCost: localShippingCost,
      tax,
      total,
      currentStep,
      setCurrentStep,
      orderNumber,
      shippingInfo,
      updateShippingInfo,
      billingInfo,
      updateBillingInfo,
      paymentInfo,
      updatePaymentInfo,
      placeOrder,
      isProcessing,
      isCheckingShipping,
      shippingError,
      availableShippingMethods
    };

    return (
      <CheckoutContext.Provider value={value}>
        {children}
      </CheckoutContext.Provider>
    );
  } catch (error) {
    console.error("Error in CheckoutProvider:", error);
    // Fallback UI in case of error
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>There was an error loading the checkout. Please refresh or try again later.</p>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }
};

// Custom hook to use the checkout context
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};


