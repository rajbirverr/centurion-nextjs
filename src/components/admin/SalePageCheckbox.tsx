'use client'

import { useState, useTransition } from 'react'
import { updateProductSalePageFlags } from '@/lib/actions/products'

interface SalePageCheckboxProps {
  productId: string
  inSalePage: boolean
  discountPercentage: number
}

export default function SalePageCheckbox({
  productId,
  inSalePage = false,
  discountPercentage = 0
}: SalePageCheckboxProps) {
  const [salePage, setSalePage] = useState(inSalePage)
  const [discount, setDiscount] = useState(discountPercentage)
  const [inputValue, setInputValue] = useState(discountPercentage.toString())
  const [isPending, startTransitionFn] = useTransition()
  const [showDiscountInput, setShowDiscountInput] = useState(false)

  const handleCheckboxChange = (checked: boolean) => {
    setSalePage(checked)
    if (checked) {
      setShowDiscountInput(true)
    }

    startTransitionFn(async () => {
      const result = await updateProductSalePageFlags(productId, {
        in_sale_page: checked,
        discount_percentage: checked ? discount : 0
      })
      if (!result.success) {
        setSalePage(!checked)
        alert(`Failed to update: ${result.error}`)
      }
    })
  }

  const handleInputChange = (value: string) => {
    // Only update local input state, don't save to database yet
    setInputValue(value)
  }

  const saveDiscount = () => {
    const numValue = Number(inputValue) || 0
    const clampedDiscount = Math.max(0, Math.min(100, numValue))
    
    // Update local state
    setDiscount(clampedDiscount)
    setInputValue(clampedDiscount.toString())
    setShowDiscountInput(false)

    // Save to database
    startTransitionFn(async () => {
      const result = await updateProductSalePageFlags(productId, {
        in_sale_page: salePage,
        discount_percentage: clampedDiscount
      })
      if (!result.success) {
        // Revert on error
        setDiscount(discount)
        setInputValue(discount.toString())
        alert(`Failed to update: ${result.error}`)
      }
    })
  }

  const handleInputBlur = () => {
    saveDiscount()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveDiscount()
    } else if (e.key === 'Escape') {
      // Cancel editing, revert to saved value
      setInputValue(discount.toString())
      setShowDiscountInput(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 cursor-pointer" title="Sale Page">
        <input
          type="checkbox"
          checked={salePage}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={isPending}
          className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46] cursor-pointer disabled:opacity-50"
        />
        <span className="text-xs text-gray-600">Sale Page</span>
      </label>
      
      {salePage && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            disabled={isPending}
            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            {discount > 0 ? `${discount}%` : 'Set %'}
          </button>
          
          {showDiscountInput && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={isPending}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-[#5a4c46] focus:border-[#5a4c46] disabled:opacity-50"
                placeholder="%"
                autoFocus
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
