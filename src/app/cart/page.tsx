'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';
import { validateCoupon } from '@/lib/api';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  const subtotal = totalPrice();
  const shipping = subtotal >= 15 ? 0 : 5;
  const total = subtotal - discount + shipping;

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const data = await validateCoupon(coupon.trim(), subtotal);
      setDiscount(data.discount || 0);
      setCouponMsg(`✓ Coupon applied! You save $${(data.discount || 0).toFixed(2)}`);
    } catch (e: unknown) {
      setCouponMsg((e as Error).message || 'Invalid coupon');
      setDiscount(0);
    }
    setCouponLoading(false);
  }

  function handleRemove(id: string) {
    setRemoving(id);
    setTimeout(() => {
      removeItem(id);
      setRemoving(null);
    }, 350);
  }

  function handleCheckout() {
    // Save coupon/discount to session storage for checkout
    if (discount > 0) {
      sessionStorage.setItem('hs_coupon', JSON.stringify({ code: coupon, discount }));
    }
    router.push('/checkout');
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c8a97e" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link href="/shop" className="btn-shop">Start Shopping</Link>
        </div>
        <style>{cartStyles}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-row">
        <div>
          <nav className="breadcrumb"><Link href="/">Home</Link> / <Link href="/cart">Cart</Link></nav>
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">{totalItems()} item{totalItems() !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-clear" onClick={clearCart}>Clear Cart</button>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className={`cart-item${removing === item.id ? ' removing' : ''}`}>
              <div className="item-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200'} alt={item.name} />
              </div>
              <div className="item-details">
                <div className="item-category">{item.category}</div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">${(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div className="item-controls">
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>

          {shipping > 0 && (
            <div className="free-ship-note">Add ${(15 - subtotal).toFixed(2)} more for free shipping</div>
          )}

          {/* Coupon */}
          <div className="coupon-wrap">
            <input
              className="coupon-input"
              placeholder="Coupon code"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyCoupon()}
            />
            <button className="coupon-btn" onClick={applyCoupon} disabled={couponLoading}>
              {couponLoading ? '…' : 'Apply'}
            </button>
          </div>
          {couponMsg && (
            <div className={`coupon-msg${couponMsg.startsWith('✓') ? ' success' : ' error'}`}>{couponMsg}</div>
          )}

          <button className="btn-checkout" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>
          <Link href="/shop" className="btn-continue">← Continue Shopping</Link>
        </div>
      </div>

      <style>{cartStyles}</style>
    </div>
  );
}

const cartStyles = `
  .cart-page { max-width:1200px;margin:0 auto;padding:48px 24px; }
  .cart-header-row { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px; }
  .breadcrumb { font-size:12px;color:#999;margin-bottom:12px; }
  .breadcrumb a { color:#999;transition:color .2s; }
  .breadcrumb a:hover { color:#2c2c2c; }
  .cart-title { font-family:var(--font-head);font-size:clamp(28px,4vw,36px);font-weight:400; }
  .cart-subtitle { font-size:14px;color:var(--text-light);margin-top:4px; }
  .btn-clear { font-size:12px;color:var(--text-light);text-transform:uppercase;letter-spacing:.08em;text-decoration:underline;cursor:pointer;background:none;border:none; }
  .btn-clear:hover { color:#e04040; }
  .cart-layout { display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:start; }
  .cart-items { display:flex;flex-direction:column;gap:0; }
  .cart-item { display:flex;gap:20px;padding:24px 0;border-bottom:1px solid var(--border);align-items:flex-start;transition:opacity .35s,transform .35s; }
  .cart-item.removing { opacity:0;transform:translateX(20px); }
  .item-img-wrap { width:96px;height:96px;border-radius:8px;overflow:hidden;background:var(--surface);flex-shrink:0; }
  .item-img-wrap img { width:100%;height:100%;object-fit:cover; }
  .item-details { flex:1; }
  .item-category { font-size:11px;color:var(--text-light);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px; }
  .item-name { font-family:var(--font-head);font-size:16px;font-weight:500;margin-bottom:8px; }
  .item-price { font-size:16px;font-weight:600;color:var(--text-main); }
  .item-controls { display:flex;flex-direction:column;align-items:flex-end;gap:12px; }
  .qty-ctrl { display:flex;align-items:center;border:1px solid var(--border);border-radius:6px;overflow:hidden; }
  .qty-btn { width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--text-light);transition:background .15s;cursor:pointer;border:none;background:none; }
  .qty-btn:hover { background:var(--surface);color:var(--text-main); }
  .qty-num { width:36px;text-align:center;font-size:14px;font-weight:500; }
  .remove-btn { font-size:12px;color:var(--text-light);text-decoration:underline;cursor:pointer;background:none;border:none;transition:color .2s; }
  .remove-btn:hover { color:#e04040; }
  .cart-summary { background:var(--surface);border-radius:12px;padding:28px;border:1px solid var(--border);position:sticky;top:90px; }
  .summary-title { font-family:var(--font-head);font-size:20px;font-weight:500;margin-bottom:24px; }
  .summary-row { display:flex;justify-content:space-between;font-size:14px;margin-bottom:12px;color:var(--text-light); }
  .summary-row.discount { color:#16a34a; }
  .summary-row.total { font-size:18px;font-weight:700;color:var(--text-main);border-top:1px solid var(--border);padding-top:16px;margin-top:8px; }
  .free-ship-note { font-size:12px;color:#007a8c;background:#e0f7fa;padding:8px 12px;border-radius:6px;margin-bottom:16px; }
  .coupon-wrap { display:flex;gap:8px;margin-bottom:8px; }
  .coupon-input { flex:1;padding:10px 14px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;outline:none;transition:border-color .2s; }
  .coupon-input:focus { border-color:var(--accent-gold); }
  .coupon-btn { padding:10px 16px;background:var(--text-main);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s; }
  .coupon-btn:hover { background:var(--accent-dark); }
  .coupon-msg { font-size:12px;margin-bottom:12px; }
  .coupon-msg.success { color:#16a34a; }
  .coupon-msg.error { color:#e04040; }
  .btn-checkout { width:100%;padding:16px;background:var(--text-main);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em; }
  .btn-checkout:hover { background:var(--accent-gold); }
  .btn-continue { display:block;text-align:center;font-size:13px;color:var(--text-light);transition:color .2s; }
  .btn-continue:hover { color:var(--text-main); }
  .empty-cart { text-align:center;padding:120px 24px; }
  .empty-cart h2 { font-family:var(--font-head);font-size:28px;font-weight:400;margin:24px 0 12px; }
  .empty-cart p { color:var(--text-light);margin-bottom:32px; }
  .btn-shop { display:inline-flex;align-items:center;padding:14px 36px;background:var(--text-main);color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;border-radius:2px;transition:background .3s; }
  .btn-shop:hover { background:var(--accent-gold); }
  @media(max-width:768px) { .cart-layout{grid-template-columns:1fr} .cart-summary{position:static} }
`;
