# Cart Persistence & Authentication Plan

## Objective
- Cart should only work when user is logged in
- Cart items must persist in database (not just localStorage)
- Users must be logged in to add items to cart
- Cart items persist across sessions (even if user logs out and logs back in 1 year later)

## Implementation Plan

### Step 1: Create Database Schema
**File:** `supabase-cart-schema.sql`
- Create `cart_items` table:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `product_id` (UUID, foreign key to products)
  - `product_name` (TEXT) - Store name for historical data
  - `product_price` (DECIMAL) - Store price at time of add
  - `variant` (TEXT) - Size/color variant
  - `quantity` (INTEGER)
  - `product_image` (TEXT) - Store image URL
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Enable RLS (Row Level Security)
- Create policies:
  - Users can only view their own cart items
  - Users can only insert/update/delete their own cart items
- Create indexes on `user_id` and `(user_id, product_id, variant)` for performance
- Create trigger to auto-update `updated_at`

### Step 2: Create Server Actions
**File:** `src/lib/actions/cart.ts`
- `getCartItems(userId: string)` - Fetch all cart items for logged-in user
- `addCartItem(data: { userId, productId, productName, price, variant, quantity, image })` - Add/update cart item
- `updateCartItem(cartItemId: string, quantity: number)` - Update quantity
- `removeCartItem(cartItemId: string)` - Remove item from cart
- `clearCart(userId: string)` - Clear all cart items for user
- All functions check authentication via `getServerUser()`

### Step 3: Modify CartContext
**File:** `src/context/CartContext.tsx`
- Add `isLoggedIn: boolean` state (check session on mount)
- Add `isLoading: boolean` state for loading cart from DB
- On mount:
  - Check if user is logged in via `supabase.auth.getSession()`
  - If logged in → Load cart items from database via `getCartItems()`
  - If not logged in → Set `items = []`
- On auth change:
  - Listen to `onAuthStateChange`
  - If `SIGNED_IN` → Load cart from database
  - If `SIGNED_OUT` → Clear cart items
- Modify `addItem()`:
  - Check if user is logged in
  - If not → Return early (caller should show login prompt)
  - If yes → Save to database via `addCartItem()`, then update local state
- Modify `updateQuantity()`:
  - Check if user is logged in
  - If not → Return early
  - If yes → Save to database via `updateCartItem()`, then update local state
- Modify `removeItem()`:
  - Check if user is logged in
  - If not → Return early
  - If yes → Remove from database via `removeCartItem()`, then update local state
- Modify `clearCart()`:
  - Check if user is logged in
  - If not → Return early
  - If yes → Clear from database via `clearCart()`, then update local state

### Step 4: Update ProductDetailClient
**File:** `src/components/product/ProductDetailClient.tsx`
- Import `supabase` from `@/lib/supabase`
- Import `useRouter` from `next/navigation`
- Add `isLoggedIn` state (check session on mount and listen to auth changes)
- Add `showLoginModal` state for popup
- Add `showSuccessToast` state for success message
- Create `LoginRequiredModal` component (or inline modal):
  - Message: "Please login or create account to add items to cart"
  - Two buttons: "Login" and "Create Account"
  - "Login" → `/login?return_url=/product/[id]&action=add_to_cart`
  - "Create Account" → `/account/register?return_url=/product/[id]&action=add_to_cart`
