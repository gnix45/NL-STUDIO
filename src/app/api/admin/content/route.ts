import { type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { contentUpdateSchema } from '@/lib/validation'
import { logActivity } from '@/lib/logger'
import { verifyAdminSession, verifyCsrf, errorResponse, getClientIP } from '@/lib/security'
import { adminLimiter } from '@/lib/rate-limit'

export async function PUT(request: NextRequest) {
  if (!verifyCsrf(request)) return errorResponse('Non autorise.', 403)

  const ip = await getClientIP()
  const { success } = adminLimiter.check(ip)
  if (!success) return errorResponse('Trop de requetes.', 429)

  const user = await verifyAdminSession()
  if (!user) return errorResponse('Non autorise.', 403)

  try {
    const body = await request.json()
    const parsed = contentUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('Donnees invalides.', 400)
    }

    const { section, key, value } = parsed.data
    const supabase = createServiceRoleClient()

    // Upsert: update if exists, insert if not
    const { data: existing } = await supabase
      .from('page_content')
      .select('id')
      .eq('section', section)
      .eq('key', key)
      .single()

    if (existing) {
      await supabase
        .from('page_content')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('page_content')
        .insert({ section, key, value })
    }

    await logActivity({
      type: 'content_updated',
      message: `Contenu mis a jour: ${section}.${key}`,
      metadata: { section, key },
    })

    return Response.json({ success: true })
  } catch {
    return errorResponse('Erreur interne.', 500)
  }
}
