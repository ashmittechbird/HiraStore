'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchItems, itemName, itemPrice, itemImage, itemCategory, itemId } from '@/lib/api';

interface Product { name?: string; item_name?: string; item_group?: string; standard_rate?: number; image?: string; disabled?: boolean; [key: string]: unknown; }
interface Order { name: string; customer_name: string; grand_total: number; status: string; transaction_date: string; }

const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hirastore123';

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [tab, setTab] = useState<'orders' | 'items' | 'homepage'>('orders');
  const [items, setItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('hs_admin') === '1') setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PW) {
      sessionStorage.setItem('hs_admin', '1');
      setAuthed(true);
    } else {
      setPwError('Incorrect password');
    }
  }

  useEffect(() => {
    if (!authed) return;
    if (tab === 'items') {
      setLoading(true);
      fetchItems([], 100).then(d => { setItems(d); setLoading(false); });
    }
    if (tab === 'orders') {
      setLoading(true);
      fetch('/api/customer/orders', { headers: {} }).then(r => r.json()).then(d => {
        setOrders(d.orders || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [authed, tab]);

  if (!authed) return (
    <div className="admin-login">
      <form onSubmit={handleLogin} className="admin-login-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://wearparts.norework.in/wp-content/uploads/2023/09/Hira-1.png" alt="Hira" style={{ height: '48px', margin: '0 auto 24px', display: 'block', filter: 'contrast(1.2)' }} />
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 400, textAlign: 'center', marginBottom: '24px' }}>Admin Panel</h2>
        <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '8px' }}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" className="admin-input" autoFocus />
        {pwError && <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>{pwError}</div>}
        <button type="submit" className="admin-btn" style={{ marginTop: '20px' }}>Enter Admin</button>
      </form>
      <style>{adminStyles}</style>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <span style={{ fontFamily: 'var(--font-head)', fontSize: '20px' }}>Admin Panel</span>
        <button className="admin-btn-sm" onClick={() => { sessionStorage.removeItem('hs_admin'); setAuthed(false); }}>Sign Out</button>
      </div>

      <div className="admin-tabs">
        {(['orders', 'items', 'homepage'] as const).map(t => (
          <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading && <div className="admin-loading">Loading…</div>}

        {tab === 'orders' && !loading && (
          orders.length === 0 ? <div className="admin-empty">No orders yet.</div> : (
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.name}>
                    <td className="mono">{o.name}</td>
                    <td>{o.customer_name}</td>
                    <td>${Number(o.grand_total).toFixed(2)}</td>
                    <td><span className="status-badge">{o.status}</span></td>
                    <td>{new Date(o.transaction_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'items' && !loading && (
          <div className="admin-items-grid">
            {items.map(item => (
              <div key={itemId(item as Parameters<typeof itemId>[0])} className="admin-item-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemImage(item as Parameters<typeof itemImage>[0])} alt={itemName(item as Parameters<typeof itemName>[0])} className="admin-item-img" />
                <div className="admin-item-info">
                  <div className="admin-item-name">{itemName(item as Parameters<typeof itemName>[0])}</div>
                  <div className="admin-item-cat">{itemCategory(item as Parameters<typeof itemCategory>[0])}</div>
                  <div className="admin-item-price">${Number(itemPrice(item as Parameters<typeof itemPrice>[0])).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'homepage' && !loading && (
          <div style={{ padding: '24px', color: 'var(--text-light)' }}>
            <p>Homepage curation is managed via the server API.</p>
            <p style={{ marginTop: '8px' }}>Use the <code>/api/homepage/sections</code> endpoint to curate featured products.</p>
          </div>
        )}
      </div>

      <style>{adminStyles}</style>
    </div>
  );
}

const adminStyles = `
  .admin-login { min-height:80vh;display:flex;align-items:center;justify-content:center;background:var(--surface); }
  .admin-login-card { background:#fff;border-radius:16px;padding:48px 40px;width:100%;max-width:380px;box-shadow:0 4px 40px rgba(0,0,0,.08); }
  .admin-input { width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;outline:none;font-family:var(--font-body); }
  .admin-input:focus { border-color:var(--accent-gold); }
  .admin-btn { width:100%;padding:13px;background:var(--text-main);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;text-transform:uppercase;letter-spacing:.06em; }
  .admin-btn:hover { background:var(--accent-gold); }
  .admin-page { min-height:80vh; }
  .admin-topbar { display:flex;justify-content:space-between;align-items:center;padding:16px 32px;background:#fff;border-bottom:1px solid var(--border); }
  .admin-btn-sm { padding:8px 16px;background:none;border:1.5px solid var(--border);border-radius:6px;font-size:13px;cursor:pointer;transition:all .2s; }
  .admin-btn-sm:hover { border-color:#dc2626;color:#dc2626; }
  .admin-tabs { display:flex;gap:0;padding:0 32px;background:#fff;border-bottom:1px solid var(--border); }
  .admin-tab { padding:14px 24px;font-size:14px;font-weight:500;border:none;background:none;cursor:pointer;color:var(--text-light);border-bottom:2px solid transparent;transition:all .2s; }
  .admin-tab.active { color:var(--text-main);border-bottom-color:var(--accent-gold); }
  .admin-content { padding:32px; }
  .admin-loading { color:var(--text-light);padding:40px;text-align:center; }
  .admin-empty { color:var(--text-light);padding:40px;text-align:center; }
  .admin-table { width:100%;border-collapse:collapse;font-size:14px; }
  .admin-table th { text-align:left;padding:12px 16px;background:var(--surface);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-light);border-bottom:1px solid var(--border); }
  .admin-table td { padding:14px 16px;border-bottom:1px solid var(--surface); }
  .admin-table tr:hover td { background:#fafafa; }
  .mono { font-family:monospace;font-size:12px; }
  .status-badge { display:inline-flex;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#e0f2f4;color:#005969; }
  .admin-items-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:16px; }
  .admin-item-card { border:1px solid var(--border);border-radius:8px;overflow:hidden;background:#fff; }
  .admin-item-img { width:100%;aspect-ratio:1;object-fit:cover; }
  .admin-item-info { padding:12px; }
  .admin-item-name { font-size:12px;font-weight:600;color:var(--text-main);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .admin-item-cat { font-size:11px;color:var(--text-light);margin-bottom:4px; }
  .admin-item-price { font-size:13px;font-weight:700;color:var(--accent-gold); }
  @media(max-width:768px) { .admin-items-grid{grid-template-columns:repeat(3,1fr)} .admin-content{padding:16px} }
`;
