import { randomUUID } from 'crypto';

/**
 * Vercel Serverless Function: /api/square-payment
 * Receives a Square payment token from the client and calls Square Payments API.
 * The Square Access Token lives only here — never exposed to the browser.
 *
 * Required env vars (set in Vercel Dashboard → Settings → Environment Variables):
 *   SQUARE_ACCESS_TOKEN  — Sandbox or Production access token
 *   SQUARE_LOCATION_ID   — Your Square location ID
 *   SQUARE_ENV           — "sandbox" or "production"  (defaults to sandbox)
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    token,          // payment nonce/token from Square Web Payments SDK
    amount,         // total in dollars, e.g. 49.99
    currency = 'USD',
    idempotencyKey, // unique key per attempt (client should generate)
    customer = {},  // { fullName, email, phone, address, city, state, zip, country }
  } = req.body || {};

  if (!token || !amount) {
    return res.status(400).json({ error: 'token and amount are required' });
  }

  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID  = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV          = process.env.SQUARE_ENV || 'sandbox';

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    const missing = [];
    if (!SQUARE_ACCESS_TOKEN) missing.push('SQUARE_ACCESS_TOKEN');
    if (!SQUARE_LOCATION_ID)  missing.push('SQUARE_LOCATION_ID');
    console.error(`[Square] Missing env: ${missing.join(', ')}`);
    return res.status(500).json({ error: `Payment service not configured. Missing: ${missing.join(', ')}` });
  }

  const baseUrl = SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

  const amountCents = Math.round(parseFloat(amount) * 100);

  const payload = {
    source_id:        token,
    idempotency_key:  idempotencyKey || randomUUID(),
    amount_money: {
      amount:   amountCents,
      currency: currency.toUpperCase(),
    },
    location_id:          SQUARE_LOCATION_ID,
    note:                 `HiraStore – ${customer.fullName || 'Customer'}`,
    buyer_email_address:  customer.email  || undefined,
    billing_address: customer.address ? {
      address_line_1: customer.address,
      locality:       customer.city    || '',
      administrative_district_level_1: customer.state || '',
      postal_code:    customer.zip     || '',
      country:        (customer.country || 'US').slice(0, 2).toUpperCase(),
    } : undefined,
  };

  try {
    const sqRes = await fetch(`${baseUrl}/v2/payments`, {
      method:  'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization':  `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await sqRes.json();

    if (!sqRes.ok) {
      const errMsg = data.errors?.[0]?.detail || data.errors?.[0]?.code || 'Payment declined';
      console.error('[Square] Payment error:', JSON.stringify(data.errors));
      return res.status(sqRes.status).json({ error: errMsg });
    }

    return res.status(200).json({
      success:   true,
      paymentId: data.payment?.id,
      status:    data.payment?.status,
      receiptUrl: data.payment?.receipt_url,
    });
  } catch (err) {
    console.error('[Square] Fetch error:', err);
    return res.status(500).json({ error: 'Failed to connect to payment service. Try again.' });
  }
}
