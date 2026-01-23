'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus, updateOrderPaymentStatus } from '@/lib/actions/orders'

interface UpdateOrderStatusProps {
  orderId: string
  currentStatus?: string
  currentPaymentStatus?: string
  isPayment?: boolean
}

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
  currentPaymentStatus,
  isPayment = false
}: UpdateOrderStatusProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const statusOptions = isPayment
    ? ['pending', 'paid', 'failed', 'refunded']
    : ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const currentValue = isPayment ? currentPaymentStatus : currentStatus

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      let result
      if (isPayment) {
        result = await updateOrderPaymentStatus(orderId, newStatus as any)
      } else {
        result = await updateOrderStatus(orderId, newStatus as any)
      }

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(error.message || 'Failed to update status')
    } finally {
      setLoading(false)
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="text-sm font-medium text-gray-900 hover:text-[#5a4c46] disabled:opacity-50"
      >
        {currentValue || 'N/A'} {loading ? '...' : '▼'}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
              >
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

