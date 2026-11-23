import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { db, type Actor } from './database';
import { can, isRole, type Permission, type Role } from './permissions';

export const configured = () => !!process.env.DANAVA_ADMIN_PASSWORD_HASH;

// Chỉ lưu mã băm của token. Băm kèm mã mật khẩu → đổi mật khẩu là mọi phiên cũ hết hiệu lực.
const digest = (s: string) =>
  createHash('sha256').update(s + String(process.env.DANAVA_ADMIN_PASSWORD_HASH || '')).digest('hex');

export function passwordMatches(password: string) {
  const [salt, hash] = String(process.env.DANAVA_ADMIN_PASSWORD_HASH || '').split(':');
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

/** Người đang đăng nhập. Chủ website (mật khẩu máy chủ) có id 'owner'. */
export type SessionUser = { id: string; name: string; role: Role };
export const OWNER: SessionUser = { id: 'owner', name: 'Chủ website', role: 'owner' };

/*
 * Nguồn sự thật DUY NHẤT của phiên là bảng sessions: có dòng thì còn đăng nhập, xóa dòng là hết ngay.
 * Không chấp nhận token tự chứng thực bằng chữ ký: loại đó không thu hồi được khi đăng xuất.
 * Vai trò của tài khoản thường được đọc lại từ bảng users mỗi lần: đổi quyền hoặc khóa tài khoản có hiệu lực ngay.
 */
async function findSession() {
  const token = (await cookies()).get('danava_session')?.value;
  if (!token || token.length > 256) return null;
  const key = digest(token);
  const sql = await db();
  const row = await sql.get<{ csrf: string; expires: number; user_id: string | null }>(
    'SELECT csrf,expires,user_id FROM sessions WHERE token=? AND expires>?', [key, Date.now()]
  );
  if (!row) return null;
  let user = OWNER;
  // Phiên tạo trước khi có tài khoản (user_id trống) là phiên của chủ website
  if (row.user_id && row.user_id !== 'owner') {
    const u = await sql.get<{ id: string; name: string; role: string; active: number }>('SELECT id,name,role,active FROM users WHERE id=?', [row.user_id]);
    if (!u || !Number(u.active) || !isRole(u.role)) return null;
    user = { id: u.id, name: u.name, role: u.role };
  }
  return { key, csrf: row.csrf, expires: Number(row.expires), user };
}

/** Không đọc được database → coi như chưa đăng nhập. */
export async function session() {
  try {
    const found = await findSession();
    return found && { csrf: found.csrf, expires: found.expires, user: found.user };
  } catch {
    return null;
  }
}

/** Ném lỗi khi không ghi được database: không phát cookie mà máy chủ sẽ không nhận. */
export async function newSession(user: SessionUser = OWNER) {
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(16).toString('hex');
  const expires = Date.now() + 8 * 3600_000;
  const sql = await db();
  await sql.run('DELETE FROM sessions WHERE expires<?', [Date.now()]);
  await sql.run('INSERT INTO sessions(token,csrf,expires,user_id,role,name) VALUES(?,?,?,?,?,?)', [digest(token), csrf, expires, user.id, user.role, user.name.slice(0, 150)]);
  return { token, csrf, expires };
}

/**
 * Hủy phiên của request. false = không có phiên hợp lệ hoặc sai CSRF.
 * Cố ý không nuốt lỗi database: chưa xóa được thì không được báo là đã đăng xuất.
 */
export async function logout(csrf: string | null) {
  const found = await findSession();
  if (!found || found.csrf !== csrf) return false;
  await (await db()).run('DELETE FROM sessions WHERE token=?', [found.key]);
  return true;
}

export { sameOrigin } from './origin';
import { sameOrigin } from './origin';

export async function authorizedMutation(req: Request) {
  const s = await session();
  return !!s && sameOrigin(req) && req.headers.get('x-csrf-token') === s.csrf;
}

/**
 * Kiểm tra quyền tại API. Trả về người dùng, hoặc Response lỗi để trả ngay:
 *  401 chưa đăng nhập · 403 thiếu quyền, khác nguồn gốc hoặc sai CSRF (với thao tác thay đổi dữ liệu).
 */
export async function requirePermission(req: Request, perm: Permission, mutation = req.method !== 'GET' && req.method !== 'HEAD'): Promise<SessionUser | Response> {
  const s = await session();
  if (!s) return new Response(null, { status: 401 });
  if (mutation && (!sameOrigin(req) || req.headers.get('x-csrf-token') !== s.csrf)) return new Response(null, { status: 403 });
  if (!can(s.user.role, perm)) return Response.json({ error: 'Tài khoản của bạn không có quyền thực hiện thao tác này.' }, { status: 403 });
  return s.user;
}

export const actorOf = (u: SessionUser): Actor => ({ id: u.id, name: u.name });

/** Giới hạn số lần thử đăng nhập theo từng khóa (mật khẩu chủ website hoặc từng tên đăng nhập). */
export async function loginAllowed(key = 'admin-login') {
  const now = Date.now();
  try {
    return await (await db()).tx(async sql => {
      await sql.run('DELETE FROM attempts WHERE until<?', [now]);
      const row = await sql.get<{ count: number }>('SELECT count FROM attempts WHERE id=?' + (sql.kind === 'mysql' ? ' FOR UPDATE' : ''), [key]);
      if (row && Number(row.count) >= 10) return false;
      if (row) await sql.run('UPDATE attempts SET count=count+1 WHERE id=?', [key]);
      else await sql.run('INSERT INTO attempts(id,count,until) VALUES(?,1,?)', [key, now + 15 * 60_000]);
      return true;
    });
  } catch {
    return true;
  }
}

export async function clearLoginAttempts(key = 'admin-login') {
  try { await (await db()).run('DELETE FROM attempts WHERE id=?', [key]); } catch {}
}

/** Xem trước bản ghi chưa xuất bản trên website: chỉ người có quyền xem nội dung trong admin. */
export async function canPreview() {
  const s = await session();
  return !!s && can(s.user.role, 'content.read');
}