- In `handleAddToCart()`:
  - Check if user is logged in
  - If not → Show login modal (don't redirect yet)
  - If yes → Call `addItem()` and show success toast
- On mount:
  - Check URL params for `action=add_to_cart` and `product_id`
  - If present and user is logged in → Auto-add product to cart
  - Show success toast: "Product added to cart" (disappears in 2 seconds)
- Success Toast Component:
  - Green/positive styled toast message
  - Auto-dismisses after 2 seconds
  - Positioned at top-center or bottom-center

### Step 4.5: Update Login/Register Pages
**File:** `src/app/login/page.tsx`
- Read `action=add_to_cart` from URL params
- If present → Store in localStorage temporarily (or handle via URL redirect)
- After successful login → Redirect to return_url (which will have action param)

**File:** `src/app/account/register/page.tsx`
- Same as login page - handle `action=add_to_cart` param

### Step 5: Update NavBar/CartDropdown
**File:** `src/components/NavBar.tsx`
- Check if user is logged in
- If not logged in:
  - Show "Login" button instead of cart icon, OR
  - Show cart icon but when clicked, show login prompt
- If logged in:
  - Show cart icon with item count as before

**File:** `src/components/dropdowns/CartDropdown.tsx`
- Check if user is logged in
- If not logged in:
  - Show login prompt instead of cart items
  - "Please log in to view your cart" with login button
- If logged in:
  - Show cart items as before

### Step 6: Create Login Required Modal Component (Optional)
**File:** `src/components/modals/LoginRequiredModal.tsx` (optional - can be inline in ProductDetailClient)
- Modal with backdrop
- Message: "Please login or create account to add items to cart"
- Two buttons: "Login" and "Create Account"
- Close button (X)
- Styled to match Rhode aesthetic

### Step 7: Testing Checklist
- [ ] **Unauthenticated user clicks "Add to Cart"** → Login modal appears (no redirect)
- [ ] **User clicks "Login" in modal** → Redirects to `/login?return_url=/product/[id]&action=add_to_cart`
- [ ] **User logs in** → Redirects back to `/product/[id]?action=add_to_cart`
- [ ] **Product auto-added to cart after login redirect** → Cart updated
- [ ] **Success toast appears** → "Product added to cart" (disappears in 2 seconds)
- [ ] **User clicks "Create Account" in modal** → Redirects to register with same params
- [ ] **User creates account** → Redirects back and product auto-added
- [ ] **Authenticated user adds item directly** → Item saved to database + success toast
- [ ] **User logs in** → Cart loads from database
- [ ] **User updates quantity** → Database updated
- [ ] **User removes item** → Database updated
- [ ] **User logs out** → Cart cleared locally
- [ ] **User logs back in** → Cart loads from database (persistent)
- [ ] **User logs out, waits 1 year, logs back in** → Cart still there

## Implementation Order

1. ✅ Create `supabase-cart-schema.sql` - Database schema
2. ✅ Create `src/lib/actions/cart.ts` - Server actions
3. ✅ Modify `src/context/CartContext.tsx` - Add auth check & DB sync
4. ✅ Update `src/components/product/ProductDetailClient.tsx` - Add login modal & success toast
   - Show login modal when unauthenticated user clicks "Add to Cart"
   - Handle `action=add_to_cart` URL param after login redirect
   - Auto-add product to cart after login
   - Show success toast: "Product added to cart" (2 seconds)
5. ✅ Update `src/app/login/page.tsx` - Handle `action=add_to_cart` param
6. ✅ Update `src/app/account/register/page.tsx` - Handle `action=add_to_cart` param
7. ✅ Update `src/components/NavBar.tsx` - Show login if not authenticated
8. ✅ Update `src/components/dropdowns/CartDropdown.tsx` - Show login prompt
9. ✅ Test all scenarios

## User Flow Example:
1. User (not logged in) visits `/all-products`
2. User clicks a product → Goes to `/product/[id]`
3. User clicks "Add to Cart" → **Login modal appears** (popup, not redirect)
4. User clicks "Login" in modal → Goes to `/login?return_url=/product/[id]&action=add_to_cart`
5. User logs in → Redirects back to `/product/[id]?action=add_to_cart`
6. ProductDetailClient detects `action=add_to_cart` param → Auto-adds product to cart
7. **Success toast appears: "Product added to cart"** (disappears after 2 seconds)
8. Cart icon in NavBar updates with count

## Migration Notes

- Existing localStorage-based cart will be replaced with database cart
- When user logs in for first time after this change, cart will be empty (expected)
- Old localStorage cart won't migrate (by design - cart requires authentication)

## Benefits

1. ✅ Cart persists across devices (if user logs in on different device)
2. ✅ Cart persists across sessions (even after 1 year)
3. ✅ Cart data is secure (users can only see their own cart)
4. ✅ Cart can be analyzed (for business insights)
5. ✅ Prevents cart abandonment due to session loss

