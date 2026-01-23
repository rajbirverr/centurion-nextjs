'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface TextOverlay {
  text: string
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  fontSize: number
  color: string
  fontFamily: string
  enabled: boolean
}

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
  initialOverlay?: Partial<TextOverlay>
}

const DEFAULT_OVERLAY: TextOverlay = {
  text: 'CENTURION',
  position: 'bottom-center',
  fontSize: 32,
  color: '#784D2C',
  fontFamily: "'Rhode', sans-serif",
  enabled: false
}

export default function ImageEditor({ imageUrl, onSave, onCancel, initialOverlay }: ImageEditorProps) {
  const [overlay, setOverlay] = useState<TextOverlay>({ ...DEFAULT_OVERLAY, ...initialOverlay })
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match image (maintain aspect ratio)
    const maxWidth = 1200
    const maxHeight = 1200
    let width = img.width
    let height = img.height

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = width * ratio
      height = height * ratio
    }

    canvas.width = width
    canvas.height = height

    // Draw image only (no watermark on canvas - watermark is CSS overlay)
    ctx.drawImage(img, 0, 0, width, height)
  }, [])

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawCanvas()
    }
  }, [overlay, imageLoaded, drawCanvas])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const canvas = canvasRef.current
    if (!canvas) return

    // NOTE: ImageEditor is for image editing/preview only
    // Watermark settings are managed in ProductForm (per-product) or global settings
    // Do NOT save watermark settings from ImageEditor to avoid conflicts

    // Convert canvas to blob and create object URL (image without watermark)
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const editedImageUrl = reader.result as string
          onSave(editedImageUrl)
        }
      }
    }, 'image/jpeg', 0.95)
  }

  const handlePositionChange = (position: TextOverlay['position']) => {
    setOverlay({ ...overlay, position })
  }

  const handleFontSizeChange = (fontSize: number) => {
    setOverlay({ ...overlay, fontSize: Math.max(12, Math.min(100, fontSize)) })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit Image</h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCancel()
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close editor"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preview Area */}
            <div className="md:col-span-2">
              <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {/* Hidden image for canvas */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Preview"
                  onLoad={handleImageLoad}
                  className="hidden"
                />
                {/* Canvas for rendering */}
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] object-contain"
                  style={{ display: 'block' }}
                />
                {/* Overlay preview (for positioning guide) */}
                {overlay.enabled && (
                  <div
                    className={`absolute ${positionClasses[overlay.position]} pointer-events-none`}
                    style={{
                      fontFamily: overlay.fontFamily,
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                    }}
                  >
                    {overlay.text}
                  </div>
                )}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={overlay.enabled}
                    onChange={(e) => setOverlay({ ...overlay, enabled: e.target.checked })}
                    className="mr-2 w-4 h-4 text-[#784D2C] focus:ring-[#784D2C]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Brand Watermark</span>
                </label>
              </div>

              {overlay.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Text
                    </label>
                    <input
                      type="text"
                      value={overlay.text}
                      onChange={(e) => setOverlay({ ...overlay, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]"
                      placeholder="CENTURION"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePositionChange(pos)
                          }}
                          className={`px-3 py-2 text-xs border rounded-md transition-colors ${
                            overlay.position === pos
                              ? 'bg-[#784D2C] text-white border-[#784D2C]'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size: {overlay.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="100"
                      value={overlay.fontSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#784D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) => setOverlay({ ...overlay, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCancel()
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#784D2C] text-white rounded-md hover:bg-[#6a3d20] transition-colors"
            >
              Apply to Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

