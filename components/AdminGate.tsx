'use client';
import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Moon, Send, Sun, UserRound } from 'lucide-react';
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

/* Màn đăng nhập quản trị "Cất cánh cùng DANAVA" (app/admin/admin-login.css):
   bầu trời kem ấm có mây và quầng sáng trôi; biểu tượng DANAVA ở giữa, các sản phẩm của hệ sinh thái bay quanh
   theo quỹ đạo, máy bay giấy kéo vệt cam; thẻ kính bên phải là form. Nút ngày/đêm (ban đêm: trời navy có sao).
   Toàn bộ chuyển động tắt khi người dùng bật "giảm chuyển động". */

/** Sản phẩm bay quanh biểu tượng (góc đặt trên quỹ đạo, độ). */
const ORBIT = [
  { name: 'DANAVA Studio', note: 'Phòng tập', a: -90, tone: 'orange' },
  { name: 'DANAVA GO', note: 'Vé xe khách', a: -18, tone: 'blue' },
  { name: 'Website', note: 'Thiết kế riêng', a: 54, tone: 'sky' },
  { name: 'Marketing', note: 'Truyền thông', a: 126, tone: 'orange' },
  { name: 'ANNA', note: 'Trợ lý AI', a: 198, tone: 'blue' },
] as const;

// Vị trí sao / mây cố định (server và trình duyệt render giống nhau)
const STARS = [
  [8, 12, 2], [14, 48, 1.5], [22, 80, 2.5], [6, 66, 1], [30, 30, 1.5], [18, 92, 2], [38, 58, 1], [12, 22, 1],
  [44, 8, 2], [26, 70, 1.5], [52, 40, 1], [34, 88, 2], [4, 38, 1.5], [48, 76, 1], [40, 20, 2.5], [56, 62, 1.5],
  [64, 14, 1], [72, 86, 2], [80, 46, 1.5], [88, 28, 1], [68, 66, 1.5], [92, 74, 2],
];

