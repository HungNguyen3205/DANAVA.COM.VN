import { NextResponse } from 'next/server';
import { configured, session, sameOrigin, passwordMatches, newSession, logout, loginAllowed, clearLoginAttempts, OWNER, actorOf, type SessionUser } from '@/lib/auth';
import { logAction } from '@/lib/database';
import { verifyLogin, USERNAME } from '@/lib/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const publicUser = (u: SessionUser) => ({ id: u.id, name: u.name, role: u.role });

export async function GET() {
  const s = await session();
  return NextResponse.json({ configured: configured(), authenticated: !!s, csrf: s?.csrf, user: s ? publicUser(s.user) : undefined }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Đăng nhập:
 *  - { password } → chủ website (mật khẩu đặt trên máy chủ);
 *  - { username, password } → tài khoản trong mục Tài khoản & quyền.
 */
export async function POST(req: Request) {
  if (!configured()) return NextResponse.json({ error: 'Chưa cấu hình tài khoản quản trị trên máy chủ.' }, { status: 503 });
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > 4096) return new Response(null, { status: 413 });
  let body: { username?: unknown; password?: unknown };
  try { body = await req.json(); } catch { return new Response(null, { status: 400 }); }
  const password = body.password, username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  if (typeof password !== 'string' || password.length > 256 || (username && !USERNAME.test(username))) {
    return NextResponse.json({ error: 'Thông tin đăng nhập không đúng.' }, { status: 401 });
  }
  const key = username ? `login:${username}` : 'admin-login';
  if (!await loginAllowed(key)) return NextResponse.json({ error: 'Quá nhiều lần thử. Hãy thử lại sau 15 phút.' }, { status: 429 });

  let user: SessionUser | null = null;
  try {
    if (username) {
      const u = await verifyLogin(username, password);
      if (u) user = { id: u.id, name: u.name, role: u.role };
    } else if (passwordMatches(password)) {
      user = OWNER;
    }
  } catch {
    return NextResponse.json({ error: 'Chưa đăng nhập được vì máy chủ không truy cập được dữ liệu. Hãy thử lại sau ít phút.' }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: 'Thông tin đăng nhập không đúng.' }, { status: 401 });

  await clearLoginAttempts(key);
  const s = await newSession(user).catch(() => null);
  if (!s) return NextResponse.json({ error: 'Chưa đăng nhập được vì máy chủ không ghi được phiên. Hãy thử lại sau ít phút.' }, { status: 503 });
  await logAction(actorOf(user), 'dang-nhap');
  const response = NextResponse.json({ authenticated: true, csrf: s.csrf, user: publicUser(user) });
  response.cookies.set('danava_session', s.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 3600 });
  return response;
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  const current = await session();
  try { if (!await logout(req.headers.get('x-csrf-token'))) return new Response(null, { status: 403 }); }
  catch { return NextResponse.json({ error: 'Chưa đăng xuất được vì máy chủ không truy cập được dữ liệu.' }, { status: 503 }); }
  if (current) await logAction(actorOf(current.user), 'dang-xuat');
  const r = NextResponse.json({ ok: true });
  r.cookies.set('danava_session', '', { maxAge: 0, path: '/' });
  return r;
}
