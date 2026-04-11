const apiUrl = process.env.EVOLUTION_API_URL
const apiKey = process.env.EVOLUTION_API_KEY
const instanceName = process.env.EVOLUTION_INSTANCE_NAME
const adminWhatsapp = process.env.ADMIN_WHATSAPP

function formatPhone(phone: string): string {
  // Remove all non-numeric characters (including spaces, +, -)
  let clean = phone.replace(/[^0-9]/g, '')
  
  // If the user entered a standard 9-digit Cameroonian number (e.g. 6XX XXX XXX),
  // automatically prepend the 237 country code so WhatsApp can route it.
  if (clean.length === 9) {
    clean = `237${clean}`
  }
  
  return clean
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  if (!apiUrl || !apiKey || !instanceName) {
    console.warn('[WhatsApp] Evolution API non configure. Message ignore.')
    return
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: formatPhone(to),
        text: message,
        delay: 1200,
        linkPreview: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[WhatsApp] Erreur API Evolution: ${response.status} - ${errorText}`)
      throw new Error('Echec de l\'envoi WhatsApp')
    }
  } catch (error) {
    console.error('[WhatsApp] Erreur d\'envoi:', error)
    // We shouldn't crash the server just because a WhatsApp message failed
  }
}

export interface WhatsAppOrderData {
  buyerName: string
  buyerWhatsapp: string
  productName: string
  productLink: string
}

export async function sendWhatsAppOrderConfirmation(data: WhatsAppOrderData): Promise<void> {
  const message = `*Merci ${data.buyerName} !* 🎉\nVotre paiement pour *${data.productName}* a été confirmé.\n\nAccédez à votre produit ici : ${data.productLink}\n\nL'équipe NL.studio.`
  await sendWhatsAppMessage(data.buyerWhatsapp, message)
}

export interface WhatsAppAdminOrderData {
  buyerName: string
  buyerPhone: string
  buyerWhatsapp: string
  productName: string
  amount: number
}

export async function sendWhatsAppAdminOrderNotification(data: WhatsAppAdminOrderData): Promise<void> {
  if (!adminWhatsapp) return

  const message = `🚨 *Nouvelle Commande !*\n\nProduit : *${data.productName}*\nMontant : *${data.amount} XAF*\nClient : ${data.buyerName}\nTel : +${formatPhone(data.buyerPhone)}\nWhatsApp : +${formatPhone(data.buyerWhatsapp)}`
  await sendWhatsAppMessage(adminWhatsapp, message)
}

export async function sendWhatsAppAdminLoginAlert(ip: string, userAgent: string): Promise<void> {
  if (!adminWhatsapp) return

  const message = `🔒 *Alerte Sécurité*\n\nConnexion à l'espace Admin réussie.\nIP: ${ip}\nAppareil: ${userAgent.split(' ')[0]}`
  await sendWhatsAppMessage(adminWhatsapp, message)
}