function greeting(h: number) {
  if (h < 11) return 'Chào buổi sáng';
  if (h < 13) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { refresh } = useSite();
  const [state, setState] = useState<'loading' | 'setup' | 'login' | 'ready'>('loading'),
    [error, setError] = useState(''),
    [shake, setShake] = useState(0),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false),
    [caps, setCaps] = useState(false),
    [dark, setDark] = useState(false),
    [hello, setHello] = useState('Xin chào'),
    [user, setUser] = useState<AdminUser>(OWNER);

  useEffect(() => {
    try {
      if (localStorage.getItem('danava-login-theme') === 'dark') setDark(true);
    } catch {}
    setHello(greeting(new Date().getHours()));
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

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') || '');
    const username = String(form.get('username') || '').trim().toLowerCase();
    if (!password) {
      fail('Vui lòng nhập mật khẩu.');
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
      fail(e instanceof Error && e.message ? e.message : 'Đăng nhập thất bại. Kiểm tra lại mật khẩu.');
    }
    setBusy(false);
  }

  const capsCheck = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.('CapsLock') ?? false);

  if (state === 'ready') return <AdminSessionProvider user={user}><AdminProviders>{children}</AdminProviders></AdminSessionProvider>;

  return (
    <div className={`lg${dark ? ' is-dark' : ''}`}>
      {/* ---------- Bầu trời ---------- */}
      <div className="lg-sky" aria-hidden="true">
        <span className="lg-blob lg-blob--a" />
        <span className="lg-blob lg-blob--b" />
        <span className="lg-blob lg-blob--c" />
        <span className="lg-cloud lg-cloud--a" />
        <span className="lg-cloud lg-cloud--b" />
        <span className="lg-cloud lg-cloud--c" />
        <span className="lg-glider"><span className="lg-glider__trail" /><Send size={20} strokeWidth={2.2} /></span>
        <span className="lg-stars">
          {STARS.map(([top, left, size], i) => (
            <i key={i} style={{ top: `${top}%`, left: `${left}%`, width: size, height: size, animationDelay: `${(i % 7) * 0.45}s` }} />
          ))}
        </span>
      </div>

      <header className="lg-top">
        <a className="lg-back" href="/"><ArrowLeft size={16} aria-hidden="true" /> Trở lại website</a>
        <button type="button" className="lg-theme" onClick={toggleTheme} aria-label={dark ? 'Chuyển giao diện ban ngày' : 'Chuyển giao diện ban đêm'} aria-pressed={dark}>
          <Sun size={17} className="lg-theme__sun" aria-hidden="true" />
          <Moon size={17} className="lg-theme__moon" aria-hidden="true" />
        </button>
      </header>

      <main className="lg-wrap">
        {/* ---------- Câu chuyện + quỹ đạo hệ sinh thái ---------- */}
        <section className="lg-story" aria-label="DANAVA Solutions">
          <p className="lg-eyebrow">DANAVA Solutions · Bảng điều khiển</p>
          <p className="lg-title">Chào mừng trở lại,<br /><em>người kiến tạo.</em></p>
          <p className="lg-lead">Website, khách hàng, sản phẩm và báo cáo: mọi thứ để DANAVA cất cánh, ở cùng một nơi.</p>

          <div className="lg-orbit" aria-hidden="true">
            <span className="lg-ring lg-ring--outer" />
            <span className="lg-ring lg-ring--inner" />
            <span className="lg-flight"><span className="lg-trail" /><Send className="lg-plane" size={22} strokeWidth={2.2} /></span>
            <span className="lg-core">
              <span className="lg-core__pulse" />
              <img src="/assets/danava-mark.png" alt="" width={158} height={158} />
            </span>
            <span className="lg-sats">
              {ORBIT.map((o) => (
                <span key={o.name} className="lg-sat" style={{ ['--a' as string]: `${o.a}deg` }}>
                  <span className="lg-sat__keep">
                    <span className={`lg-sat__chip is-${o.tone}`}>
                      <i />
                      <b>{o.name}</b>
                      <small>{o.note}</small>
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </div>
        </section>

        {/* ---------- Thẻ đăng nhập ---------- */}
        <section className={`lg-card${shake ? ' is-shake' : ''}`} aria-labelledby="lg-title" onAnimationEnd={e => { if (e.animationName === 'lg-shake') setShake(0); }}>
          <img src={dark ? '/assets/danava-logo-light.png' : '/assets/danava-logo-trim.png'} alt="DANAVA Solutions" width={554} height={135} className="lg-logo" />
          <p className="lg-hello">{state === 'setup' ? 'Chưa sẵn sàng' : hello}</p>
          <h1 id="lg-title">{state === 'setup' ? 'Thiết lập quản trị' : <>Đăng nhập <em>quản trị</em></>}</h1>
          <p className="lg-sub">{state === 'setup' ? 'Máy chủ chưa có mật khẩu quản trị.' : 'Đăng nhập bằng tài khoản được cấp để bắt đầu '}</p>

          {error && (
            <div role="alert" className="lg-error">
              <span aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          {state === 'loading' ? (
            <p className="lg-note">
              <Loader2 size={18} className="lg-spin" aria-hidden="true" /> Đang kiểm tra phiên làm việc…
            </p>
          ) : state === 'setup' ? (
            <p className="lg-note">
              Chạy <code>CHAY-WEB.bat</code> (hoặc <code>npm run local</code>) để đặt mật khẩu, hoặc xem hướng dẫn triển khai trong README.
              Chức năng sửa dữ liệu đang được khóa.
            </p>
          ) : (
            <form onSubmit={login} className="lg-form">
              <label className="lg-field">
                <span className="lg-label">Tên đăng nhập <small>(*)</small></span>
                <span className="lg-input">
                  <UserRound size={18} aria-hidden="true" />
                  <input name="username" type="text" autoComplete="username" maxLength={32} autoCapitalize="none" spellCheck={false} placeholder="vd. trang.cskh" />
                </span>
              </label>
              <label className="lg-field">
                <span className="lg-label">Mật khẩu <small>(*)</small></span>
                <span className="lg-input">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    name="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    maxLength={256}
                    autoFocus
                    placeholder="••••••••"
                    onKeyDown={capsCheck}
                    onKeyUp={capsCheck}
                    aria-describedby={caps ? 'lg-caps' : undefined}
                  />
                  <button type="button" className="lg-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show}>
                    {show ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </span>
                {caps && <span id="lg-caps" className="lg-caps" role="status">Caps Lock đang bật</span>}
              </label>

              <button type="submit" className={`lg-cta${busy ? ' is-busy' : ''}`} disabled={busy}>
                <span className="lg-cta__shine" aria-hidden="true" />
                {busy
                  ? <><Loader2 size={19} className="lg-spin" aria-hidden="true" /> Đang mở bảng điều khiển…</>
                  : <>Đăng nhập <Send size={17} className="lg-cta__plane" aria-hidden="true" /></>}
              </button>
            </form>
          )}

          <p className="lg-foot">Chỉ dành cho đội ngũ DANAVA Solutions.</p>
        </section>
      </main>
    </div>
  );
}
