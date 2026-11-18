import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './database';

export const configured = () => !!process.env.DANAVA_ADMIN_PASSWORD_HASH;

// Khóa bảo mật ký số phiên làm việc: tự động trích xuất từ DANAVA_ADMIN_PASSWORD_HASH
const getSecretKey = () =>
  createHash('sha256').update('danava-auth-session-v2:' + String(process.env.DANAVA_ADMIN_PASSWORD_HASH || '')).digest();

const signPayload = (payload: string) =>
  createHmac('sha256', getSecretKey()).update(payload).digest('hex');

const digest = (s: string) =>
  createHash('sha256').update(s + String(process.env.DANAVA_ADMIN_PASSWORD_HASH || '')).digest('hex');

export function passwordMatches(password: string) {
  const [salt, hash] = String(process.env.DANAVA_ADMIN_PASSWORD_HASH || '').split(':');
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

export async function session() {
  const token = (await cookies()).get('danava_session')?.value;
  if (!token) return null;

  // 1. Xác thực qua Token ký số HMAC (hoạt động đa vùng, đa lambda không phụ thuộc bộ nhớ tạm SQLite)
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length === 4) {
      const [randomId, csrf, expiresStr, sig] = parts;
      const expires = Number(expiresStr);
      if (expires && expires > Date.now() && csrf && sig) {
        const payload = `${randomId}.${csrf}.${expiresStr}`;
        const expectedSig = signPayload(payload);
        if (
          expectedSig.length === sig.length &&
          timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
        ) {
          return { csrf, expires };
        }
      }
    }
  }

  // 2. Dự phòng tra cứu SQLite (đối với token cũ hoặc môi trường cục bộ)
  try {
    const row = await (await db()).get<{ csrf: string; expires: number }>(
      'SELECT csrf,expires FROM sessions WHERE token=? AND expires>?', [digest(token), Date.now()]
    );
    return row ? { csrf: row.csrf, expires: Number(row.expires) } : null;
  } catch {
    return null;
  }
}

export async function newSession() {
  const randomId = randomBytes(16).toString('hex');
  const csrf = randomBytes(16).toString('hex');
  const expires = Date.now() + 8 * 3600_000;
  const payload = `${randomId}.${csrf}.${expires}`;
  const sig = signPayload(payload);
  const token = `${payload}.${sig}`;

  try {
    const sql = await db();
    await sql.run('DELETE FROM sessions WHERE expires<?', [Date.now()]);
    await sql.run('INSERT INTO sessions(token,csrf,expires) VALUES(?,?,?)', [digest(token), csrf, expires]);
  } catch {}

  return { token, csrf, expires };
}

export async function logout() {
  const token = (await cookies()).get('danava_session')?.value;
  if (token) {
    try {
      await (await db()).run('DELETE FROM sessions WHERE token=?', [digest(token)]);
    } catch {}
  }
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  const expected = new URL(process.env.SITE_URL || req.url).origin;
  return origin === expected;
}

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
