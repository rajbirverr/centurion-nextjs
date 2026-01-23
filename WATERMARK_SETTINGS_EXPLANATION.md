# Watermark Settings - Architecture Explanation

## Two Settings Locations (RESOLVED)

### **Issue Found:**
There were TWO watermark setting locations that could conflict:

1. **ImageEditor** (Edit Image popup)
   - Location: When editing individual product images
   - Settings: Text, Position, Font Size, Color, Enabled
   - Storage: localStorage (GLOBAL - affects all products)
   - Problem: Was saving to localStorage, conflicting with per-product settings

2. **ProductForm** (Display Settings section)
   - Location: Product edit page → Display Settings
   - Settings: Enabled (per-product), Color (per-product)
   - Storage: Database (PER-PRODUCT settings)
   - Purpose: Control watermark for each individual product

### **Solution Applied:**

**ImageEditor** is now PREVIEW-ONLY:
- Removed `setWatermarkSettings()` call - no longer saves to localStorage
- Preview only - shows how watermark looks but doesn't save settings
- Settings in ImageEditor are temporary (just for preview)

**ProductForm** is the SINGLE SOURCE OF TRUTH:
- Saves `watermark_enabled` (per-product) to database
- Saves `watermark_color` (per-product) to database
- Controls actual watermark display on products

## How It Works Now:

1. **ImageEditor**: Preview watermark overlay (text, position, font size, color) - TEMPORARY only
2. **ProductForm**: Control per-product watermark (enabled/disabled, color override) - SAVED to database

## No More Conflicts:

- ImageEditor doesn't save anything → No global override
- ProductForm saves per-product → Each product has its own settings
- WatermarkOverlay uses: Product settings first, then global defaults

## Result:

✅ No duplicate settings saving
✅ No conflicts between global and per-product
✅ ImageEditor = Preview tool only
✅ ProductForm = Actual settings control

