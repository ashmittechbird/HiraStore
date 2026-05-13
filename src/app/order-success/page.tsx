import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface OrderData {
  orderId: string;
  customer: { fullName: string; email: string; address: string; city: string; state: string; zip: string };
  total: number;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem('hs_order_success') || 'null');
      if (!data) { navigate('/'); return; }
      setOrder(data);
    } catch {
      navigate('/');
    }
  }, []);

  if (!order) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading…</div>;

  return (
    <div className="success-page">
      {/* Steps */}
      <div className="steps">
        {['Cart','Details','Payment','Confirmed'].map((s, i) => (
          <div key={s} className={`step${i < 3 ? ' done' : ' active'}`}>
            {i > 0 && <div className="step-div" />}
            <div className="step-num">{i < 3 ? '✓' : '✓'}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="main">
        <div className="success-wrap">
          <div className="check-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" color="#1a8f5a">
              <polyline className="check-path" points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-sub">Thank you for shopping with The Hira Store.<br/>Your order has been received and is being processed.</p>

          <div className="order-card">
            <div className="order-card-head">
              <div>
                <div className="order-num-label">Order Number</div>
                <div className="order-num">{order.orderId}</div>
              </div>
              <div className="order-status">Confirmed</div>
            </div>
            <div className="order-totals">
              <div className="tot-row"><span>Delivery to</span><span>{order.customer.address}, {order.customer.city}</span></div>
              <div className="tot-row"><span>Email</span><span>{order.customer.email}</span></div>
              <div className="tot-row"><span>Payment</span><span>Cash on Delivery</span></div>
              <div className="tot-row grand"><span>Total</span><span className="val">${order.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="next-card">
            <div className="next-title">What happens next?</div>
            <div className="next-steps">
              {[
                { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>, text: "You'll receive an email confirmation shortly." },
                { icon: <><rect x="1" y="3" width="13" height="13"/><polygon points="13 3 20 3 23 6 23 16 13 16 13 3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></>, text: 'Your order will be packed and dispatched within 2–3 business days.' },
                { icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>, text: 'Track your order from your account once it ships.' },
              ].map((step, i) => (
                <div key={i} className="next-step">
                  <div className="next-step-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{step.icon}</svg>
                  </div>
                  {step.text}
                </div>
              ))}
            </div>
          </div>

          <div className="actions">
            <Link to="/account" className="btn-primary">View My Orders</Link>
            <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>

      <style>{`
        .success-page { background:#f8fbfc;min-height:100vh;display:flex;flex-direction:column; }
        .steps { display:flex;justify-content:center;gap:0;padding:28px 0 8px;background:#fff;border-bottom:1px solid #ddeef1;flex-wrap:wrap; }
        .step { display:flex;align-items:center;gap:8px;font-size:13px;color:#6b8b91;padding:0 4px; }
        .step.done { color:#007a8c; }
        .step.active { color:#1a8f5a;font-weight:500; }
        .step-num { width:24px;height:24px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0; }
        .step.done .step-num,.step.active .step-num { background:currentColor;color:#fff;border-color:currentColor; }
        .step-div { width:40px;height:1px;background:#c8e0e4;flex-shrink:0; }
        .main { flex:1;display:flex;align-items:flex-start;justify-content:center;padding:48px 24px; }
        .success-wrap { max-width:640px;width:100%; }
        .check-circle { width:80px;height:80px;border-radius:50%;background:#edfaf3;border:2px solid #a3e6c7;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:popIn .5s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .check-circle svg { width:40px;height:40px; }
        .check-path { stroke-dasharray:50;stroke-dashoffset:50;animation:drawCheck .4s .3s ease forwards; }
        @keyframes drawCheck { to{stroke-dashoffset:0} }
        .success-title { font-family:'Playfair Display',serif;font-size:2rem;color:#005969;text-align:center;font-weight:400;margin-bottom:8px; }
        .success-sub { font-size:15px;color:#6b8b91;text-align:center;margin-bottom:32px;line-height:1.6; }
        .order-card { background:#fff;border-radius:10px;border:1px solid #ddeef1;box-shadow:0 2px 24px rgba(0,26,32,.09);margin-bottom:20px;overflow:hidden; }
        .order-card-head { padding:20px 24px;border-bottom:1px solid #ddeef1;display:flex;justify-content:space-between;align-items:center; }
        .order-num-label { font-size:12px;font-weight:500;color:#6b8b91;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px; }
        .order-num { font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:#005969;font-weight:500; }
        .order-status { display:inline-flex;align-items:center;gap:6px;background:#edfaf3;color:#1a8f5a;border:1px solid #a3e6c7;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500; }
        .order-status::before { content:'';width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block; }
        .order-totals { padding:14px 24px; }
        .tot-row { display:flex;justify-content:space-between;font-size:13px;color:#6b8b91;margin-bottom:6px; }
        .tot-row.grand { font-size:16px;color:#334d52;font-weight:500;margin-top:8px;padding-top:8px;border-top:1px solid #ddeef1;margin-bottom:0; }
        .tot-row.grand .val { font-family:'Cormorant Garamond',serif;color:#005969;font-size:18px; }
        .next-card { background:#f0f8f9;border-radius:10px;border:1px solid #ddeef1;padding:24px;margin-bottom:24px; }
        .next-title { font-size:14px;font-weight:500;color:#334d52;margin-bottom:14px; }
        .next-steps { display:flex;flex-direction:column;gap:10px; }
        .next-step { display:flex;gap:12px;align-items:flex-start;font-size:13px;color:#6b8b91;line-height:1.5; }
        .next-step-icon { width:28px;height:28px;border-radius:50%;background:#e0f2f4;border:1px solid #ddeef1;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;color:#005969; }
        .next-step-icon svg { width:14px;height:14px; }
        .actions { display:flex;gap:12px; }
        .btn-primary { flex:1;padding:14px 20px;background:#005969;color:#fff;font-size:15px;font-weight:500;border:none;border-radius:6px;cursor:pointer;text-align:center;text-decoration:none;display:inline-block;transition:background .2s; }
        .btn-primary:hover { background:#003d4a; }
        .btn-outline { flex:1;padding:14px 20px;background:transparent;color:#334d52;font-size:15px;font-weight:500;border:1.5px solid #c8e0e4;border-radius:6px;cursor:pointer;text-align:center;text-decoration:none;display:inline-block;transition:border-color .2s,color .2s; }
        .btn-outline:hover { border-color:#005969;color:#005969; }
        @media(max-width:480px) { .actions{flex-direction:column} .step{font-size:11px} .step-div{width:20px} }
      `}</style>
    </div>
  );
}
