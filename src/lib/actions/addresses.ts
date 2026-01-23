'use server'

import { revalidatePath } from 'next/cache'
import { getServerUser } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CustomerAddress {
  id: string
  user_id: string
  label: string
  first_name: string
  last_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateAddressData {
  label: string
  first_name: string
  last_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id: string
}

export async function getUserAddresses(): Promise<{ success: boolean; addresses?: CustomerAddress[]; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const { data: addresses, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return { success: false, error: error.message }
    }

    return { success: true, addresses: (addresses || []) as CustomerAddress[] }
  } catch (error: any) {
    console.error('Error in getUserAddresses:', error)
    return { success: false, error: error.message || 'Failed to fetch addresses' }
  }
}

export async function createAddress(data: CreateAddressData) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const addressData = {
      ...data,
      user_id: user.id,
      is_default: data.is_default || false,
    }

    const { data: address, error } = await supabase
      .from('customer_addresses')
      .insert(addressData)
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return { success: false, error: error.message }
    }

    // If this is set as default, ensure only one default address
    if (data.is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', address.id)

      // Update this address to be default
      await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', address.id)
    }

    revalidatePath('/account')
    return { success: true, address: address as CustomerAddress }
  } catch (error: any) {
    console.error('Error in createAddress:', error)
    return { success: false, error: error.message || 'Failed to create address' }
  }
}

export async function updateAddress(data: UpdateAddressData) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const { id, ...updateData } = data

    // First, verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || existingAddress?.user_id !== user.id) {
      return { success: false, error: 'Address not found or unauthorized' }
    }

    const { data: address, error } = await supabase
      .from('customer_addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return { success: false, error: error.message }
    }

    // If this is set as default, ensure only one default address
    if (updateData.is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id)

      // Update this address to be default
      await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', id)
    }

    revalidatePath('/account')
    return { success: true, address: address as CustomerAddress }
  } catch (error: any) {
    console.error('Error in updateAddress:', error)
    return { success: false, error: error.message || 'Failed to update address' }
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    // Verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single()

    if (fetchError || existingAddress?.user_id !== user.id) {
      return { success: false, error: 'Address not found or unauthorized' }
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId)

    if (error) {
      console.error('Error deleting address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/account')
    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteAddress:', error)
    return { success: false, error: error.message || 'Failed to delete address' }
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    // Verify the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single()

    if (fetchError || existingAddress?.user_id !== user.id) {
      return { success: false, error: 'Address not found or unauthorized' }
    }

    // Unset all other default addresses
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', addressId)

    // Set this address as default
    const { data: address, error } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single()

    if (error) {
      console.error('Error setting default address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/account')
    return { success: true, address: address as CustomerAddress }
  } catch (error: any) {
    console.error('Error in setDefaultAddress:', error)
    return { success: false, error: error.message || 'Failed to set default address' }
  }
}


