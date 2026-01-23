// Watermark configuration
// This file stores the global watermark settings for product images

export interface WatermarkSettings {
  text: string
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  fontSize: number
  color: string
  fontFamily: string
  enabled: boolean
}

// Default watermark settings
export const DEFAULT_WATERMARK: WatermarkSettings = {
  text: 'CENTURION',
  position: 'bottom-center',
  fontSize: 32,
  color: '#784D2C',
  fontFamily: "'Rhode', sans-serif",
  enabled: false
}

// Global watermark settings (can be updated from admin panel)
let globalWatermarkSettings: WatermarkSettings = { ...DEFAULT_WATERMARK }

export function getWatermarkSettings(): WatermarkSettings {
  // Always use consistent defaults to prevent inconsistencies across browsers/domains
  // localStorage may have different values on localhost vs network, so we ignore it
  // and always return the same defaults for consistency
  const defaults = { ...DEFAULT_WATERMARK }
  
  // Ensure localStorage has defaults (for consistency, but we always return defaults)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('watermark_settings')
    if (!stored) {
      // Initialize with defaults if not present
      setWatermarkSettings(defaults)
    } else {
      try {
        const parsed = JSON.parse(stored)
        // Only keep localStorage if it matches defaults exactly (for future customizations)
        // For now, always use defaults for consistency across all browsers
        const matchesDefaults = 
          parsed.position === DEFAULT_WATERMARK.position &&
          parsed.fontSize === DEFAULT_WATERMARK.fontSize &&
          parsed.text === DEFAULT_WATERMARK.text &&
          parsed.color === DEFAULT_WATERMARK.color
        
        if (!matchesDefaults) {
          // Reset to defaults for consistency
          setWatermarkSettings(defaults)
        }
      } catch (e) {
        // Parse error - reset to defaults
        setWatermarkSettings(defaults)
      }
    }
  }
  
  // Always return defaults for consistency (ignore localStorage variations)
  return defaults
}

export function setWatermarkSettings(settings: WatermarkSettings): void {
  globalWatermarkSettings = settings
  // Also save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('watermark_settings', JSON.stringify(settings))
  }
}

