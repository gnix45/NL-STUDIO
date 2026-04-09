import { type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validation'
import { logActivity } from '@/lib/logger'
import { verifyAdminSession, verifyCsrf, errorResponse, rateLimitResponse } from '@/lib/security'
import { adminLimiter } from '@/lib/rate-limit'
import { getClientIP } from '@/lib/security'

async function checkAdmin(request: NextRequest) {
  if (!verifyCsrf(request)) return null
  const ip = await getClientIP()
  const { success } = adminLimiter.check(ip)
  if (!success) return null
  return verifyAdminSession()
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin(request)
  if (!user) return errorResponse('Non autorise.', 403)

  try {
    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Donnees invalides.', 400)
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('products')
      .insert(parsed.data)
      .select('id, name')
      .single()

    if (error) {
      console.error('[admin/products] Create error:', error)
      return errorResponse('Erreur lors de la creation.', 500)
    }

    await logActivity({
      type: 'product_created',
      message: `Produit cree: ${data.name}`,
      metadata: { productId: data.id },
    })

    return Response.json(data, { status: 201 })
  } catch {
    return errorResponse('Erreur interne.', 500)
  }
}

export async function PUT(request: NextRequest) {
  const user = await checkAdmin(request)
  if (!user) return errorResponse('Non autorise.', 403)

  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) return errorResponse('ID requis.', 400)

    const parsed = productSchema.safeParse(rest)
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Donnees invalides.', 400)
    }

    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from('products')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[admin/products] Update error:', error)
      return errorResponse('Erreur lors de la mise a jour.', 500)
    }

    await logActivity({
      type: 'product_updated',
      message: `Produit mis a jour: ${parsed.data.name}`,
      metadata: { productId: id },
    })

    return Response.json({ success: true })
  } catch {
    return errorResponse('Erreur interne.', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const user = await checkAdmin(request)
  if (!user) return errorResponse('Non autorise.', 403)

  try {
    const { id } = await request.json()
    if (!id) return errorResponse('ID requis.', 400)

    const supabase = createServiceRoleClient()

    // Get name for log before delete
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', id)
      .single()

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('[admin/products] Delete error:', error)
      return errorResponse('Erreur lors de la suppression.', 500)
    }

    await logActivity({
      type: 'product_deleted',
      message: `Produit supprime: ${product?.name || id}`,
      severity: 'warning',
      metadata: { productId: id },
    })

    return Response.json({ success: true })
  } catch {
    return errorResponse('Erreur interne.', 500)
  }
}
