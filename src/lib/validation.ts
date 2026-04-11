import { z } from 'zod'

/**
 * Sanitize phone number: strip +237 or 237 prefix, remove spaces/dashes.
 */
export function sanitizePhone(raw: string): string {
  let phone = raw.replace(/[\s\-().]/g, '')
  if (phone.startsWith('+237')) phone = phone.slice(4)
  else if (phone.startsWith('237') && phone.length > 9) phone = phone.slice(3)
  return phone
}

/**
 * Auto-detect carrier from 3-digit phone prefix.
 * Cameroon mobile number prefixes:
 *   MTN:    650-654, 670-679, 680-689
 *   Orange: 655-659, 660-669, 690-699
 */
export function detectCarrier(phone: string): 'mtn' | 'orange' | null {
  if (phone.length < 3) return null

  const prefix3 = phone.substring(0, 3)
  const prefix3Num = parseInt(prefix3, 10)

  // 650-654 = MTN
  if (prefix3Num >= 650 && prefix3Num <= 654) return 'mtn'
  // 655-659 = Orange
  if (prefix3Num >= 655 && prefix3Num <= 659) return 'orange'
  // 660-669 = Orange
  if (prefix3Num >= 660 && prefix3Num <= 669) return 'orange'
  // 670-679 = MTN
  if (prefix3Num >= 670 && prefix3Num <= 679) return 'mtn'
  // 680-689 = MTN
  if (prefix3Num >= 680 && prefix3Num <= 689) return 'mtn'
  // 690-699 = Orange
  if (prefix3Num >= 690 && prefix3Num <= 699) return 'orange'

  return null
}

/**
 * Get the Fapshi medium string from carrier.
 */
export function carrierToMedium(carrier: 'mtn' | 'orange'): 'mobile money' | 'orange money' {
  return carrier === 'mtn' ? 'mobile money' : 'orange money'
}

// Cameroonian phone: must start with 6, 9 digits total
const phoneRegex = /^[6][0-9]{8}$/

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(100, 'Le nom est trop long'),
  email: z
    .string()
    .email('Adresse email invalide'),
  phone: z
    .string()
    .transform(sanitizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: 'Numero de telephone camerounais invalide',
    }),
  whatsapp: z
    .string()
    .min(8, 'Le numero WhatsApp est trop court')
    .transform((val) => val.replace(/[\s\-().+]/g, '')),
  productId: z
    .string()
    .uuid('Identifiant produit invalide'),
  variantName: z.string().optional(),
  deliveryAddress: z.string().optional(),
})

export const contentUpdateSchema = z.object({
  section: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  price: z.number().int().min(100, 'Le prix minimum est 100 XAF'),
  image_url: z.string().url().optional().or(z.literal('')),
  product_link: z.string().min(1, 'Le lien produit est requis'),
  category: z.string().default('Digital'),
  active: z.boolean().default(true),
  is_physical: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string().min(1),
    price: z.number().int().min(100)
  })).optional().default([]),
})

export const transIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{1,100}$/, 'Identifiant de transaction invalide')
