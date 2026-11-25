/**
 * Lưu / mở lại phương án thiết kế phòng tập (bảng gym_designs, migration v2 trong lib/database.ts).
 *  - Ai có mã (GYM-XXXXXX) đều MỞ được (để chia sẻ và để DANAVA mở đúng phương án khách gửi).
 *  - Chỉ người tạo SỬA được: khi tạo, máy chủ trả mã chỉnh sửa ngẫu nhiên (lưu trên trình duyệt khách); DB chỉ giữ băm SHA-256.
 *  - Mỗi lần lưu tăng phiên bản. Ảnh tổng thể (JPEG, data URL) lưu kèm để nhân viên xem nhanh.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from './database.ts';
import { makeCode, type Project } from './gym-project.ts';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const PREVIEW_MAX = 900_000;
export const validPreview = (s: unknown): s is string => typeof s === 'string' && s.length <= PREVIEW_MAX && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s);

export async function createDesign(project: Project, preview: string) {
  const sql = await db();
  const token = randomBytes(24).toString('base64url');
  const now = Date.now();
  for (let i = 0; i < 6; i++) {
    const code = makeCode(() => randomBytes(1)[0] / 256);
    const p = { ...project, code, version: 1, updatedAt: now };
    try {
      await sql.run('INSERT INTO gym_designs(code, token_hash, version, json, preview, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)', [code, sha(token), 1, JSON.stringify(p), preview || null, now, now]);
      return { code, token, version: 1 };
    } catch (e) { if (!/duplicate|unique|primary/i.test(String((e as Error).message))) throw e; }
  }
  throw Error('Không tạo được mã phương án.');
}

export async function updateDesign(code: string, token: string, project: Project, preview: string) {
  const sql = await db();
  const row = await sql.get<{ token_hash: string; version: number }>('SELECT token_hash, version FROM gym_designs WHERE code=?', [code]);
  if (!row) return { status: 404 as const };
  const a = Buffer.from(row.token_hash, 'hex'), b = Buffer.from(sha(token), 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { status: 403 as const };
  const version = Number(row.version) + 1, now = Date.now();
  const p = { ...project, code, version, updatedAt: now };
  await sql.run('UPDATE gym_designs SET version=?, json=?, preview=COALESCE(?, preview), updated_at=? WHERE code=?', [version, JSON.stringify(p), preview || null, now, code]);
  return { status: 200 as const, code, version };
}

export async function getDesign(code: string) {
  const sql = await db();
  const row = await sql.get<{ json: string; version: number; updated_at: number; preview: string | null }>('SELECT json, version, updated_at, preview FROM gym_designs WHERE code=?', [code]);
  if (!row) return null;
  return { project: JSON.parse(row.json) as unknown, version: Number(row.version), updatedAt: Number(row.updated_at), hasPreview: !!row.preview, preview: row.preview };
}
export const validCode = (s: string) => /^GYM-[A-Z0-9]{6}$/.test(s);
