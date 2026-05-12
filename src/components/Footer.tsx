'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://wearparts.norework.in/wp-content/uploads/2023/09/Hira-1.png" alt="The Hira Store" />
          <p className="footer-text">Handcrafted fine jewelry designed for every day. Each piece tells a story of elegance and artistry.</p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
            <a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.24-5.24 1.24-5.24s-.32-.63-.32-1.57c0-1.47.85-2.57 1.91-2.57.9 0 1.34.68 1.34 1.49 0 .91-.58 2.27-.88 3.53-.25 1.05.52 1.91 1.56 1.91 1.87 0 3.13-2.4 3.13-5.23 0-2.16-1.46-3.67-3.55-3.67-2.42 0-3.84 1.82-3.84 3.7 0 .73.28 1.52.63 1.94.07.08.08.16.06.24l-.24.96c-.04.15-.12.18-.28.11-1.04-.48-1.69-2-1.69-3.22 0-2.62 1.9-5.02 5.48-5.02 2.88 0 5.12 2.05 5.12 4.79 0 2.86-1.8 5.16-4.3 5.16-.84 0-1.63-.44-1.9-.95l-.52 1.93c-.19.71-.69 1.61-1.03 2.15.78.24 1.6.37 2.45.37 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/shop">All Jewelry</Link></li>
            <li><Link href="/shop?cat=Necklaces">Necklaces</Link></li>
            <li><Link href="/shop?cat=Earrings">Earrings</Link></li>
            <li><Link href="/shop?cat=Rings">Rings</Link></li>
            <li><Link href="/shop?cat=Bracelets">Bracelets</Link></li>
            <li><Link href="/shop?cat=GiftSets">Gift Sets</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/account">My Account</Link></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Stay in Touch</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
            Subscribe for exclusive offers, new arrivals and jewelry care tips.
          </p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom" style={{ maxWidth: '1300px', margin: '0 auto', marginTop: '60px' }}>
        <span>© {new Date().getFullYear()} The Hira Store. All rights reserved.</span>
        <span>Handcrafted with ♥</span>
      </div>

      <style>{`
        footer { background: #effcff; color: var(--text-main); padding: 80px 40px 40px; border-top: 1px solid var(--border); }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr; gap: 60px; max-width: 1300px; margin: 0 auto; }
        .footer-brand img { height: 62px; margin-bottom: 24px; filter: contrast(1.2); }
        .footer-text { font-size: 13px; color: var(--text-light); line-height: 1.6; margin-bottom: 24px; max-width: 300px; }
        .footer-social { display: flex; gap: 16px; }
        .footer-social a { color: var(--text-main); transition: color 0.3s; }
        .footer-social a:hover { color: var(--accent-gold); }
        .footer-social svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.5; }
        .footer-col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; margin-bottom: 20px; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 12px; }
        .footer-col ul li a { font-size: 13px; color: var(--text-light); transition: color 0.3s; }
        .footer-col ul li a:hover { color: var(--accent-gold); }
        .newsletter-form { display: flex; border-bottom: 1px solid var(--text-main); padding-bottom: 8px; margin-top: 16px; }
        .newsletter-form input { flex: 1; border: none; background: transparent; font-size: 13px; font-family: var(--font-body); outline: none; }
        .newsletter-form button { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-main); }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; text-align: center; font-size: 12px; color: var(--text-light); display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          footer { padding: 60px 20px 40px; }
          .footer-bottom { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </footer>
  );
}
