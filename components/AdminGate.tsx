'use client';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { useSite } from './SiteStore';
import { AdminSessionProvider, type AdminUser } from './admin/ui';
import { AdminProviders } from './admin/kit';
import { isRole } from '@/lib/permissions';

const OWNER: AdminUser = { id: 'owner', name: 'Chủ website', role: 'owner' };
/** Người đang đăng nhập theo phản hồi /api/admin/session/ */
function userOf(s: { user?: { id?: unknown; name?: unknown; role?: unknown } }): AdminUser {
  const u = s.user;
  return u && isRole(u.role) ? { id: String(u.id || ''), name: String(u.name || 'Quản trị viên'), role: u.role } : OWNER;
}

/* Màn đăng nhập quản trị theo DANAVA WORK (dự án Trello): thẻ lớn chia đôi — trái là bầu trời,
   mặt trời/mặt trăng và đồi núi; phải là form trắng có vệt sáng theo chuột, nút ngày/đêm,
   nút cam có ánh lướt. Admin DANAVA chỉ dùng một mật khẩu nên form chỉ có ô mật khẩu. */

// Vị trí sao cố định (không dùng Math.random để server và trình duyệt render giống nhau)
const STARS = [
  [8, 12, 2], [14, 48, 1.5], [22, 80, 2.5], [6, 66, 1], [30, 30, 1.5], [18, 92, 2], [38, 58, 1], [12, 22, 1],
  [44, 8, 2], [26, 70, 1.5], [52, 40, 1], [34, 88, 2], [4, 38, 1.5], [48, 76, 1], [40, 20, 2.5], [56, 62, 1.5],
  [20, 4, 1], [28, 50, 2], [10, 84, 1.5], [46, 28, 1],
];

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { refresh } = useSite();
  const [state, setState] = useState<'loading' | 'setup' | 'login' | 'ready'>('loading'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false),
    [dark, setDark] = useState(false),
    [glow, setGlow] = useState({ x: -999, y: -999 }),
    [user, setUser] = useState<AdminUser>(OWNER);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('danava-login-theme') === 'dark') setDark(true);
    } catch {}
    fetch('/api/admin/session/', { cache: 'no-store' })
      .then((r) => r.json())
      .then(async (s) => {
        if (s.authenticated) {
          setUser(userOf(s));
          await refresh();
          setState('ready');
        } else setState(s.configured ? 'login' : 'setup');
      })
      .catch(() => {
        setError('Không kết nối được máy chủ.');
        setState('login');
      });
  }, []);

  function toggleTheme() {
    setDark((v) => {
      try {
        localStorage.setItem('danava-login-theme', v ? 'light' : 'dark');
      } catch {}
      return !v;
    });
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') || '');
    const username = String(form.get('username') || '').trim().toLowerCase();
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(username ? { username, password } : { password }),
      });
      const v = await r.json();
      if (!r.ok) throw Error(v.error);
      setUser(userOf(v));
      await refresh();
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại. Kiểm tra lại mật khẩu.');
    }
    setBusy(false);
  }

  if (state === 'ready') return <AdminSessionProvider user={user}><AdminProviders>{children}</AdminProviders></AdminSessionProvider>;

  const brand = (
    <>
      <img src="/assets/danava-logo-trim.png" alt="DANAVA Solutions" width={554} height={135} className="wl-logo" />
      <span className="wl-badge">ADMIN</span>
    </>
  );

  return (
    <div className={`wl${dark ? ' is-dark' : ''}`}>
      <div className="wl-halo" aria-hidden="true" />

      <div className="wl-card">
        {/* ---------- Trái: bầu trời & núi ---------- */}
        <div className="wl-art" aria-hidden="false">
          <div className="wl-sky" aria-hidden="true" />
          <div className="wl-stars" aria-hidden="true">
            {STARS.map(([top, left, size], i) => (
              <i key={i} style={{ top: `${top}%`, left: `${left}%`, width: size, height: size, animationDelay: `${(i % 7) * 0.4}s` }} />
            ))}
          </div>
          <div className="wl-orb" aria-hidden="true">
            <i />
            <i />
          </div>
          <div className="wl-hills" aria-hidden="true">
            <span className="wl-hill wl-hill--3" />
            <span className="wl-hill wl-hill--2" />
            <span className="wl-hill wl-hill--1" />
          </div>
          <div className="wl-brand">
            <div className="wl-brand-row">{brand}</div>
            <p>Bảng điều khiển website DANAVA. Nội dung, khách hàng và thống kê ở một nơi.</p>
          </div>
        </div>

        {/* ---------- Phải: form ---------- */}
        <div
          ref={formRef}
          className="wl-form-side"
          onMouseMove={(e) => {
            const r = formRef.current?.getBoundingClientRect();
            if (r) setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          style={{ ['--gx' as string]: `${glow.x}px`, ['--gy' as string]: `${glow.y}px` }}
        >
          <div className="wl-glow" aria-hidden="true" />
          <button type="button" className="wl-theme" onClick={toggleTheme} aria-label={dark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}>
            <Sun size={18} className="wl-theme-sun" />
            <Moon size={18} className="wl-theme-moon" />
          </button>

          <div className="wl-form">
            <div className="wl-mobile-brand">{brand}</div>
            <div className="wl-head">
              <h1>{state === 'setup' ? 'Thiết lập quản trị' : 'Đăng nhập'}</h1>
              <p>{state === 'setup' ? 'Máy chủ chưa có mật khẩu quản trị.' : 'Dùng tài khoản được cấp, hoặc mật khẩu chủ website'}</p>
            </div>

            {error && (
              <div role="alert" className="wl-error">
                <span>!</span>
                <span>{error}</span>
              </div>
            )}

            {state === 'loading' ? (
              <p className="wl-note">
                <Loader2 size={18} className="wl-spin" /> Đang kiểm tra phiên làm việc…
              </p>
            ) : state === 'setup' ? (
              <p className="wl-note">
                Chạy <code>CHAY-WEB.bat</code> (hoặc <code>npm run local</code>) để đặt mật khẩu, hoặc xem hướng dẫn triển khai trong README.
                Chức năng sửa dữ liệu đang được khóa.
              </p>
            ) : (
              <form onSubmit={login} className="wl-fields">
                <label className="wl-field">
                  <span>Tên đăng nhập <small className="wl-optional">để trống nếu là chủ website</small></span>
                  <span className="wl-input">
                    <input name="username" type="text" autoComplete="username" maxLength={32} autoCapitalize="none" spellCheck={false} placeholder="vd. trang.cskh" />
                  </span>
                </label>
                <label className="wl-field">
                  <span>Mật khẩu</span>
                  <span className="wl-input">
                    <input
                      name="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={256}
                      autoFocus
                      placeholder="••••••••"
                      className={show ? 'is-shown' : undefined}
                    />
                    <button
                      type="button"
                      className={`wl-eye${show ? ' is-on' : ''}`}
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-pressed={show}
                    >
                      {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </span>
                </label>

                <button type="submit" className="wl-cta" disabled={busy}>
                  <span className="wl-shimmer" aria-hidden="true" />
                  <span className="wl-cta-label">
                    {busy ? (
                      <Loader2 size={20} className="wl-spin" />
                    ) : (
                      <>
                        Đăng nhập <ArrowRight size={18} className="wl-arrow" aria-hidden="true" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            <a className="wl-back" href="/">
              ← Trở lại website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
