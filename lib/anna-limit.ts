/*
 * Giới hạn lượt hỏi ANNA để khóa API không bị đốt tiền.
 * Đếm trong bảng `attempts` có sẵn (dùng chung cho nhiều tiến trình Passenger); chỉ lưu mã băm, không lưu IP.
 */
import { createHmac } from 'node:crypto';
import { db, type Sql } from './database.ts';

const PER_VISITOR_MINUTE = 8;
const PER_VISITOR_DAY = 80;
const SITE_MINUTE = 60;
const DEFAULT_SITE_DAY = 500;

async function hit(sql: Sql, id: string, until: number) {
  const onConflict = sql.kind === 'mysql' ? 'ON DUPLICATE KEY UPDATE count=count+1' : 'ON CONFLICT(id) DO UPDATE SET count=count+1';
  await sql.run(`INSERT INTO attempts(id,count,until) VALUES(?,1,?) ${onConflict}`, [id, until]);
  return Number((await sql.get<{ count: number }>('SELECT count FROM attempts WHERE id=?', [id]))?.count ?? 0);
}

/** IP do proxy gần nhất ghi (phần tử cuối); các phần tử trước khách tự giả được. */
function visitorIp(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || '';
  // Loopback = proxy không chuyển IP thật: khi đó chỉ áp giới hạn chung, tránh gộp mọi khách thành một người
  return /^(127\.|::1$|::ffff:127\.)/.test(ip) ? '' : ip;
}

export async function allowQuestion(req: Request, secret: Buffer, now = Date.now()): Promise<boolean> {
  const sql = await db();
  await sql.run('DELETE FROM attempts WHERE until<?', [now]);

  const minute = Math.floor(now / 60_000);
  const day = new Date(now + 7 * 3600_000).toISOString().slice(0, 10);
  const minuteEnd = (minute + 2) * 60_000;
  const dayEnd = now + 36 * 3600_000;

  const ip = visitorIp(req);
  if (ip) {
    const who = createHmac('sha256', secret).update(ip).digest('hex').slice(0, 24);
    if ((await hit(sql, `anna:m:${who}:${minute}`, minuteEnd)) > PER_VISITOR_MINUTE) return false;
    if ((await hit(sql, `anna:d:${who}:${day}`, dayEnd)) > PER_VISITOR_DAY) return false;
  }
  if ((await hit(sql, `anna:site:m:${minute}`, minuteEnd)) > SITE_MINUTE) return false;

  const configured = Number(process.env.DANAVA_AI_DAILY_LIMIT);
  const siteDay = Number.isSafeInteger(configured) && configured > 0 ? configured : DEFAULT_SITE_DAY;
  return (await hit(sql, `anna:site:d:${day}`, dayEnd)) <= siteDay;
}
