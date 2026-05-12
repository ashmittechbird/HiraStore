'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMe, getCustomerOrders, logout } from '@/lib/api';

interface Order { name: string; transaction_date: string; grand_total: number; status: string; }
interface Me { fullName: string; email: string; }

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(user => {
      if (!user) { router.push('/login'); return; }
      setMe(user);
      getCustomerOrders().then(d => setOrders(d.orders || [])).catch(() => {});
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading…</div>;

  return (
    <div className="account-page">
      <div className="account-header">
        <div>
          <h1 className="account-title">My Account</h1>
          <p className="account-sub">Welcome back, {me?.fullName}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
      </div>

      <div className="account-grid">
        {/* Profile */}
        <div className="account-card">
          <h3 className="card-title">Profile</h3>
          <div className="profile-info">
            <div className="profile-row"><span>Name</span><span>{me?.fullName}</span></div>
            <div className="profile-row"><span>Email</span><span>{me?.email}</span></div>
          </div>
        </div>

        {/* Orders */}
        <div className="account-card orders-card">
          <h3 className="card-title">Order History</h3>
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders yet.</p>
              <Link href="/shop" className="btn-shop-link">Start Shopping →</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(o => (
                <div key={o.name} className="order-row">
                  <div>
                    <div className="order-id">{o.name}</div>
                    <div className="order-date">{new Date(o.transaction_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className={`order-status ${o.status?.toLowerCase().replace(/\s+/g, '-')}`}>{o.status}</span>
                  </div>
                  <div className="order-total">${Number(o.grand_total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .account-page { max-width:1000px;margin:0 auto;padding:48px 24px; }
        .account-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px; }
        .account-title { font-family:var(--font-head);font-size:32px;font-weight:400; }
        .account-sub { font-size:14px;color:var(--text-light);margin-top:4px; }
        .btn-logout { padding:10px 20px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text-light);cursor:pointer;background:none;transition:all .2s; }
        .btn-logout:hover { border-color:#dc2626;color:#dc2626; }
        .account-grid { display:grid;grid-template-columns:300px 1fr;gap:24px; }
        .account-card { background:#fff;border:1px solid var(--border);border-radius:12px;padding:24px; }
        .card-title { font-family:var(--font-head);font-size:18px;font-weight:500;margin-bottom:20px; }
        .profile-row { display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--surface);font-size:14px; }
        .profile-row span:first-child { color:var(--text-light); }
        .profile-row span:last-child { font-weight:500; }
        .no-orders { text-align:center;padding:32px;color:var(--text-light); }
        .btn-shop-link { display:inline-block;margin-top:12px;color:var(--accent-gold);font-weight:600; }
        .orders-list { display:flex;flex-direction:column;gap:0; }
        .order-row { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--surface);gap:16px; }
        .order-id { font-size:13px;font-weight:600; }
        .order-date { font-size:12px;color:var(--text-light);margin-top:2px; }
        .order-status { font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#e0f2f4;color:#005969; }
        .order-total { font-size:14px;font-weight:600; }
        @media(max-width:768px) { .account-grid{grid-template-columns:1fr} }
      `}</style>
    </div>
  );
}
