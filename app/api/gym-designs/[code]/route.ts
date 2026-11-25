import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/origin';
import { allowAction } from '@/lib/rate-limit';
import { getSiteContent } from '@/lib/database';
import { publicEquipment } from '@/lib/equipment-seeds';
import { normalizeProject } from '@/lib/gym-project';
import { getDesign, updateDesign, validCode, validPreview } from '@/lib/gym-designs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_BODY = 2_500_000;
type Ctx = { params: Promise<{ code: string }> };

/** Mở phương án theo mã (không kèm ảnh để nhẹ; ảnh ở /preview/) */
export async function GET(_req: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  if (!validCode(code)) return NextResponse.json({ error: 'Mã không hợp lệ.' }, { status: 400 });
  const d = await getDesign(code);
  if (!d) return NextResponse.json({ error: 'Không tìm thấy phương án.' }, { status: 404 });
  return NextResponse.json({ project: d.project, version: d.version, updatedAt: d.updatedAt, preview: d.hasPreview ? `/api/gym-designs/${code}/preview/` : '' }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}

/** Lưu phiên bản mới (cần mã chỉnh sửa của người tạo trong header x-design-token) */
export async function PUT(req: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  if (!validCode(code)) return NextResponse.json({ error: 'Mã không hợp lệ.' }, { status: 400 });
  const token = req.headers.get('x-design-token') || '';
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return NextResponse.json({ error: 'Thiếu quyền sửa phương án này.' }, { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return NextResponse.json({ error: 'Phương án quá lớn.' }, { status: 413 });
  if (!(await allowAction(req, 'gym-save', { minute: 6, day: 60, siteDay: 3000 }))) return NextResponse.json({ error: 'Bạn lưu quá nhiều lần, vui lòng thử lại sau ít phút.' }, { status: 429 });
  let body: { project?: unknown; preview?: unknown };
  try { const raw = await req.text(); if (raw.length > MAX_BODY) return NextResponse.json({ error: 'Phương án quá lớn.' }, { status: 413 }); body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const { data } = await getSiteContent();
  const p = normalizeProject(body.project, new Set(publicEquipment(data.equipment).map(e => e.id)));
  if (typeof p === 'string') return NextResponse.json({ error: p }, { status: 400 });
  const r = await updateDesign(code, token, p, validPreview(body.preview) ? body.preview : '');
  if (r.status === 404) return NextResponse.json({ error: 'Không tìm thấy phương án.' }, { status: 404 });
  if (r.status === 403) return NextResponse.json({ error: 'Bạn không có quyền sửa phương án này (chỉ người tạo). Bấm "Bắt đầu thiết kế mới" hoặc lưu thành mã mới.' }, { status: 403 });
  return NextResponse.json({ code: r.code, version: r.version });
}
