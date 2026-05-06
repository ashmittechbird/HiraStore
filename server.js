// HiraStore local dev server
// Serves static files + proxies /erp/* to ERPNext + customer auth API
// Run: node server.js   then open http://localhost:5500

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const url     = require('url');
const crypto  = require('crypto');

const PORT        = 5500;
const ERP_HOST    = '127.0.0.1';
const ERP_PORT    = 8001;
const API_KEY     = 'df4ffcff00dcb5d';
const API_SECRET  = '054316891a5f19f';
const AUTH_HEADER = `token ${API_KEY}:${API_SECRET}`;

// ─── SESSION STORE ────────────────────────────────────────────────────────────
// token -> { frappeSid, email, fullName, expires }
const sessions = new Map();

function genToken() { return crypto.randomBytes(32).toString('hex'); }

function getSession(req) {
  const token = req.headers['x-session-token'];
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expires < Date.now()) { sessions.delete(token); return null; }
  return s;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((res, rej) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => res(d));
    req.on('error', rej);
  });
}

function jsonRes(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// Call ERPNext with admin API key (returns { status, body })
function erpAdmin(method, erpPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: ERP_HOST, port: ERP_PORT, path: erpPath, method,
      headers: {
        'Authorization': AUTH_HEADER,
        'Accept':        'application/json',
        'Content-Type':  'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(d || '{}') }); }
        catch(e) { resolve({ status: r.statusCode, body: { raw: d } }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Call ERPNext with Frappe session cookie
function erpSession(method, erpPath, sid, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: ERP_HOST, port: ERP_PORT, path: erpPath, method,
      headers: {
        'Cookie':       'sid=' + sid,
        'Accept':       'application/json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(d || '{}') }); }
        catch(e) { resolve({ status: r.statusCode, body: { raw: d } }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── AUTH HANDLERS ────────────────────────────────────────────────────────────
async function handleLogin(req, res) {
  const body = JSON.parse(await readBody(req));
  const { email, password } = body;
  if (!email || !password) return jsonRes(res, 400, { error: 'email and password required' });

  // POST to Frappe login
  const loginResult = await new Promise((resolve, reject) => {
    const postData = JSON.stringify({ usr: email, pwd: password });
    const opts = {
      hostname: ERP_HOST, port: ERP_PORT,
      path: '/api/method/login', method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Accept':         'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const r = http.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => resolve({ status: resp.statusCode, headers: resp.headers, body: d }));
    });
    r.on('error', reject);
    r.write(postData);
    r.end();
  });

  if (loginResult.status !== 200) {
    return jsonRes(res, 401, { error: 'Invalid email or password' });
  }

  // Extract sid cookie
  const setCookies = loginResult.headers['set-cookie'] || [];
  let sid = null;
  for (const c of setCookies) {
    const m = c.match(/sid=([^;]+)/);
    if (m && m[1] !== 'Guest') { sid = m[1]; break; }
  }
  if (!sid) return jsonRes(res, 401, { error: 'Login failed — no session returned' });

  // Get user full name
  const userRes = await erpSession('GET',
    `/api/resource/User/${encodeURIComponent(email)}?fields=["full_name","user_image","email"]`,
    sid);
  const fullName = userRes.body?.data?.full_name || email;

  // Store session (7 days)
  const token = genToken();
  sessions.set(token, { frappeSid: sid, email, fullName, expires: Date.now() + 7 * 86400000 });

  jsonRes(res, 200, { token, email, fullName });
}

function handleLogout(req, res) {
  const token = req.headers['x-session-token'];
  if (token) sessions.delete(token);
  jsonRes(res, 200, { ok: true });
}

function handleMe(req, res) {
  const sess = getSession(req);
  if (!sess) return jsonRes(res, 401, { error: 'Not logged in' });
  jsonRes(res, 200, { email: sess.email, fullName: sess.fullName });
}

// ─── CUSTOMER HANDLERS ────────────────────────────────────────────────────────
async function handleCustomerOrders(req, res) {
  const sess = getSession(req);
  if (!sess) return jsonRes(res, 401, { error: 'Not logged in' });

  const fields   = encodeURIComponent(JSON.stringify(["name","creation","grand_total","status","delivery_date","customer_name","contact_email"]));
  const filters  = encodeURIComponent(JSON.stringify([["contact_email","=",sess.email]]));
  const r = await erpAdmin('GET', `/api/resource/Sales Order?fields=${fields}&filters=${filters}&limit=50&order_by=creation desc`);
  jsonRes(res, 200, r.body);
}

async function handleCustomerProfile(req, res) {
  const sess = getSession(req);
  if (!sess) return jsonRes(res, 401, { error: 'Not logged in' });

  const body = JSON.parse(await readBody(req));

  // Find customer by email
  const custFilter = encodeURIComponent(JSON.stringify([["email_id","=",sess.email]]));
  const custRes = await erpAdmin('GET', `/api/resource/Customer?filters=${custFilter}&fields=["name"]&limit=1`);
  const customers = custRes.body?.data || [];

  if (customers.length) {
    // Upsert address
    await erpAdmin('POST', '/api/resource/Address', {
      address_title: sess.fullName + ' Shipping',
      address_type:  'Shipping',
      address_line1: body.address || '',
      city:          body.city    || '',
      state:         body.state   || '',
      pincode:       body.zip     || '',
      country:       body.country || 'India',
      phone:         body.phone   || '',
      email_id:      sess.email,
      links: [{ link_doctype: 'Customer', link_name: customers[0].name }],
    });
  }

  jsonRes(res, 200, { ok: true });
}

// ─── OFFERS / COUPON HANDLERS ─────────────────────────────────────────────────
async function handleOffers(req, res) {
  try {
    const today  = new Date().toISOString().split('T')[0];
    const fields = encodeURIComponent(JSON.stringify(["name","coupon_code","coupon_type","discount_percentage","minimum_amount","valid_from","valid_upto","description"]));
    const filters = encodeURIComponent(JSON.stringify([["valid_upto",">=",today]]));
    const r = await erpAdmin('GET', `/api/resource/Coupon Code?fields=${fields}&filters=${filters}&limit=20`);
    jsonRes(res, 200, r.body);
  } catch (e) {
    jsonRes(res, 200, { data: [] });
  }
}

async function handleCouponValidate(req, res) {
  const body = JSON.parse(await readBody(req));
  const { code, amount } = body;
  if (!code) return jsonRes(res, 400, { error: 'code required' });

  try {
    const today  = new Date().toISOString().split('T')[0];
    const fields = encodeURIComponent(JSON.stringify(["name","coupon_code","coupon_type","discount_percentage","minimum_amount"]));
    const filters = encodeURIComponent(JSON.stringify([["coupon_code","=",code],["valid_upto",">=",today]]));
    const r = await erpAdmin('GET', `/api/resource/Coupon Code?fields=${fields}&filters=${filters}&limit=1`);
    const coupon = r.body?.data?.[0];

    if (!coupon) return jsonRes(res, 404, { error: 'Invalid or expired coupon code' });
    if (coupon.minimum_amount && parseFloat(amount) < coupon.minimum_amount) {
      return jsonRes(res, 400, { error: `Minimum order $${coupon.minimum_amount} required for this coupon` });
    }

    const discount = coupon.discount_percentage
      ? (parseFloat(amount) * coupon.discount_percentage / 100).toFixed(2)
      : '0.00';

    jsonRes(res, 200, { valid: true, coupon, discount });
  } catch (e) {
    jsonRes(res, 500, { error: 'Could not validate coupon' });
  }
}

// ─── ORDER CREATION ───────────────────────────────────────────────────────────
async function handleCreateOrder(req, res) {
  const body = JSON.parse(await readBody(req));
  const { customer, cart, paymentId, discount, couponCode } = body;

  if (!customer || !cart?.length) {
    return jsonRes(res, 400, { error: 'customer and cart required' });
  }

  try {
    // Find or create Customer
    const custFilter = encodeURIComponent(JSON.stringify([["customer_name","=",customer.fullName]]));
    const custRes = await erpAdmin('GET', `/api/resource/Customer?filters=${custFilter}&fields=["name"]&limit=1`);

    if (!custRes.body?.data?.length) {
      await erpAdmin('POST', '/api/resource/Customer', {
        customer_name:  customer.fullName,
        customer_type:  'Individual',
        customer_group: 'Individual',
        territory:      'All Territories',
        email_id:       customer.email,
      });
    }

    const today        = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const delivDate    = deliveryDate.toISOString().split('T')[0];

    const remarks = [
      `Address: ${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}, ${customer.country || 'India'}`,
      customer.phone ? `Phone: ${customer.phone}` : '',
      paymentId ? `Square Payment ID: ${paymentId}` : '',
      couponCode ? `Coupon: ${couponCode} (Discount: $${discount || '0'})` : '',
    ].filter(Boolean).join(' | ');

    const orderData = {
      customer:          customer.fullName,
      transaction_date:  today,
      delivery_date:     delivDate,
      contact_email:     customer.email,
      contact_mobile:    customer.phone,
      remarks,
      items: cart.map(item => ({
        item_code:  item.name || item.id,
        item_name:  item.item_name || item.name,
        qty:        item.qty || 1,
        rate:       parseFloat(item.price_usd || item.price || 0),
        uom:        'Nos',
      })),
    };

    const orderRes = await erpAdmin('POST', '/api/resource/Sales Order', orderData);

    if (orderRes.status !== 200) {
      console.error('[ERP Order]', JSON.stringify(orderRes.body));
      return jsonRes(res, 500, { error: 'ERP order creation failed', detail: orderRes.body?.exception || orderRes.body });
    }

    jsonRes(res, 200, { ok: true, orderName: orderRes.body?.data?.name });
  } catch (e) {
    console.error('[CreateOrder]', e.message);
    jsonRes(res, 500, { error: e.message });
  }
}

// ─── ERPNext PROXY ────────────────────────────────────────────────────────────
function proxyToERP(req, res, erpPath) {
  const options = {
    hostname: ERP_HOST,
    port:     ERP_PORT,
    path:     erpPath,
    method:   req.method,
    headers: {
      'Authorization': AUTH_HEADER,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
    },
  };

  const erpReq = http.request(options, erpRes => {
    res.writeHead(erpRes.statusCode, {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    erpRes.pipe(res);
  });

  erpReq.on('error', err => {
    console.error('ERPNext proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ERPNext unreachable: ' + err.message }));
  });

  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(erpReq);
  } else {
    erpReq.end();
  }
}

// ─── MAIN SERVER ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url);
  const pathname = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Session-Token',
    });
    res.end();
    return;
  }

  // ── API ROUTES ──
  if (pathname === '/api/auth/login'  && req.method === 'POST')
    return handleLogin(req, res).catch(e => jsonRes(res, 500, { error: e.message }));

  if (pathname === '/api/auth/logout' && req.method === 'POST')
    return handleLogout(req, res);

  if (pathname === '/api/auth/me'     && req.method === 'GET')
    return handleMe(req, res);

  if (pathname === '/api/customer/orders'  && req.method === 'GET')
    return handleCustomerOrders(req, res).catch(e => jsonRes(res, 500, { error: e.message }));

  if (pathname === '/api/customer/profile' && req.method === 'POST')
    return handleCustomerProfile(req, res).catch(e => jsonRes(res, 500, { error: e.message }));

  if (pathname === '/api/offers'          && req.method === 'GET')
    return handleOffers(req, res).catch(e => jsonRes(res, 200, { data: [] }));

  if (pathname === '/api/coupon/validate' && req.method === 'POST')
    return handleCouponValidate(req, res).catch(e => jsonRes(res, 500, { error: e.message }));

  if (pathname === '/api/orders/create'   && req.method === 'POST')
    return handleCreateOrder(req, res).catch(e => jsonRes(res, 500, { error: e.message }));

  // ── ERPNext PROXY ──
  if (pathname.startsWith('/erp/')) {
    const erpPath = pathname.replace('/erp', '') + (parsed.search || '');
    proxyToERP(req, res, erpPath);
    return;
  }

  // ── STATIC FILES ──
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nHiraStore running at http://localhost:${PORT}\n`);
  console.log(`ERPNext proxied via http://localhost:${PORT}/erp/ → http://${ERP_HOST}:${ERP_PORT}`);
  console.log(`Customer auth API: POST /api/auth/login | GET /api/auth/me | POST /api/auth/logout`);
  console.log(`Orders API: POST /api/orders/create | GET /api/customer/orders`);
  console.log(`Offers API: GET /api/offers | POST /api/coupon/validate\n`);
});
