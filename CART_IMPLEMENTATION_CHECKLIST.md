# Cart Implementation Checklist - Existing Code Review

## ✅ Existing Code (DO NOT DUPLICATE)

### 1. CartContext (`src/context/CartContext.tsx`)
- ✅ **EXISTS** - Local state management only
- ✅ Has: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
- ❌ **MISSING**: Auth check, Database sync
- **ACTION**: MODIFY existing file - ADD auth check & DB sync

### 2. ProductDetailClient (`src/components/product/ProductDetailClient.tsx`)
- ✅ **EXISTS** - Calls `addItem()` from CartContext
- ❌ **MISSING**: Auth check, Login modal, Success toast
- **ACTION**: MODIFY existing file - ADD auth check, modal, toast

### 3. Modal Component (`src/components/admin/ui/Modal.tsx`)
- ✅ **EXISTS** - Reusable modal component
- ✅ Has: `isOpen`, `onClose`, `title`, `children`, `size`
- **ACTION**: REUSE this modal (don't create new one)

### 4. NavBar (`src/components/NavBar.tsx`)
- ✅ **EXISTS** - Shows cart icon with count
- ✅ Uses: `useCart()` hook
- ❌ **MISSING**: Auth check for cart visibility
- **ACTION**: MODIFY existing file - ADD auth check

### 5. CartDropdown (`src/components/dropdowns/CartDropdown.tsx`)
- ✅ **EXISTS** - Shows cart items
- ✅ Uses: `useCart()` hook
- ❌ **MISSING**: Auth check, Login prompt
- **ACTION**: MODIFY existing file - ADD auth check & login prompt

### 6. AccountDropdown (`src/components/dropdowns/AccountDropdown.tsx`)
- ✅ **EXISTS** - Has auth check pattern
- ✅ Uses: `supabase.auth.getSession()`, `isLoggedIn` state
- **ACTION**: REUSE this pattern for cart auth check

### 7. Server Actions
- ❌ **NO cart.ts** in `src/lib/actions/`
- ✅ **EXISTS**: `auth.ts`, `orders.ts`, `profile.ts`, `addresses.ts`
- **ACTION**: CREATE new `cart.ts` file (follow existing pattern)

### 8. Database Schema
- ❌ **NO cart_items table** in Supabase
- ✅ **EXISTS**: `orders`, `order_items`, `customer_addresses`, `profiles`
- **ACTION**: CREATE new `supabase-cart-schema.sql` file

## 📋 Implementation Plan (No Duplication)

### Step 1: Database Schema (NEW)
- **CREATE**: `supabase-cart-schema.sql`
- Follow pattern from `supabase-orders-schema.sql`

### Step 2: Server Actions (NEW)
- **CREATE**: `src/lib/actions/cart.ts`
- Follow pattern from `src/lib/actions/orders.ts` or `src/lib/actions/addresses.ts`
- Functions: `getCartItems()`, `addCartItem()`, `updateCartItem()`, `removeCartItem()`, `clearCart()`

### Step 3: Modify CartContext (EXISTING - ENHANCE)
- **MODIFY**: `src/context/CartContext.tsx`
- **ADD**:
  - `isLoggedIn` state (use pattern from AccountDropdown)
  - `isLoading` state
  - Load cart from DB on mount (if logged in)
  - Sync all operations to DB
  - Listen to auth changes

### Step 4: Modify ProductDetailClient (EXISTING - ENHANCE)
- **MODIFY**: `src/components/product/ProductDetailClient.tsx`
- **REUSE**: Modal from `src/components/admin/ui/Modal.tsx`
- **ADD**:
  - Auth check (use pattern from AccountDropdown)
  - Login modal (using existing Modal component)
  - Success toast component (NEW, inline or separate)
  - Handle `action=add_to_cart` URL param after login

### Step 5: Modify NavBar (EXISTING - ENHANCE)
- **MODIFY**: `src/components/NavBar.tsx`
- **ADD**: Auth check (hide cart if not logged in, or show login prompt)

### Step 6: Modify CartDropdown (EXISTING - ENHANCE)
- **MODIFY**: `src/components/dropdowns/CartDropdown.tsx`
- **ADD**: Auth check (show login prompt if not logged in)

### Step 7: Update Login/Register Pages (EXISTING - ENHANCE)
- **MODIFY**: `src/app/login/page.tsx` - Handle `action=add_to_cart` param
- **MODIFY**: `src/app/account/register/page.tsx` - Handle `action=add_to_cart` param

## 🔍 Code Reuse Strategy

1. **Modal Component**: Reuse `src/components/admin/ui/Modal.tsx` (don't duplicate)
2. **Auth Check Pattern**: Reuse pattern from `AccountDropdown.tsx`
3. **Server Action Pattern**: Follow pattern from `orders.ts` or `addresses.ts`
4. **SQL Schema Pattern**: Follow pattern from `supabase-orders-schema.sql`

## ⚠️ Avoid Duplication

- ❌ Don't create new Modal component (reuse existing)
- ❌ Don't create new auth check utilities (use existing pattern)
- ❌ Don't duplicate CartContext functions (modify existing)
- ❌ Don't create new cart types (use existing CartItem type)

