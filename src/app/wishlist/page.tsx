'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchItem, itemImage, itemPrice, itemName, itemCategory, itemId } from '@/lib/api';
import { useCart } from '@/store/cart';

interface Product { name?: string; item_name?: string; item_group?: string; category?: string; standard_rate?: number; price_usd?: number; price?: number; image?: string; product_id?: string; [key: string]: unknown; }

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCart(s => s.addItem);

  useEffect(() => {
    (async () => {
      const ids: string[] = JSON.parse(localStorage.getItem('hs_wishlist') || '[]');
      const products = await Promise.all(ids.map(id => fetchItem(id).catch(() => null)));
      setItems(products.filter(Boolean) as Product[]);
      setLoading(false);
    })();
  }, []);

  function removeFromWishlist(id: string) {
    const ids: string[] = JSON.parse(localStorage.getItem('hs_wishlist') || '[]');
    localStorage.setItem('hs_wishlist', JSON.stringify(ids.filter(x => x !== id)));
    setItems(prev => prev.filter(p => itemId(p as Parameters<typeof itemId>[0]) !== id));
  }

  function handleAdd(item: Product) {
    const id = itemId(item as Parameters<typeof itemId>[0]);
    addItem({ id, name: itemName(item as Parameters<typeof itemName>[0]), category: itemCategory(item as Parameters<typeof itemCategory>[0]), price: itemPrice(item as Parameters<typeof itemPrice>[0]), image: itemImage(item as Parameters<typeof itemImage>[0]) });
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
      </div>

      {loading ? (
        <div className="wl-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="wl-skel" />)}</div>
      ) : items.length === 0 ? (
        <div className="wl-empty">
          <p>Your wishlist is empty.</p>
          <Link href="/shop" className="btn-shop">Browse Jewelry →</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {items.map(item => {
            const id = itemId(item as Parameters<typeof itemId>[0]);
            return (
              <div key={id} className="wl-card">
                <Link href={`/product/${encodeURIComponent(id)}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={itemImage(item as Parameters<typeof itemImage>[0])} alt={itemName(item as Parameters<typeof itemName>[0])} className="wl-img" />
                </Link>
                <div className="wl-info">
                  <div className="wl-cat">{itemCategory(item as Parameters<typeof itemCategory>[0])}</div>
                  <Link href={`/product/${encodeURIComponent(id)}`} className="wl-name">{itemName(item as Parameters<typeof itemName>[0])}</Link>
                  <div className="wl-price">${Number(itemPrice(item as Parameters<typeof itemPrice>[0])).toLocaleString('en-US')}</div>
                  <div className="wl-actions">
                    <button className="btn-add-cart" onClick={() => handleAdd(item)}>Add to Cart</button>
                    <button className="btn-remove" onClick={() => removeFromWishlist(id)}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .wishlist-page { max-width:1200px;margin:0 auto;padding:48px 24px; }
        .wishlist-header { margin-bottom:40px; }
        .wishlist-header h1 { font-family:var(--font-head);font-size:32px;font-weight:400;margin-bottom:4px; }
        .wishlist-header p { font-size:14px;color:var(--text-light); }
        .wl-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
        .wl-card { border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#fff;transition:box-shadow .3s; }
        .wl-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); }
        .wl-img { width:100%;aspect-ratio:1;object-fit:cover;display:block; }
        .wl-info { padding:16px; }
        .wl-cat { font-size:11px;color:var(--text-light);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px; }
        .wl-name { display:block;font-family:var(--font-head);font-size:15px;font-weight:500;margin-bottom:6px;color:var(--text-main); }
        .wl-price { font-size:15px;font-weight:600;margin-bottom:14px; }
        .wl-actions { display:flex;gap:8px; }
        .btn-add-cart { flex:1;padding:9px;background:var(--text-main);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:background .2s; }
        .btn-add-cart:hover { background:var(--accent-gold); }
        .btn-remove { padding:9px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;color:var(--text-light);cursor:pointer;background:none;transition:all .2s; }
        .btn-remove:hover { border-color:#dc2626;color:#dc2626; }
        .wl-empty { text-align:center;padding:80px 24px; }
        .wl-empty p { color:var(--text-light);margin-bottom:20px; }
        .btn-shop { display:inline-flex;padding:12px 28px;background:var(--text-main);color:#fff;border-radius:6px;font-size:13px;font-weight:600;transition:background .2s; }
        .btn-shop:hover { background:var(--accent-gold); }
        .wl-skel { height:320px;border-radius:12px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @media(max-width:768px) { .wl-grid{grid-template-columns:repeat(2,1fr)} }
      `}</style>
    </div>
  );
}
