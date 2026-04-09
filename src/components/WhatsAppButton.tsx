import { IconWhatsApp } from '@/components/icons'

interface WhatsAppButtonProps {
  phone: string
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const url = `https://wa.me/${cleanPhone}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter via WhatsApp"
      className="whatsapp-float"
    >
      <IconWhatsApp size={28} color="#FFFFFF" />
    </a>
  )
}
