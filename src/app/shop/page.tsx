'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCart } from '@/store/cart';
import { fetchItems, itemImage, itemPrice, itemName, itemCategory, itemId } from '@/lib/api';

interface Product {
  name?: string; item_name?: string; item_group?: string; category?: string;
  standard_rate?: number; price_usd?: number; price?: number;
  image?: string; product_id?: string; disabled?: boolean; status?: string;
  [key: string]: unknown;
}

const CATEGORIES = ['All', 'Earrings', 'Necklaces', 'Rings', 'Bracelets', 'Pendants', 'Bangles', 'Sets', 'Accessories'];

function normalizeCategory(cat?: string) {
  if (!cat) return 'Other';
  const c = cat.toLowerCase();
  if (c.includes('earring') || c.includes('ear cuff')) return 'Earrings';
  if (c.includes('necklace') || c.includes('choker')) return 'Necklaces';
  if (c.includes('bracelet')) return 'Bracelets';
  if (c.includes('pendant')) return 'Pendants';
  if (c.includes('bangle')) return 'Bangles';
  if (c.includes('ring') && !c.includes('earring')) return 'Rings';
  if (c.includes('set')) return 'Sets';
  if (['accessories','anklet','charm','hair','waist','arm','toe','bag','watch'].some(w => c.includes(w))) return 'Accessories';
  return 'Other';
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'All';
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'local'>('local');
  const addItem = useCart(s => s.addItem);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cursor sparkle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: { x: number; y: number; r: number; a: number; vx: number; vy: number; life: number }[] = [];
    const onMove = (e: MouseEvent) => {
      for (let i = 0; i < 3; i++) {
        particles.push({ x: e.clientX, y: e.clientY, r: Math.random() * 4 + 1, a: 1, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 - 1, life: 1 });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.vy += 0.1;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,89,105,${p.life * 0.7})`;
        ctx.fill();
      }
      requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', onMove);
    const raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await fetchItems([['is_sales_item', '=', 1]], 500, 'modified desc');
        setAllProducts(items);
        setDataSource(items.some((p: Product) => p.standard_rate !== undefined) ? 'live' : 'local');
      } catch {
        setAllProducts([]);
      }
      setLoading(false);
    })();
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...allProducts];
    if (category !== 'All') {
      result = result.filter(p => normalizeCategory(itemCategory(p as Parameters<typeof itemCategory>[0])) === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        itemName(p as Parameters<typeof itemName>[0]).toLowerCase().includes(q) ||
        itemCategory(p as Parameters<typeof itemCategory>[0]).toLowerCase().includes(q)
      );
    }
    if (sort === 'price-asc') result.sort((a, b) => itemPrice(a as Parameters<typeof itemPrice>[0]) - itemPrice(b as Parameters<typeof itemPrice>[0]));
    else if (sort === 'price-desc') result.sort((a, b) => itemPrice(b as Parameters<typeof itemPrice>[0]) - itemPrice(a as Parameters<typeof itemPrice>[0]));
    else if (sort === 'name-asc') result.sort((a, b) => itemName(a as Parameters<typeof itemName>[0]).localeCompare(itemName(b as Parameters<typeof itemName>[0])));
    setFiltered(result);
  }, [allProducts, category, search, sort]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  function handleAdd(item: Product) {
    const id = itemId(item as Parameters<typeof itemId>[0]);
    addItem({ id, name: itemName(item as Parameters<typeof itemName>[0]), category: itemCategory(item as Parameters<typeof itemCategory>[0]), price: itemPrice(item as Parameters<typeof itemPrice>[0]), image: itemImage(item as Parameters<typeof itemImage>[0]) });
    setAddedIds(prev => new Set(prev).add(id));
    setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  }

  return (
    <>
      <canvas ref={canvasRef} id="cursorSparkle" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />
      <div className="scroll-progress" id="scrollProgress" />

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Shop</span>
          </div>
          <h1 className="page-title">Our Collection</h1>
          <p className="page-subtitle">Handcrafted jewelry for every moment</p>
        </div>
        <div>
          <span className={`data-source-badge ${dataSource}`}>
            <span className="dot" />
            {dataSource === 'live' ? 'Live from ERPNext' : 'Local Catalog'}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shop-toolbar">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          <input className="search-input" placeholder="Search jewelry…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
        <span className="product-count">
          <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="shop-filters">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`filter-btn${category === cat ? ' active' : ''}`} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="shop-grid-wrap">
        {loading ? (
          <div className="shop-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card skel-card">
                <div className="product-img skel" />
                <div className="product-body">
                  <div className="skel" style={{ height: '16px', width: '80%', marginBottom: '8px', borderRadius: '4px' }} />
                  <div className="skel" style={{ height: '12px', width: '40%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3>No products found</h3>
            <p>Try a different category or search term</p>
            <button className="btn-reset" onClick={() => { setCategory('All'); setSearch(''); }}>Reset Filters</button>
          </div>
        ) : (
          <div className="shop-grid">
            {filtered.map(item => {
              const id = itemId(item as Parameters<typeof itemId>[0]);
              const name = itemName(item as Parameters<typeof itemName>[0]);
              const price = itemPrice(item as Parameters<typeof itemPrice>[0]);
              const img = itemImage(item as Parameters<typeof itemImage>[0]);
              const cat = normalizeCategory(itemCategory(item as Parameters<typeof itemCategory>[0]));
              const isAdded = addedIds.has(id);
              return (
                <div key={id} className="product-card">
                  <Link href={`/product/${encodeURIComponent(id)}`} className="product-img-link">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} className="product-img" loading="lazy" />
                    <div className="product-overlay">
                      <span>View Details</span>
                    </div>
                  </Link>
                  <div className="product-body">
                    <span className="product-cat">{cat}</span>
                    <h3 className="product-name">{name}</h3>
                    <div className="product-footer">
                      <span className="product-price">${Number(price).toLocaleString('en-US')}</span>
                      <button className={`btn-add-cart${isAdded ? ' added' : ''}`} onClick={() => handleAdd(item)}>
                        {isAdded ? '✓ Added' : '+ Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        :root { --gold:#005969;--gold-dark:#003d4a;--gold-light:#007a8c;--surface:#faf8f5;--border:#e8e0d8;--text:#555;--text-dark:#2c2c2c;--text-light:#888; }
        .scroll-progress { position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-light));z-index:101; }
        .page-header { padding:60px 48px 40px;max-width:1296px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px; }
        .breadcrumb { font-size:12px;color:var(--text-light);margin-bottom:12px;display:flex;align-items:center;gap:8px; }
        .breadcrumb a:hover { color:var(--gold); }
        .breadcrumb-sep { opacity:0.4; }
        .page-title { font-family:'Nunito',sans-serif;font-size:clamp(32px,4vw,48px);font-weight:800;color:var(--text-dark);line-height:1.1; }
        .page-subtitle { font-size:15px;color:var(--text-light);margin-top:8px; }
        .data-source-badge { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600; }
        .data-source-badge.live { background:#e8f5e9;color:#2e7d32; }
        .data-source-badge.local { background:#fff8e1;color:#f57f17; }
        .data-source-badge .dot { width:7px;height:7px;border-radius:50%; }
        .data-source-badge.live .dot { background:#4caf50; }
        .data-source-badge.local .dot { background:#ffa000; }

        .shop-toolbar { max-width:1296px;margin:0 auto 24px;padding:0 48px;display:flex;align-items:center;gap:16px;flex-wrap:wrap; }
        .search-wrap { position:relative;flex:1;min-width:220px;max-width:400px; }
        .search-wrap svg { position:absolute;left:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;fill:none;stroke:var(--text-light);stroke-width:2;pointer-events:none; }
        .search-input { width:100%;padding:10px 14px 10px 40px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text-dark);background:var(--surface);outline:none;transition:border-color .2s; }
        .search-input:focus { border-color:var(--gold); }
        .sort-select { padding:10px 36px 10px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;color:var(--text-dark);background:var(--surface);appearance:none;outline:none;cursor:pointer; }
        .product-count { margin-left:auto;font-size:13px;color:var(--text-light); }
        .product-count strong { color:var(--text-dark);font-weight:600; }

        .shop-filters { max-width:1296px;margin:0 auto 32px;padding:0 48px;display:flex;gap:10px;flex-wrap:wrap; }
        .filter-btn { padding:8px 20px;border-radius:24px;border:1.5px solid var(--border);font-size:13px;font-weight:500;color:var(--text);background:#fff;cursor:pointer;transition:all .2s; }
        .filter-btn:hover,.filter-btn.active { background:var(--gold);color:#fff;border-color:var(--gold); }

        .shop-grid-wrap { max-width:1296px;margin:0 auto;padding:0 48px; }
        .shop-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:32px; }
        .product-card { border-radius:12px;overflow:hidden;background:#fff;border:1px solid var(--border);transition:box-shadow .3s,transform .3s;display:flex;flex-direction:column; }
        .product-card:hover { box-shadow:0 8px 32px rgba(0,89,105,.12);transform:translateY(-4px); }
        .product-img-link { position:relative;display:block;aspect-ratio:1;overflow:hidden;background:var(--surface); }
        .product-img { width:100%;height:100%;object-fit:cover;transition:transform .5s; }
        .product-card:hover .product-img { transform:scale(1.06); }
        .product-overlay { position:absolute;inset:0;background:rgba(0,89,105,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s; }
        .product-overlay span { color:#fff;font-size:13px;font-weight:600;letter-spacing:.05em;text-transform:uppercase; }
        .product-card:hover .product-overlay { opacity:1; }
        .product-body { padding:16px;display:flex;flex-direction:column;gap:6px;flex:1; }
        .product-cat { font-size:11px;color:var(--text-light);text-transform:uppercase;letter-spacing:.08em; }
        .product-name { font-family:'Nunito',sans-serif;font-size:15px;font-weight:700;color:var(--text-dark);line-height:1.3;flex:1; }
        .product-footer { display:flex;align-items:center;justify-content:space-between;margin-top:8px; }
        .product-price { font-size:16px;font-weight:700;color:var(--gold); }
        .btn-add-cart { padding:7px 14px;background:var(--gold);color:#fff;border-radius:6px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:background .2s; }
        .btn-add-cart:hover { background:var(--gold-dark); }
        .btn-add-cart.added { background:#16a34a; }

        .skel { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite; }
        .skel-card .product-img { height:200px;display:block; }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }

        .empty-state { text-align:center;padding:80px 24px;color:var(--text-light); }
        .empty-state h3 { font-size:20px;font-weight:700;margin-bottom:8px;color:var(--text-dark); }
        .btn-reset { margin-top:20px;padding:10px 28px;background:var(--gold);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer; }

        @media (max-width:1024px) { .shop-grid{grid-template-columns:repeat(3,1fr)} }
        @media (max-width:768px) { .shop-grid{grid-template-columns:repeat(2,1fr)} .shop-toolbar,.shop-filters,.shop-grid-wrap,.page-header{padding-left:20px;padding-right:20px} }
        @media (max-width:480px) { .shop-grid{grid-template-columns:repeat(2,1fr);gap:16px} }
      `}</style>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}
