import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Extract client IP from request headers.
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Extract user agent from request headers.
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers()
  return headersList.get('user-agent') || 'unknown'
}

/**
 * Verify CSRF: check X-Requested-With header on mutating requests.
 */
export function verifyCsrf(request: Request): boolean {
  const xrw = request.headers.get('x-requested-with')
  return xrw === 'XMLHttpRequest'
}

/**
 * Verify admin session server-side.
 * Returns the user if authenticated, null otherwise.
 */
export async function verifyAdminSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

/**
 * Create a standardized error response (no internal details leaked).
 */
export function errorResponse(
  message: string,
  status: number
): Response {
  return Response.json({ error: message }, { status })
}

/**
 * Rate limit exceeded response.
 */
export function rateLimitResponse(): Response {
  return Response.json(
    { error: 'Trop de requetes. Veuillez reessayer plus tard.' },
    { status: 429 }
  )
}

/**
 * Verify cron secret for scheduled jobs.
 */
export function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.CRON_SECRET
}
