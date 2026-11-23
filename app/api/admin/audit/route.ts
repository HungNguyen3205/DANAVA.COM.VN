import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { listAudit } from '@/lib/database';

export const dynamic = 'force-dynamic';

/** Nhật ký thao tác (đăng nhập, lưu nháp, xuất bản, khôi phục, tài khoản, khách hàng). */
export async function GET(req: Request) {
  const user = await requirePermission(req, 'system.manage');
  if (user instanceof Response) return user;
  return NextResponse.json({ entries: await listAudit(300) }, { headers: { 'Cache-Control': 'no-store' } });
}
