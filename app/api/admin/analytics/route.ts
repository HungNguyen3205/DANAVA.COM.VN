import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await requirePermission(req, 'reports.read');
  if (user instanceof Response) return user;
  const asked = Number(new URL(req.url).searchParams.get('days'));
  const days = [7, 30, 90].includes(asked) ? asked : 30;
  const since = Date.now() - days * 86400_000, conn = await db();
  const dayExpr = conn.kind === 'mysql' ? "DATE_FORMAT(FROM_UNIXTIME(started/1000),'%Y-%m-%d')" : "date(started/1000,'unixepoch','+7 hours')";
  const totals = await conn.get('SELECT count(*) pageviews,count(DISTINCT visitor) visitors,count(DISTINCT session) sessions,coalesce(sum(seconds),0) seconds FROM visits WHERE started>=?', [since]);
  const online = await conn.get('SELECT count(DISTINCT session) n FROM visits WHERE last>?', [Date.now() - 90_000]);
  const daily = await conn.all(`SELECT ${dayExpr} day,count(*) pageviews,count(DISTINCT visitor) visitors FROM visits WHERE started>=? GROUP BY day ORDER BY day`, [since]);
  // ?pages=all: toàn bộ đường dẫn (báo cáo Hiệu quả nội dung); mặc định 20 trang nhiều lượt xem nhất
  const allPages = new URL(req.url).searchParams.get('pages') === 'all';
  const pages = await conn.all(`SELECT path,count(*) pageviews,count(DISTINCT visitor) visitors,round(avg(seconds)) seconds FROM visits WHERE started>=? GROUP BY path ORDER BY pageviews DESC LIMIT ${allPages ? 500 : 20}`, [since]);
  const sources = await conn.all('SELECT source,count(*) pageviews FROM visits WHERE started>=? GROUP BY source ORDER BY pageviews DESC LIMIT 10', [since]);
  return NextResponse.json({ days, totals, online, daily, pages, sources }, { headers: { 'Cache-Control': 'no-store' } });
}
