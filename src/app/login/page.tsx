'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, getMe } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getMe().then(me => { if (me) router.replace('/account'); });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password required'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.push('/account');
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://wearparts.norework.in/wp-content/uploads/2023/09/Hira-1.png" alt="Hira" className="auth-logo" />
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
        <p className="auth-switch">
          <Link href="/">← Back to store</Link>
        </p>
      </div>

      <style>{authStyles}</style>
    </div>
  );
}

const authStyles = `
  .auth-page { min-height:80vh;display:flex;align-items:center;justify-content:center;padding:48px 24px;background:var(--surface); }
  .auth-card { background:#fff;border-radius:16px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 4px 40px rgba(0,0,0,.08);text-align:center; }
  .auth-logo { height:48px;margin:0 auto 24px;filter:contrast(1.2); }
  .auth-title { font-family:var(--font-head);font-size:28px;font-weight:400;margin-bottom:8px; }
  .auth-sub { font-size:14px;color:var(--text-light);margin-bottom:32px; }
  .auth-form { text-align:left; }
  .form-group { margin-bottom:20px; }
  .form-group label { display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-main);margin-bottom:8px; }
  .form-group input { width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;font-family:var(--font-body);outline:none;transition:border-color .2s; }
  .form-group input:focus { border-color:var(--accent-gold); }
  .form-error { background:#fef2f2;color:#dc2626;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:16px; }
  .btn-submit { width:100%;padding:14px;background:var(--text-main);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s;text-transform:uppercase;letter-spacing:.08em; }
  .btn-submit:hover:not(:disabled) { background:var(--accent-gold); }
  .btn-submit:disabled { opacity:.6;cursor:not-allowed; }
  .auth-switch { font-size:13px;color:var(--text-light);margin-top:20px; }
  .auth-switch a { color:var(--accent-gold);font-weight:600; }
`;
