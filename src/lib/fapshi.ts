const BASE_URL = process.env.FAPSHI_BASE_URL || 'https://sandbox.fapshi.com'
const API_USER = process.env.FAPSHI_API_USER || ''
const API_KEY = process.env.FAPSHI_API_KEY || ''

const PAYOUT_BASE_URL = process.env.FAPSHI_PAYOUT_BASE_URL || 'https://sandbox.fapshi.com'
const PAYOUT_API_USER = process.env.FAPSHI_PAYOUT_API_USER || ''
const PAYOUT_API_KEY = process.env.FAPSHI_PAYOUT_API_KEY || ''

interface DirectPayRequest {
  amount: number
  phone: string
  medium?: 'mobile money' | 'orange money'
  name?: string
  email?: string
  externalId?: string
  message?: string
}

interface DirectPayResponse {
  message: string
  transId: string
  dateInitiated: string
}

interface PaymentStatusResponse {
  transId: string
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED'
  amount: number
  [key: string]: unknown
}

/**
 * Initiate a Direct Pay transaction via Fapshi.
 * Sends a push notification to the user's phone.
 */
export async function initiateDirectPay(
  data: DirectPayRequest
): Promise<DirectPayResponse> {
  const response = await fetch(`${BASE_URL}/direct-pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiuser: API_USER,
      apikey: API_KEY,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Fapshi Direct Pay failed: ${response.status} - ${errorBody}`)
  }

  return response.json()
}

/**
 * Check the payment status of a transaction.
 */
export async function getPaymentStatus(
  transId: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(`${BASE_URL}/payment-status/${transId}`, {
    method: 'GET',
    headers: {
      apiuser: API_USER,
      apikey: API_KEY,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Fapshi status check failed: ${response.status} - ${errorBody}`)
  }

  return response.json()
}

export interface PayoutRequest {
  amount: number
  phone: string
}

export interface PayoutResponse {
  message: string
  transId: string
}

/**
 * Initiate a Payout transaction via Fapshi.
 */
export async function initiatePayout(
  data: PayoutRequest
): Promise<PayoutResponse> {
  const response = await fetch(`${PAYOUT_BASE_URL}/payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiuser: PAYOUT_API_USER,
      apikey: PAYOUT_API_KEY,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Fapshi Payout failed: ${response.status} - ${errorBody}`)
  }

  return response.json()
}
