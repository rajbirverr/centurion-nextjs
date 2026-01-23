'use client'

import { useState, useEffect, useRef } from 'react'
import { updateShowcaseCardImage, uploadShowcaseCardImageToStorage, getShowcaseCardImage } from '@/lib/actions/site-settings'

export default function ShowcaseCardImageUpload() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCurrentImage()
  }, [])

  const loadCurrentImage = async () => {
    const imageUrl = await getShowcaseCardImage()
    if (imageUrl) {
      setCurrentImageUrl(imageUrl)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. For larger images, use "Enter URL" mode instead.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
    setError(null)
    setSuccess(false)
    
    if (e.target.value) {
      try {
        new URL(e.target.value)
        setPreviewUrl(e.target.value)
      } catch {
        // Allow relative paths like /nobackgroundimage/...
        if (e.target.value.startsWith('/')) {
          setPreviewUrl(e.target.value)
        } else {
          setPreviewUrl(null)
        }
      }
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    let imageUrl: string

    if (inputMode === 'upload') {
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        setError('Please select an image file')
        return
      }

      setUploading(true)
      try {
        const result = await uploadShowcaseCardImageToStorage(file)
        if (!result.success || !result.url) {
          const errorMsg = result.error || 'Failed to upload image'
          if (errorMsg.includes('Bucket not found') || errorMsg.includes('not found')) {
            setError(`${errorMsg}\n\nTip: Use "Enter URL" mode instead, or create the "images" bucket in Supabase Storage.`)
          } else {
            setError(errorMsg)
          }
          setUploading(false)
          return
        }
        imageUrl = result.url
      } catch (err: any) {
        setError(err.message || 'Failed to upload image')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    } else {
      if (!urlInput.trim()) {
        setError('Please enter an image URL')
        return
      }

      // Allow relative paths
      if (!urlInput.trim().startsWith('http') && !urlInput.trim().startsWith('/')) {
        setError('Please enter a valid URL (starting with http://, https://, or /)')
        return
      }

      imageUrl = urlInput.trim()
    }

    setSaving(true)
    try {
      const result = await updateShowcaseCardImage(imageUrl)
      if (!result.success) {
        setError(result.error || 'Failed to save showcase card image')
        setSaving(false)
        return
      }

      setCurrentImageUrl(imageUrl)
      setPreviewUrl(null)
      setUrlInput('')
      setSuccess(true)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save showcase card image')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setUrlInput('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Showcase Card Image Settings</h2>
      <p className="text-sm text-gray-600 mb-4">Change the image for the "THE FASHION JEWELRY SHOP" showcase card on the homepage.</p>
      
      {displayImageUrl && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {previewUrl ? 'Preview' : 'Current Showcase Card Image'}
          </label>
          <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={displayImageUrl}
              alt="Showcase card preview"
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image')}
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setInputMode('upload')
              handleCancel()
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'upload'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('url')
              handleCancel()
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'url'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Enter URL
          </button>
        </div>

        {inputMode === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB (for larger images, use URL mode)</p>
          </div>
        )}

        {inputMode === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="/nobackgroundimage/your-image.jpg or https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Showcase card image updated successfully!
        </div>
      )}

      {previewUrl && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading || saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Showcase Card Image'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading || saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {inputMode === 'url' && urlInput.trim() && !previewUrl && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Showcase Card Image'}
        </button>
      )}
    </div>
  )
}
