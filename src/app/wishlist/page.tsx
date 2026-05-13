import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/store/cart';
import { useWishlist, WishItem } from '@/store/wishlist';

export default function WishlistPage() {
  const items = useWishlist(s => s.items);
  const toggle = useWishlist(s => s.toggle);
  const addItem = useCart(s => s.addItem);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  function handleAdd(item: WishItem) {
    addItem({ id: item.id, name: item.name, category: item.category, price: item.price, image: item.image });
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(item.id); return s; }), 1600);
  }

  return (
    <div className="wishlist-page">
      <div className="wl-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Wishlist</span>
        </div>
        <h1 className="page-title">My Wishlist</h1>
        <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
      </div>

      <div className="wl-container">
        {items.length === 0 ? (
          <div className="wl-empty">
            <div className="empty-icon">💎</div>
            <h2>Your wishlist is empty</h2>
            <p>Save pieces you love and come back to them anytime.</p>
            <Link to="/shop" className="btn-shop">Browse Jewelry →</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map(item => {
              const isAdded = addedIds.has(item.id);
              return (
                <article key={item.id} className="product-card" role="listitem">
                  <div className="product-img-wrap">
                    <Link to={`/product/${encodeURIComponent(item.id)}`}>
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </Link>
                    <button
                      className="product-wish wished"
                      aria-label={`Remove ${item.name} from wishlist`}
                      onClick={() => toggle(item)}
                    >
                      <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </button>
                    <div className="product-actions">
                      <button
                        className={`product-action-btn pa-primary${isAdded ? ' cart-added' : ''}`}
                        onClick={() => handleAdd(item)}
                      >
                        {isAdded ? 'Added ✓' : 'Add to Cart'}
                      </button>
                      <Link to={`/product/${encodeURIComponent(item.id)}`} className="product-action-btn pa-secondary">
                        Quick View
                      </Link>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{item.name}</h3>
                    <p className="product-meta">{item.category}</p>
                    <div className="product-price">
                      <span className="price-current">${Number(item.price).toLocaleString('en-US')}</span>
                    </div>
                    <div className="product-rating"><span className="stars">★★★★★</span></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .wishlist-page { background:#fff; min-height:100vh; }
        .wl-header { padding:48px 48px 32px; max-width:1296px; margin:0 auto; }
        .breadcrumb { font-size:12px; color:#888; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .breadcrumb a { color:#888; transition:color .2s; text-decoration:none; }
        .breadcrumb a:hover { color:#005969; }
        .breadcrumb-sep { opacity:.4; }
        .page-title { font-family:'Playfair Display',serif; font-size:clamp(28px,4vw,42px); font-weight:700; color:#2c2c2c; line-height:1.1; }
        .page-subtitle { font-size:14px; color:#888; margin-top:8px; }
        .wl-container { max-width:1296px; margin:0 auto; padding:0 48px 80px; }

        .products-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:28px; }

        /* === identical to shop === */
        --gold: #c9a96e; --gold-dark: #a07840; --ease-out: cubic-bezier(0.33,1,0.68,1);
        .product-card { cursor:pointer; will-change:transform; transition:box-shadow 0.35s var(--ease-out); }
        .product-card:hover { box-shadow:0 24px 56px rgba(0,0,0,0.14),0 0 0 1px rgba(0,89,105,0.18); }
        .product-img-wrap { position:relative; overflow:hidden; aspect-ratio:3/4; background:#f8f7f5; }
        .product-img-wrap img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s var(--ease-out); display:block; }
        .product-card:hover .product-img-wrap img { transform:scale(1.07); }

        .product-wish { position:absolute; top:12px; right:12px; width:36px; height:36px; background:rgba(255,255,255,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; opacity:0; transform:scale(0.5); transition:opacity 0.2s,transform 0.4s cubic-bezier(0.34,1.56,0.64,1); border:none; cursor:pointer; }
        .product-card:hover .product-wish { opacity:1; transform:scale(1); }
        .product-wish:hover { transform:scale(1.12)!important; }
        .product-wish svg { width:18px; height:18px; fill:none; stroke:#c9a96e; stroke-width:1.8; }
        .product-wish.wished svg { fill:#e04040; stroke:#e04040; }

        .product-actions { position:absolute; bottom:0; left:0; right:0; background:rgba(255,255,255,0.96); padding:14px; transform:translateY(100%); transition:transform 0.35s var(--ease-out); display:flex; gap:10px; }
        .product-card:hover .product-actions { transform:translateY(0); }
        .product-action-btn { flex:1; padding:10px; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; transition:background 0.2s,color 0.2s,border-color 0.2s; cursor:pointer; border:none; font-family:inherit; text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center; }
        .product-action-btn.pa-primary { background:#c9a96e; color:#fff; }
        .product-action-btn.pa-primary:hover { background:#a07840; }
        .product-action-btn.pa-primary.cart-added { background:#2eaa6e; }
        .product-action-btn.pa-secondary { border:1.5px solid #e5e5e5; color:#2c2c2c; background:transparent; }
        .product-action-btn.pa-secondary:hover { border-color:#c9a96e; color:#c9a96e; }

        .product-info { padding:18px 4px 4px; }
        .product-name { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#2c2c2c; margin-bottom:5px; transition:color 0.25s; }
        .product-card:hover .product-name { color:#a07840; }
        .product-meta { font-size:12px; color:#737373; margin-bottom:10px; }
        .product-price { display:flex; align-items:center; gap:10px; }
        .price-current { font-size:15px; font-weight:600; color:#2c2c2c; }
        .product-rating { display:flex; align-items:center; gap:5px; margin-top:8px; }
        .stars { color:#c9a96e; font-size:13px; letter-spacing:1px; }

        .wl-empty { text-align:center; padding:80px 20px; }
        .empty-icon { font-size:56px; margin-bottom:20px; opacity:0.3; }
        .wl-empty h2 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#2c2c2c; margin-bottom:10px; }
        .wl-empty p { color:#888; margin-bottom:28px; font-size:14px; }
        .btn-shop { display:inline-flex; align-items:center; gap:8px; padding:13px 32px; background:#005969; color:#fff; font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; border-radius:3px; transition:background .2s; text-decoration:none; }
        .btn-shop:hover { background:#003d4a; }

        @media(max-width:1024px) { .products-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:768px) { .products-grid { grid-template-columns:repeat(2,1fr); gap:16px; } .wl-container { padding:0 20px 60px; } .wl-header { padding:32px 20px 20px; } }
        @media(max-width:480px) { .products-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
      `}</style>
    </div>
  );
}
