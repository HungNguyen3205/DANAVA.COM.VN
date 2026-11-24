import { NextResponse } from 'next/server';
import { requirePermission, actorOf } from '@/lib/auth';
import { getLeads, logAction, updateLeadAssignment } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await requirePermission(req, 'leads.read');
  if (user instanceof Response) return user;

  const url = new URL(req.url);
  // Danh bạ và báo cáo nguồn khách cần đọc nhiều hơn danh sách thường
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get('limit')) || 50));
  const leads = await getLeads(limit);

  return NextResponse.json({ leads }, { headers: { 'Cache-Control': 'no-store' } });
}

const LEAD_STATUSES = ['new', 'assigned', 'contacted', 'completed'];

export async function PATCH(req: Request) {
  // Thay đổi dữ liệu phải cùng nguồn gốc và có mã CSRF của phiên
  const user = await requirePermission(req, 'leads.write', true);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const { id, assigned_to, status, assigned_note } = body;
    if (!id || typeof id !== 'string' || id.length > 100) {
      return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
    }
    // Chỉ nhận đúng các trạng thái / kiểu dữ liệu của màn Yêu cầu tư vấn (components/adminData.ts → leadStatus)
    if (status !== undefined && !LEAD_STATUSES.includes(status)) return NextResponse.json({ error: 'Trạng thái không hợp lệ.' }, { status: 400 });
    if (assigned_to !== undefined && (typeof assigned_to !== 'string' || assigned_to.length > 150)) return NextResponse.json({ error: 'Người phụ trách không hợp lệ.' }, { status: 400 });
    if (assigned_note !== undefined && (typeof assigned_note !== 'string' || assigned_note.length > 2000)) return NextResponse.json({ error: 'Ghi chú tối đa 2.000 ký tự.' }, { status: 400 });

    const ok = await updateLeadAssignment(id, { assigned_to, status, assigned_note });
    if (!ok) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    await logAction(actorOf(user), 'cap-nhat-khach-hang', id, [assigned_to && `phụ trách: ${assigned_to}`, status && `trạng thái: ${status}`].filter(Boolean).join(', '));

    return NextResponse.json({ ok: true, message: 'Phân công khách hàng thành công' });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
