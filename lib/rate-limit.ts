/**
 * Giới hạn lượt gọi chung (bảng `attempts` có sẵn, dùng được cho nhiều tiến trình). Chỉ lưu mã băm của IP, không lưu IP.
 * Dùng cho API lưu phương án phòng tập và trợ lý thiết kế (Gemini).
 */
import { createHmac } from 'node:crypto';
import { db, type Sql } from './database.ts';

async function hit(sql: Sql, id: string, until: number) {
  const onConflict = sql.kind === 'mysql' ? 'ON DUPLICATE KEY UPDATE count=count+1' : 'ON CONFLICT(id) DO UPDATE SET count=count+1';
  await sql.run(`INSERT INTO attempts(id,count,until) VALUES(?,1,?) ${onConflict}`, [id, until]);
  return Number((await sql.get<{ count: number }>('SELECT count FROM attempts WHERE id=?', [id]))?.count ?? 0);
}
const ipOf = (req: Request) => { const ip = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || ''; return /^(127\.|::1$|::ffff:127\.)/.test(ip) ? '' : ip; };

/** true = được phép. bucket: tên nhóm (vd 'gym-save'); giới hạn theo người / phút, người / ngày, toàn trang / ngày */
export async function allowAction(req: Request, bucket: string, lim: { minute: number; day: number; siteDay: number }, now = Date.now()) {
  const sql = await db();
  await sql.run('DELETE FROM attempts WHERE until<?', [now]);
  const minute = Math.floor(now / 60_000), day = new Date(now + 7 * 3600_000).toISOString().slice(0, 10);
  const ip = ipOf(req);
  if (ip) {
    const who = createHmac('sha256', process.env.DANAVA_RATE_SALT || 'danava-rate').update(ip).digest('hex').slice(0, 24);
    if ((await hit(sql, `${bucket}:m:${who}:${minute}`, (minute + 2) * 60_000)) > lim.minute) return false;
    if ((await hit(sql, `${bucket}:d:${who}:${day}`, now + 36 * 3600_000)) > lim.day) return false;
  }
  return (await hit(sql, `${bucket}:site:${day}`, now + 36 * 3600_000)) <= lim.siteDay;
}
