import { createServiceRoleClient } from '@/lib/supabase/server'

export type ActivityType =
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'email_sent'
  | 'email_failed'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'content_updated'
  | 'admin_login'
  | 'order_reconciled'
  | 'rate_limit_hit'
  | 'auth_failure'
  | 'admin_withdrawal'
  | 'admin_withdrawal_failed'

export type Severity = 'info' | 'warning' | 'error' | 'critical'

interface LogEntry {
  type: ActivityType
  message: string
  metadata?: Record<string, unknown>
  severity?: Severity
}

/**
 * Log an activity event to the activity_log table.
 * Non-blocking: errors are caught and logged to console only.
 */
export async function logActivity(entry: LogEntry): Promise<void> {
  try {
    const supabase = createServiceRoleClient()
    await supabase.from('activity_log').insert({
      type: entry.type,
      message: entry.message,
      metadata: entry.metadata || {},
      severity: entry.severity || 'info',
    })
  } catch (err) {
    // Never let logging failures break the main flow
    console.error('[logger] Failed to log activity:', err)
  }
}

/**
 * Mask a phone number for safe logging: show only last 4 digits.
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****'
  return '*'.repeat(phone.length - 4) + phone.slice(-4)
}

/**
 * Mask an email for safe logging: show first 2 chars + domain.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  const visibleChars = local.slice(0, 2)
  return `${visibleChars}***@${domain}`
}
