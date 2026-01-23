'use client'

import { getWatermarkSettings, type WatermarkSettings } from '@/config/watermark'
import { useEffect, useState } from 'react'

interface WatermarkOverlayProps {
  className?: string
  show?: boolean
  color?: string
  fontSize?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  text?: string // Optional prop to override watermark text for this specific product
}

export default function WatermarkOverlay({ className = '', show, color, fontSize, position, text }: WatermarkOverlayProps) {
  const [watermark, setWatermark] = useState<WatermarkSettings>(getWatermarkSettings())

  useEffect(() => {
    // Listen for watermark updates
    const handleStorageChange = () => {
      setWatermark(getWatermarkSettings())
    }

    // Listen to localStorage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for changes (since storage event only fires in other tabs)
    const interval = setInterval(() => {
      const newSettings = getWatermarkSettings()
      if (JSON.stringify(newSettings) !== JSON.stringify(watermark)) {
        setWatermark(newSettings)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [watermark])

  // Priority: Product-specific setting (show prop) overrides global setting
  // If show is explicitly false, hide watermark (product disabled it)
  if (show === false) {
    return null
  }

  // If show is explicitly true, show watermark (product enabled it)
  if (show === true) {
    // Product enabled it, show with product color or global color
    // Continue to render below
  } else {
    // show is undefined - use global watermark setting
    if (!watermark.enabled) {
      return null
    }
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }

  // Use product-specific values if provided, otherwise use global watermark settings
  const finalPosition = position || watermark.position
  const finalFontSize = fontSize || watermark.fontSize
  const finalColor = color || watermark.color
  const finalText = text || watermark.text

  return (
    <div
      className={`absolute ${positionClasses[finalPosition]} pointer-events-none z-10 ${className}`}
      style={{
        fontFamily: watermark.fontFamily,
        fontSize: `${finalFontSize}px`,
        color: finalColor,
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {finalText}
    </div>
  )
}

