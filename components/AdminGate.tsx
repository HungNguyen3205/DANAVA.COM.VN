'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { useSite } from './SiteStore';
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { refresh } = useSite();
  const [state, setState] = useState<'loading' | 'setup' | 'login' | 'ready'>('loading'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/admin/session/', { cache: 'no-store' })
      .then((r) => r.json())
      .then(async (s) => {
        if (s.authenticated) {
          await refresh();
          setState('ready');
        } else setState(s.configured ? 'login' : 'setup');
      })
      .catch(() => {
        setError('Không kết nối được máy chủ.');
        setState('login');
      });
  }, []);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const password = new FormData(e.currentTarget).get('password');
    try {
      const r = await fetch('/api/admin/session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const v = await r.json();
      if (!r.ok) throw Error(v.error);
      await refresh();
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể đăng nhập');
    }
    setBusy(false);
  }
  if (state === 'ready') return children;
  const theme = (() => {
    try {
      return localStorage.getItem('danava-admin-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  })();
  return (
    <div className="adm adm-auth" data-theme={state === 'loading' ? 'dark' : theme}>
      <div className="adm-backdrop" aria-hidden="true" />
      <main id="main" className="adm-login">
        <section className="adm-card adm-login-card">
          <div className="adm-login-brand">
            <span className="adm-logo">D</span>
            <div>
              <strong>DANAVA</strong>
              <small>Quản trị website</small>
            </div>
          </div>
          <h1>{state === 'setup' ? 'Thiết lập quản trị' : 'Chào mừng trở lại'}</h1>
          {state === 'loading' ? (
            <p className="adm-login-note">Đang kiểm tra phiên làm việc…</p>
          ) : state === 'setup' ? (
            <p className="adm-login-note">
              Máy chủ chưa có mật khẩu quản trị. Chạy <code>CHAY-WEB.bat</code> (hoặc <code>npm run local</code>) để đặt
              mật khẩu, hoặc xem hướng dẫn triển khai trong README. Chức năng sửa dữ liệu đang được khóa.
            </p>
          ) : (
            <form onSubmit={login}>
              <p className="adm-login-note">Đăng nhập để quản lý nội dung, khách hàng và thống kê website.</p>
              <label className="adm-field">
                <span>Mật khẩu quản trị</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={256}
                  autoFocus
                  placeholder="Nhập mật khẩu"
                />
              </label>
              {error && (
                <p className="adm-login-error" role="alert">
                  {error}
                </p>
              )}
              <button className="adm-btn adm-btn-primary adm-btn-block" disabled={busy}>
                {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </form>
          )}
          {state !== 'login' && error && (
            <p className="adm-login-error" role="alert">
              {error}
            </p>
          )}
          <a className="adm-login-back" href="/">
            ← Trở lại website
          </a>
        </section>
      </main>
    </div>
  );
}
