import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppAdminLoginAlert } from '@/lib/whatsapp'
import { getClientIP, getUserAgent, errorResponse } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication securely
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return errorResponse('Non autorise.', 401)
    }

    // Capture environmental data
    const ip = await getClientIP()
    const userAgent = await getUserAgent()

    // Trigger WhatsApp notification asynchronously
    await sendWhatsAppAdminLoginAlert(ip, userAgent)

    return Response.json({ success: true })
  } catch (err) {
    console.error('[notify-login] Unexpected error:', err)
    return errorResponse('Erreur interne. Veuillez reessayer.', 500)
  }
}
