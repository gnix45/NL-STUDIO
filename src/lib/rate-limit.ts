/**
 * In-memory sliding window rate limiter.
 * Each instance tracks requests per IP within a configurable window.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

export function rateLimit(options: {
  id: string
  limit: number
  windowMs: number
}) {
  const { id, limit, windowMs } = options

  if (!stores.has(id)) {
    stores.set(id, new Map())
  }

  const store = stores.get(id)!

  return {
    check(ip: string): { success: boolean; remaining: number } {
      const now = Date.now()
      const entry = store.get(ip)

      if (!entry || now > entry.resetTime) {
        store.set(ip, { count: 1, resetTime: now + windowMs })
        return { success: true, remaining: limit - 1 }
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 }
      }

      entry.count++
      return { success: true, remaining: limit - entry.count }
    },
  }
}

// Pre-configured limiters
export const checkoutLimiter = rateLimit({
  id: 'checkout',
  limit: 10,
  windowMs: 60 * 1000, // 10 per minute
})

export const statusLimiter = rateLimit({
  id: 'payment-status',
  limit: 60,
  windowMs: 60 * 1000, // 60 per minute
})

export const adminLimiter = rateLimit({
  id: 'admin',
  limit: 30,
  windowMs: 60 * 1000, // 30 per minute
})

export const publicLimiter = rateLimit({
  id: 'public',
  limit: 120,
  windowMs: 60 * 1000, // 120 per minute
})
