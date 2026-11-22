import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './database';

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

/*
 * Nguồn sự thật DUY NHẤT của phiên là bảng sessions: có dòng thì còn đăng nhập, xóa dòng là hết ngay.
 * Không chấp nhận token tự chứng thực bằng chữ ký: loại đó không thu hồi được khi đăng xuất.
 */
async function findSession() {
  const token = (await cookies()).get('danava_session')?.value;
  if (!token || token.length > 256) return null;
  const key = digest(token);
  const row = await (await db()).get<{ csrf: string; expires: number }>(
    'SELECT csrf,expires FROM sessions WHERE token=? AND expires>?', [key, Date.now()]
  );
  return row ? { key, csrf: row.csrf, expires: Number(row.expires) } : null;
}

/** Không đọc được database → coi như chưa đăng nhập. */
export async function session() {
  try {
    const found = await findSession();
    return found && { csrf: found.csrf, expires: found.expires };
  } catch {
    return null;
  }
}

/** Ném lỗi khi không ghi được database: không phát cookie mà máy chủ sẽ không nhận. */
export async function newSession() {
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(16).toString('hex');
  const expires = Date.now() + 8 * 3600_000;
  const sql = await db();
  await sql.run('DELETE FROM sessions WHERE expires<?', [Date.now()]);
  await sql.run('INSERT INTO sessions(token,csrf,expires) VALUES(?,?,?)', [digest(token), csrf, expires]);
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

export async function loginAllowed() {
  const now = Date.now();
  try {
    const key = 'admin-login';
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

export async function clearLoginAttempts() {
  try { await (await db()).run('DELETE FROM attempts WHERE id=?', ['admin-login']); } catch {}
}
