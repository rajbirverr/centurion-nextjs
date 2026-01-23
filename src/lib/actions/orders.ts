'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

export interface Order {
  id: string
  user_id?: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address: any
  billing_address: any
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  price: number
  created_at: string
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const user = await getServerUser()
    if (!user) {
      return []
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      // Regular users can only see their own orders
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return []
      }

      return (data || []) as Order[]
    }

    // Admins can see all orders
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return (data || []) as Order[]
  } catch (error) {
    console.error('Error in getAllOrders:', error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const user = await getServerUser()
    if (!user) {
      return null
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching order:', error)
      return null
    }

    // Check if user has access (admin or own order)
    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin && data.user_id !== user.id) {
      return null
    }

    return data as Order
  } catch (error) {
    console.error('Error in getOrderById:', error)
    return null
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const user = await getServerUser()
    if (!user) {
      return []
    }

    const order = await getOrderById(orderId)
    if (!order) {
      return []
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching order items:', error)
      return []
    }

    return (data || []) as OrderItem[]
  } catch (error) {
    console.error('Error in getOrderItems:', error)
    return []
  }
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${id}`)

    return { success: true, data: order }
  } catch (error: any) {
    console.error('Error in updateOrderStatus:', error)
    return { success: false, error: error.message || 'Failed to update order status' }
  }
}

export async function updateOrderPaymentStatus(id: string, payment_status: Order['payment_status']) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${id}`)

    return { success: true, data: order }
  } catch (error: any) {
    console.error('Error in updateOrderPaymentStatus:', error)
    return { success: false, error: error.message || 'Failed to update payment status' }
  }
}

export interface CreateOrderData {
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address: any
  billing_address: any
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  payment_method?: string
  items: Array<{
    product_id: string | null
    product_name: string
    product_sku?: string
    quantity: number
    price: number
  }>
}

export async function createOrder(data: CreateOrderData): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const user = await getServerUser()
    const supabase = await createServerSupabaseClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        shipping_address: data.shipping_address,
        billing_address: data.billing_address,
        subtotal: data.subtotal,
        shipping_cost: data.shipping_cost,
        tax: data.tax,
        total: data.total,
        status: 'pending',
        payment_status: 'pending',
        payment_method: data.payment_method,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return { success: false, error: orderError?.message || 'Failed to create order' }
    }

    // Create order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Order was created but items failed - this is still a partial success
      // We'll return success but log the error
      return { success: true, orderId: order.id, error: 'Order created but items failed to save' }
    }

    revalidatePath('/account')
    revalidatePath('/admin/orders')

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error('Error in createOrder:', error)
    return { success: false, error: error.message || 'Failed to create order' }
  }
}

