import { NextResponse } from 'next/server';
import { session, authorizedMutation } from '@/lib/auth';
import { getLeads, updateLeadAssignment } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!await session()) {
    return new Response(null, { status: 401 });
  }

  const url = new URL(req.url);
  // Danh bạ và báo cáo nguồn khách cần đọc nhiều hơn danh sách thường
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get('limit')) || 50));
  const leads = await getLeads(limit);

  return NextResponse.json({ leads }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: Request) {
  if (!await session()) {
    return new Response(null, { status: 401 });
  }
  // Thay đổi dữ liệu phải cùng nguồn gốc và có mã CSRF của phiên, giống API nội dung.
  if (!await authorizedMutation(req)) {
    return new Response(null, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, assigned_to, status, assigned_note } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    }

    const ok = await updateLeadAssignment(id, { assigned_to, status, assigned_note });
    if (!ok) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Phân công khách hàng thành công' });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}


