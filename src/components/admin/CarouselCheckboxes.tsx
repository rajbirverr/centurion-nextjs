'use client'

import { useState, useTransition } from 'react'
import { updateProductCarouselFlags } from '@/lib/actions/products'

interface CarouselCheckboxesProps {
  productId: string
  inShineCarousel: boolean
  inDripCarousel: boolean
}

export default function CarouselCheckboxes({
  productId,
  inShineCarousel = false,
  inDripCarousel = false
}: CarouselCheckboxesProps) {
  const [shine, setShine] = useState(inShineCarousel)
  const [drip, setDrip] = useState(inDripCarousel)
  const [isPending, startTransitionFn] = useTransition()

  const handleChange = (carousel: 'shine' | 'drip', checked: boolean) => {
    const flags = {
      in_shine_carousel: carousel === 'shine' ? checked : shine,
      in_drip_carousel: carousel === 'drip' ? checked : drip,
    }

    if (carousel === 'shine') setShine(checked)
    if (carousel === 'drip') setDrip(checked)

    startTransitionFn(async () => {
      const result = await updateProductCarouselFlags(productId, flags)
      if (!result.success) {
        // Revert on error
        if (carousel === 'shine') setShine(!checked)
        if (carousel === 'drip') setDrip(!checked)
        alert(`Failed to update: ${result.error}`)
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1.5 cursor-pointer" title="The Shine Carousel">
        <input
          type="checkbox"
          checked={shine}
          onChange={(e) => handleChange('shine', e.target.checked)}
          disabled={isPending}
          className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46] cursor-pointer disabled:opacity-50"
        />
        <span className="text-xs text-gray-600">Shine</span>
      </label>
      
      <label className="flex items-center gap-1.5 cursor-pointer" title="Drip for Days Carousel">
        <input
          type="checkbox"
          checked={drip}
          onChange={(e) => handleChange('drip', e.target.checked)}
          disabled={isPending}
          className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46] cursor-pointer disabled:opacity-50"
        />
        <span className="text-xs text-gray-600">Drip</span>
      </label>
    </div>
  )
}

