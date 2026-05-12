import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&q=85" alt="Our Story" className="about-hero-img" />
        <div className="about-hero-content">
          <p className="hero-eyebrow">Our Story</p>
          <h1 className="hero-title">Crafted with<br />Passion &amp; Purpose</h1>
        </div>
      </section>

      {/* Story */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-text">
            <h2 className="section-heading">Who We Are</h2>
            <p>The Hira Store was founded with a simple belief: fine jewelry should be accessible, wearable, and meaningful. Every piece in our collection is handcrafted by skilled artisans using BIS hallmarked sterling silver.</p>
            <p>We source our materials ethically and work closely with local craftspeople to create jewelry that tells a story — your story.</p>
          </div>
          <div className="about-img-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&q=85" alt="Artisan crafting jewelry" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="values-inner">
          <h2 className="section-heading center">Our Values</h2>
          <div className="values-grid">
            {[
              { icon: '🛡️', title: 'Quality First', text: '100% BIS hallmarked silver. Every piece certified and tested.' },
              { icon: '🌿', title: 'Ethical Sourcing', text: 'Responsibly sourced materials with fair wages for every artisan.' },
              { icon: '✨', title: 'Timeless Design', text: 'Pieces designed to be worn every day, for a lifetime.' },
              { icon: '💛', title: 'Customer Love', text: '30-day returns, 1-year warranty, free shipping on every order.' },
            ].map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to find your piece?</h2>
        <Link href="/shop" className="cta-btn">Shop the Collection</Link>
      </section>

      <style>{`
        .about-page {}
        .about-hero { position:relative;height:60vh;min-height:400px;display:flex;align-items:center;justify-content:center;overflow:hidden; }
        .about-hero-img { position:absolute;inset:0;width:100%;height:100%;object-fit:cover; }
        .about-hero-overlay { position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:1; }
        .about-hero-content { position:relative;z-index:2;text-align:center;color:#fff; }
        .hero-eyebrow { font-size:11px;letter-spacing:.25em;text-transform:uppercase;font-weight:600;margin-bottom:16px;color:#f0ebe1; }
        .hero-title { font-family:var(--font-head);font-size:clamp(36px,5vw,60px);font-weight:400;line-height:1.15; }
        .about-section { max-width:1100px;margin:0 auto;padding:80px 40px; }
        .about-grid { display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center; }
        .about-text h2 { font-family:var(--font-head);font-size:32px;font-weight:400;margin-bottom:24px; }
        .about-text p { font-size:15px;color:var(--text-light);line-height:1.8;margin-bottom:16px; }
        .about-img-wrap { border-radius:12px;overflow:hidden; }
        .about-img-wrap img { width:100%;height:400px;object-fit:cover; }
        .values-section { background:var(--surface);padding:80px 40px; }
        .values-inner { max-width:1100px;margin:0 auto; }
        .section-heading { font-family:var(--font-head);font-size:clamp(24px,3vw,32px);font-weight:400;margin-bottom:48px; }
        .section-heading.center { text-align:center; }
        .values-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:32px; }
        .value-card { text-align:center;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid var(--border); }
        .value-icon { font-size:36px;margin-bottom:16px; }
        .value-card h3 { font-family:var(--font-head);font-size:18px;font-weight:500;margin-bottom:10px; }
        .value-card p { font-size:13px;color:var(--text-light);line-height:1.6; }
        .about-cta { text-align:center;padding:80px 40px;background:#1a1a1a;color:#fff; }
        .about-cta h2 { font-family:var(--font-head);font-size:32px;font-weight:400;margin-bottom:28px; }
        .cta-btn { display:inline-flex;padding:16px 48px;background:var(--accent-gold);color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;transition:background .3s; }
        .cta-btn:hover { background:#b8946a; }
        @media(max-width:768px) { .about-grid{grid-template-columns:1fr} .values-grid{grid-template-columns:repeat(2,1fr)} .about-section{padding:60px 24px} }
      `}</style>
    </div>
  );
}
