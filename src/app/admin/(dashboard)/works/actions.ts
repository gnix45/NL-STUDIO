'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/security'

// The security layer requires us to check admin session
export async function getWorks() {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createWork(formData: FormData) {
  const admin = await verifyAdminSession()
  if (!admin) throw new Error('Unauthorized')

  const label = formData.get('label') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string || '#1A1A1A'
  const image_url = formData.get('image_url') as string
  const order_index = parseInt(formData.get('order_index') as string || '0')
  const active = formData.get('active') === 'true'

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('works').insert({
    label,
    title,
    description,
    color,
    image_url,
    order_index,
    active
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/works')
  revalidatePath('/')
}

export async function updateWork(id: string, formData: FormData) {
  const admin = await verifyAdminSession()
  if (!admin) throw new Error('Unauthorized')

  const label = formData.get('label') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string
  const image_url = formData.get('image_url') as string
  const order_index = parseInt(formData.get('order_index') as string || '0')
  const active = formData.get('active') !== 'false'

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('works')
    .update({ label, title, description, color, image_url, order_index, active })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/works')
  revalidatePath('/')
}

export async function deleteWork(id: string) {
  const admin = await verifyAdminSession()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('works').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/works')
  revalidatePath('/')
}
