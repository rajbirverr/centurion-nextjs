'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllOrders, type Order } from '@/lib/actions/orders'

export default function OrdersSection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])

  // Simple tracking view state
  const [trackingData, setTrackingData] = useState<Record<string, any>>({})
  const [loadingTracking, setLoadingTracking] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const orders = await getAllOrders()
      setOrders(orders)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-[#84756f]">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error}
      </div>
    )
  }

  // Simple tracking view inside the card
  // Hooks moved to top level

  const handleTrack = async (orderId: string, awb: string) => {
    if (!awb) return

    // Toggle close if already open
    if (trackingData[orderId]) {
      setTrackingData(prev => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
      return
    }

    setLoadingTracking(orderId)
    try {
      // Dynamically import to avoid server-side issues if any
      const { getTrackingStatus } = await import('@/lib/actions/tracking')
      const data = await getTrackingStatus(awb)
      if (data) {
        setTrackingData(prev => ({ ...prev, [orderId]: data }))
      }
    } catch (e) {
      console.error('Tracking error', e)
    } finally {
      setLoadingTracking(null)
    }
  }

  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-center py-12 border border-[#e5e2e0] rounded-md">
          <p className="text-[#84756f] mb-4">No orders found</p>
          <Link
            href="/all-products"
            className="px-4 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] rounded-md uppercase tracking-wider text-xs transition-colors duration-200 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border border-[#e5e2e0] rounded-md p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-[#84756f]">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-[#84756f]">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#5a4c46]">₹{order.total.toLocaleString()}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Tracking Info Area */}
              {trackingData[order.id] && (
                <div className="bg-gray-50 p-4 mb-4 rounded text-sm text-[#5a4c46]">
                  <h4 className="font-semibold mb-2">Tracking Status ({trackingData[order.id].awb})</h4>
                  <p className="mb-2">Current Status: <span className="font-medium">{trackingData[order.id].current_status}</span></p>
                  {trackingData[order.id].estimated_delivery_date && (
                    <p className="mb-2">Est. Delivery: {new Date(trackingData[order.id].estimated_delivery_date).toDateString()}</p>
                  )}

                  <div className="mt-3 border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Latest Updates</p>
                    {trackingData[order.id].scans?.slice(0, 3).map((scan: any, idx: number) => (
                      <div key={idx} className="flex gap-2 mb-1 text-xs">
                        <span className="text-gray-500 min-w-[120px]">{new Date(scan.ScanDateTime).toLocaleString()}</span>
                        <span>{scan.ScanDetail} ({scan.ScannedLocation})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#e5e2e0]">
                <div className="flex gap-4">
                  <div className="text-sm text-[#84756f]">
                    Payment: <span className="font-medium text-[#5a4c46]">{order.payment_status}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* Track Button (Only if tracking number exists) */}
                  {/* Assuming order.tracking_number will populate after migration */}
                  {order.tracking_number && (
                    <button
                      onClick={() => handleTrack(order.id, order.tracking_number)}
                      disabled={loadingTracking === order.id}
                      className="text-[#5a4c46] border border-[#5a4c46] px-3 py-1 rounded-full hover:bg-[#5a4c46] hover:text-white text-xs uppercase tracking-wide transition-all"
                    >
                      {loadingTracking === order.id ? 'Loading...' : (trackingData[order.id] ? 'Close Tracking' : 'Track Order')}
                    </button>
                  )}

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-[#5a4c46] hover:text-[#4a3c36] text-sm font-medium flex items-center"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

