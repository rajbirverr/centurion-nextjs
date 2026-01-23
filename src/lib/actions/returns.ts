'use server'

import { createServerSupabaseClient as createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ReturnsPageSettings = {
    id: string
    hero_title: string
    hero_subtitle: string
    hero_image_url: string | null
    step_1_title: string
    step_1_desc: string
    step_2_title: string
    step_2_desc: string
    step_3_title: string
    step_3_desc: string
    policy_html: string
    start_return_url: string
}

export type ReturnsFAQ = {
    id: string
    question: string
    answer: string
    sort_order: number
}

/* -------------------------------------------------------------------------- */
/*                                PUBLIC ACTIONS                               */
/* -------------------------------------------------------------------------- */

export async function getReturnsSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('returns_page_settings')
        .select('*')
        .single()

    if (error) console.error('Error fetching returns settings:', error)
    return data as ReturnsPageSettings | null
}

export async function getReturnsFAQs() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('returns_faqs')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

    if (error) console.error('Error fetching FAQs:', error)
    return (data || []) as ReturnsFAQ[]
}

/* -------------------------------------------------------------------------- */
/*                                ADMIN ACTIONS                                */
/* -------------------------------------------------------------------------- */

export async function updateReturnsSettings(settings: Partial<ReturnsPageSettings>) {
    const supabase = createAdminClient()

    // settings is a singleton, so we update the only row, or insert if missing (though schema guarantees one)
    // We'll assume the ID is known or we just update the first row we find?
    // Actually, schema made it unique. We can update based on "true" or just fetch the ID first.
    // Easiest is to update the single row indiscriminately if we don't have ID, but passing ID is safer.

    let result;
    if (settings.id) {
        result = await supabase
            .from('returns_page_settings')
            .update(settings)
            .eq('id', settings.id)
    } else {
        // Fallback: update any row (since only one exists)
        // Or upsert.
        // Let's rely on the fact we usually fetch before update.
        const { data: existing } = await supabase.from('returns_page_settings').select('id').single()
        if (existing) {
            result = await supabase.from('returns_page_settings').update(settings).eq('id', existing.id)
        } else {
            result = await supabase.from('returns_page_settings').insert(settings)
        }
    }

    if (result.error) return { success: false, error: result.error.message }

    revalidatePath('/returns')
    revalidatePath('/admin/returns')
    return { success: true }
}

export async function createFAQ(faq: Omit<ReturnsFAQ, 'id'>) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('returns_faqs').insert(faq)

    if (error) return { success: false, error: error.message }
    revalidatePath('/returns')
    revalidatePath('/admin/returns')
    return { success: true }
}

export async function updateFAQ(id: string, updates: Partial<ReturnsFAQ>) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('returns_faqs').update(updates).eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/returns')
    revalidatePath('/admin/returns')
    return { success: true }
}

export async function deleteFAQ(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('returns_faqs').delete().eq('id', id)

    if (error) return { success: false, error: error.message }
    revalidatePath('/returns')
    revalidatePath('/admin/returns')
    return { success: true }
}
