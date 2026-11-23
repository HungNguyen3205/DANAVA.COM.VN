/**
 * Tài khoản đăng nhập admin (bảng users). Tách biệt với hồ sơ nhân sự hiển thị trên website (SiteData.staff).
 * Chủ website đăng nhập bằng mật khẩu trên máy chủ (DANAVA_ADMIN_PASSWORD_HASH), không nằm trong bảng này.
 */
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './database.ts';
import { ASSIGNABLE_ROLES, isRole, type Role } from './permissions.ts';

export type UserRecord = { id: string; username: string; name: string; role: Role; active: boolean; createdAt: number; updatedAt: number; lastLogin: number | null };
type Row = { id: string; username: string; name: string; role: string; password_hash: string; active: number; created_at: number; updated_at: number; last_login: number | null };

const toRecord = (r: Row): UserRecord => ({
  id: r.id, username: r.username, name: r.name, role: isRole(r.role) ? r.role : 'writer', active: !!Number(r.active),
  createdAt: Number(r.created_at), updatedAt: Number(r.updated_at), lastLogin: r.last_login ? Number(r.last_login) : null
});

export const USERNAME = /^[a-z0-9._-]{3,32}$/;
export const MIN_PASSWORD = 10;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function passwordOk(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
// Băm giả khi không có tài khoản: thời gian phản hồi như nhau, không dò được tên đăng nhập
const DUMMY = hashPassword(randomBytes(12).toString('hex'));

export function checkNewUser(v: { username?: unknown; name?: unknown; role?: unknown; password?: unknown }, creating: boolean): string | null {
  if (creating && (typeof v.username !== 'string' || !USERNAME.test(v.username))) return 'Tên đăng nhập 3–32 ký tự: chữ thường không dấu, số, dấu chấm, gạch ngang, gạch dưới.';
  if (v.name !== undefined && (typeof v.name !== 'string' || !v.name.trim() || v.name.length > 150)) return 'Nhập họ tên (tối đa 150 ký tự).';
  if (v.role !== undefined && !(ASSIGNABLE_ROLES as string[]).includes(String(v.role))) return 'Vai trò không hợp lệ.';
  if ((creating || v.password !== undefined) && (typeof v.password !== 'string' || v.password.length < MIN_PASSWORD || v.password.length > 256)) return `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự.`;
  return null;
}

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await (await db()).all<Row>('SELECT * FROM users ORDER BY created_at');
  return rows.map(toRecord);
}

export async function getUser(id: string): Promise<UserRecord | null> {
  const r = await (await db()).get<Row>('SELECT * FROM users WHERE id=?', [id]);
  return r ? toRecord(r) : null;
}

export async function createUser(v: { username: string; name: string; role: Role; password: string }): Promise<UserRecord | 'taken'> {
  const sql = await db();
  if (await sql.get('SELECT id FROM users WHERE username=?', [v.username])) return 'taken';
  const now = Date.now();
  const id = 'usr_' + randomUUID().slice(0, 12);
  await sql.run('INSERT INTO users(id, username, name, role, password_hash, active, created_at, updated_at) VALUES(?, ?, ?, ?, ?, 1, ?, ?)',
    [id, v.username, v.name.trim(), v.role, hashPassword(v.password), now, now]);
  return (await getUser(id))!;
}

/** Đổi họ tên, vai trò, trạng thái hoặc mật khẩu. Đổi mật khẩu/khóa tài khoản → đăng xuất mọi phiên của người đó. */
export async function updateUser(id: string, v: { name?: string; role?: Role; active?: boolean; password?: string }): Promise<UserRecord | null> {
  const sql = await db();
  const cur = await sql.get<Row>('SELECT * FROM users WHERE id=?', [id]);
  if (!cur) return null;
  await sql.run('UPDATE users SET name=?, role=?, active=?, password_hash=?, updated_at=? WHERE id=?', [
    v.name !== undefined ? v.name.trim() : cur.name,
    v.role ?? cur.role,
    v.active === undefined ? Number(cur.active) : v.active ? 1 : 0,
    v.password ? hashPassword(v.password) : cur.password_hash,
    Date.now(),
    id
  ]);
  if (v.password || v.active === false) await sql.run('DELETE FROM sessions WHERE user_id=?', [id]);
  return getUser(id);
}

export async function deleteUser(id: string) {
  const sql = await db();
  await sql.run('DELETE FROM sessions WHERE user_id=?', [id]);
  await sql.run('DELETE FROM users WHERE id=?', [id]);
}

/** Kiểm tra đăng nhập bằng tài khoản. Sai tên hoặc sai mật khẩu đều trả null như nhau. */
export async function verifyLogin(username: string, password: string): Promise<UserRecord | null> {
  const sql = await db();
  const r = await sql.get<Row>('SELECT * FROM users WHERE username=?', [username.trim().toLowerCase()]);
  const ok = passwordOk(password, r?.password_hash || DUMMY);
  if (!r || !ok || !Number(r.active)) return null;
  await sql.run('UPDATE users SET last_login=? WHERE id=?', [Date.now(), r.id]);
  return toRecord(r);
}
