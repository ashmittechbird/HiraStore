'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderData {
  orderId: string;
  customer: { fullName: string; email: string; address: string; city: string; state: string; zip: string };
  total: number;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem('hs_order_success') || 'null');
      if (!data) { router.push('/'); return; }
      setOrder(data);
    } catch {
      router.push('/');
    }
  }, [router]);

  if (!order) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading…</div>;

  return (
    <div className="success-page">
      <div className="success-card">
        {/* Check icon */}
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-sub">Thank you, {order.customer.fullName}! Your order has been placed.</p>

        <div className="order-id-box">
          <span className="oid-label">Order ID</span>
          <span className="oid-val">{order.orderId}</span>
        </div>

        <div className="order-details">
          <div className="detail-row">
            <span>Email confirmation sent to</span>
            <span>{order.customer.email}</span>
          </div>
          <div className="detail-row">
            <span>Delivery address</span>
            <span>{order.customer.address}, {order.customer.city}</span>
          </div>
          <div className="detail-row">
            <span>Order total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Payment</span>
            <span>Cash on Delivery</span>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/account" className="btn-orders">View My Orders</Link>
          <Link href="/shop" className="btn-continue">Continue Shopping</Link>
        </div>
      </div>

      <style>{`
        .success-page { min-height:80vh;display:flex;align-items:center;justify-content:center;padding:48px 24px;background:#f8fbfc; }
        .success-card { background:#fff;border-radius:16px;padding:56px 40px;max-width:520px;width:100%;text-align:center;box-shadow:0 4px 40px rgba(0,89,105,.1); }
        .success-icon { width:72px;height:72px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px; }
        .success-icon svg { width:36px;height:36px; }
        .success-title { font-family:'Playfair Display',serif;font-size:32px;font-weight:400;color:#005969;margin-bottom:12px; }
        .success-sub { font-size:15px;color:#6b8b91;margin-bottom:32px;line-height:1.6; }
        .order-id-box { display:inline-flex;align-items:center;gap:12px;background:#f0f8f9;border:1px solid #c8e0e4;border-radius:8px;padding:12px 24px;margin-bottom:32px; }
        .oid-label { font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#6b8b91;font-weight:600; }
        .oid-val { font-size:15px;font-weight:700;color:#005969;font-family:monospace; }
        .order-details { border:1px solid #ddeef1;border-radius:10px;overflow:hidden;margin-bottom:32px;text-align:left; }
        .detail-row { display:flex;justify-content:space-between;padding:14px 20px;font-size:13px;border-bottom:1px solid #ddeef1; }
        .detail-row:last-child { border-bottom:none; }
        .detail-row span:first-child { color:#6b8b91; }
        .detail-row span:last-child { font-weight:600;color:#334d52; }
        .success-actions { display:flex;gap:12px;flex-direction:column; }
        .btn-orders { padding:14px;background:#005969;color:#fff;border-radius:8px;font-size:14px;font-weight:600;transition:background .2s;text-transform:uppercase;letter-spacing:.06em; }
        .btn-orders:hover { background:#003d4a; }
        .btn-continue { padding:14px;border:1.5px solid #c8e0e4;color:#334d52;border-radius:8px;font-size:14px;font-weight:500;transition:all .2s; }
        .btn-continue:hover { border-color:#005969;color:#005969; }
      `}</style>
    </div>
  );
}
