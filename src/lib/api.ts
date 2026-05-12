const BASE = '';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hs_session_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { 'X-Session-Token': token } : {};
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.token) localStorage.setItem('hs_session_token', data.token);
  return data;
}

export async function signup(fullName: string, email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function logout() {
  const token = getToken();
  if (token) {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
    });
  }
  localStorage.removeItem('hs_session_token');
}

export async function getMe() {
  const res = await fetch(`${BASE}/api/auth/me`, { headers: authHeaders() as HeadersInit });
  if (!res.ok) return null;
  return res.json();
}

// ─── ORDERS ────────────────────────────────────────────────────────────────────

export async function createOrder(payload: object) {
  const res = await fetch(`${BASE}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as object) },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order failed');
  return data;
}

export async function getCustomerOrders() {
  const res = await fetch(`${BASE}/api/customer/orders`, { headers: authHeaders() as HeadersInit });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateProfile(payload: object) {
  const res = await fetch(`${BASE}/api/customer/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders() as object) },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

// ─── COUPONS ───────────────────────────────────────────────────────────────────

export async function validateCoupon(code: string, cartTotal: number) {
  const res = await fetch(`${BASE}/api/coupon/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, cartTotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid coupon');
  return data;
}

// ─── HOMEPAGE ──────────────────────────────────────────────────────────────────

export async function getHomepageSections() {
  try {
    const res = await fetch(`${BASE}/api/homepage/sections`);
    if (!res.ok) return { most_loved: [], new_arrivals: [] };
    return res.json();
  } catch {
    return { most_loved: [], new_arrivals: [] };
  }
}

// ─── PRODUCTS (direct ERPNext via proxy) ───────────────────────────────────────

const ERP_BASE = '/erp';
const FIELDS = ['name','item_name','item_group','description','standard_rate','custom_short_description','custom_material','custom_is_featured','image','disabled'];

export async function fetchItems(filters: unknown[][] = [], limit = 20, orderBy = 'modified desc') {
  const params = new URLSearchParams({
    fields: JSON.stringify(FIELDS),
    filters: JSON.stringify([...filters, ['disabled', '=', 0]]),
    limit_page_length: String(limit),
    order_by: orderBy,
  });
  try {
    const res = await fetch(`${ERP_BASE}/api/resource/Item?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('ERP error');
    const data = await res.json();
    return data.data || [];
  } catch {
    // Fallback to local JSON
    const res = await fetch('/catalog_images/products.json');
    if (!res.ok) return [];
    const items = await res.json();
    return items.filter((p: { status?: string; disabled?: boolean }) =>
      !p.disabled && (p.status === 'Available' || p.status === 'available')
    ).slice(0, limit);
  }
}

export async function fetchItem(name: string) {
  try {
    const res = await fetch(`${ERP_BASE}/api/resource/Item/${encodeURIComponent(name)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    return data.data;
  } catch {
    const res = await fetch('/catalog_images/products.json');
    if (!res.ok) return null;
    const items = await res.json();
    return items.find((p: { product_id?: string; name?: string }) =>
      p.product_id === name || p.name === name
    ) || null;
  }
}

export function itemImage(item: { image?: string }) {
  if (!item.image) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=85';
  if (item.image.startsWith('http')) return item.image;
  if (item.image.startsWith('/files/')) return `${ERP_BASE}${item.image}`;
  return `/catalog_images/${item.image}`;
}

export function itemPrice(item: { standard_rate?: number; price_usd?: number; price?: number }) {
  return item.standard_rate || item.price_usd || item.price || 0;
}

export function itemName(item: { item_name?: string; name?: string }) {
  return item.item_name || item.name || '';
}

export function itemCategory(item: { item_group?: string; category?: string }) {
  return item.item_group || item.category || '';
}

export function itemId(item: { name?: string; product_id?: string }) {
  return item.name || item.product_id || '';
}
