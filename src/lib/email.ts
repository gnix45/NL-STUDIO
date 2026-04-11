import nodemailer from 'nodemailer'

const port = parseInt(process.env.EMAIL_PORT || '587')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

interface SuccessEmailData {
  buyerName: string
  buyerEmail: string
  productName: string
  productLink: string
  amount: number
  transId: string
}

interface FailureEmailData {
  buyerName: string
  buyerEmail: string
  productName: string
  productPageUrl: string
  amount: number
  transId: string
}

function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

function successTemplate(data: SuccessEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0C0C0C;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0C0C;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Red accent bar -->
        <tr><td style="background:#D42B2B;height:4px;"></td></tr>
        <!-- Header -->
        <tr><td style="background:#0C0C0C;padding:32px 40px 24px;">
          <span style="color:#F8F7F4;font-size:20px;font-weight:800;letter-spacing:-0.5px;">NL.studio</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#0C0C0C;padding:0 40px 32px;">
          <h1 style="color:#F8F7F4;font-size:28px;font-weight:700;margin:0 0 16px;line-height:1.2;">
            Merci, ${data.buyerName}
          </h1>
          <p style="color:#6B6B6B;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Votre paiement a ete confirme avec succes. Vous pouvez telecharger votre produit ci-dessous.
          </p>
        </td></tr>
        <!-- Product box -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;">
            <tr><td style="padding:20px 24px;">
              <span style="color:#F8F7F4;font-size:16px;font-weight:600;">${data.productName}</span>
              <br>
              <span style="color:#D42B2B;font-size:14px;font-weight:600;margin-top:8px;display:inline-block;">
                ${formatXAF(data.amount)}
              </span>
            </td></tr>
          </table>
        </td></tr>
        <!-- CTA button -->
        <tr><td style="padding:0 40px 16px;" align="center">
          <a href="${data.productLink}" target="_blank"
             style="display:inline-block;background:#D42B2B;color:#F8F7F4;text-decoration:none;
                    padding:16px 40px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
            Acceder au produit
          </a>
        </td></tr>
        <!-- Fallback link -->
        <tr><td style="padding:0 40px 32px;" align="center">
          <a href="${data.productLink}" style="color:#6B6B6B;font-size:12px;word-break:break-all;">
            ${data.productLink}
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0C0C0C;padding:24px 40px;border-top:1px solid #1A1A1A;">
          <span style="color:#6B6B6B;font-size:12px;">
            Ref: ${data.transId}
          </span>
          <br>
          <span style="color:#6B6B6B;font-size:11px;margin-top:8px;display:inline-block;">
            NL.studio. Tous droits reserves.
          </span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function failureTemplate(data: FailureEmailData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0C0C0C;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C0C0C;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Muted accent bar -->
        <tr><td style="background:#6B6B6B;height:4px;"></td></tr>
        <!-- Header -->
        <tr><td style="background:#0C0C0C;padding:32px 40px 24px;">
          <span style="color:#F8F7F4;font-size:20px;font-weight:800;letter-spacing:-0.5px;">NL.studio</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#0C0C0C;padding:0 40px 32px;">
          <h1 style="color:#F8F7F4;font-size:28px;font-weight:700;margin:0 0 16px;line-height:1.2;">
            Paiement non abouti
          </h1>
          <p style="color:#6B6B6B;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Votre paiement pour le produit ci-dessous n'a pas abouti. Vous pouvez reessayer a tout moment.
          </p>
        </td></tr>
        <!-- Product box -->
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;">
            <tr><td style="padding:20px 24px;">
              <span style="color:#F8F7F4;font-size:16px;font-weight:600;">${data.productName}</span>
              <br>
              <span style="color:#6B6B6B;font-size:14px;margin-top:8px;display:inline-block;">
                ${formatXAF(data.amount)}
              </span>
            </td></tr>
          </table>
        </td></tr>
        <!-- CTA button -->
        <tr><td style="padding:0 40px 16px;" align="center">
          <a href="${data.productPageUrl}" target="_blank"
             style="display:inline-block;background:#D42B2B;color:#F8F7F4;text-decoration:none;
                    padding:16px 40px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
            Reessayer
          </a>
        </td></tr>
        <!-- WhatsApp support -->
        <tr><td style="padding:0 40px 32px;" align="center">
          <span style="color:#6B6B6B;font-size:13px;">
            Besoin d'aide? Contactez-nous sur WhatsApp
          </span>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0C0C0C;padding:24px 40px;border-top:1px solid #1A1A1A;">
          <span style="color:#6B6B6B;font-size:12px;">
            Ref: ${data.transId}
          </span>
          <br>
          <span style="color:#6B6B6B;font-size:11px;margin-top:8px;display:inline-block;">
            NL.studio. Tous droits reserves.
          </span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendSuccessEmail(data: SuccessEmailData): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.buyerEmail,
    subject: `Votre achat -- ${data.productName}`,
    html: successTemplate(data),
  })
}

export async function sendFailureEmail(data: FailureEmailData): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.buyerEmail,
    subject: `Paiement echoue -- ${data.productName}`,
    html: failureTemplate(data),
  })
}

export interface AdminNotificationData {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  productName: string
  variantName: string | null
  deliveryAddress: string | null
  amount: number
  transId: string
}

export async function sendAdminOrderNotification(data: AdminNotificationData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
  if (!adminEmail) return

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #D42B2B;">Nouvelle Commande: ${data.productName}</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;"><strong>Client:</strong> ${data.buyerName}</li>
        <li style="margin-bottom: 8px;"><strong>Email:</strong> ${data.buyerEmail}</li>
        <li style="margin-bottom: 8px;"><strong>Tel:</strong> ${data.buyerPhone}</li>
        <li style="margin-bottom: 8px;"><strong>Montant:</strong> ${formatXAF(data.amount)}</li>
        <li style="margin-bottom: 8px;"><strong>Transaction ID:</strong> ${data.transId}</li>
        ${data.variantName ? `<li style="margin-bottom: 8px;"><strong>Variante:</strong> ${data.variantName}</li>` : ''}
        ${data.deliveryAddress ? `<li style="margin-bottom: 8px;"><strong>Adresse de livraison:</strong> ${data.deliveryAddress}</li>` : ''}
      </ul>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `[NL.studio] Nvl Commande - ${data.productName}`,
    html,
  })
}
