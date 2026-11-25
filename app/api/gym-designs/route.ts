import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/origin';
import { allowAction } from '@/lib/rate-limit';
import { getSiteContent } from '@/lib/database';
import { publicEquipment } from '@/lib/equipment-seeds';
import { normalizeProject } from '@/lib/gym-project';
import { createDesign, validPreview } from '@/lib/gym-designs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_BODY = 2_500_000;

/** Lưu phương án mới → { code, token, version }. Dữ liệu được chuẩn hoá lại hoàn toàn phía máy chủ. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY) return NextResponse.json({ error: 'Phương án quá lớn.' }, { status: 413 });
  if (!(await allowAction(req, 'gym-save', { minute: 6, day: 60, siteDay: 3000 }))) return NextResponse.json({ error: 'Bạn lưu quá nhiều lần, vui lòng thử lại sau ít phút.' }, { status: 429 });
  let body: { project?: unknown; preview?: unknown };
  try { const raw = await req.text(); if (raw.length > MAX_BODY) return NextResponse.json({ error: 'Phương án quá lớn.' }, { status: 413 }); body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  const { data } = await getSiteContent();
  const known = new Set(publicEquipment(data.equipment).map(e => e.id));
  const p = normalizeProject(body.project, known);
  if (typeof p === 'string') return NextResponse.json({ error: p }, { status: 400 });
  try {
    const r = await createDesign(p, validPreview(body.preview) ? body.preview : '');
    return NextResponse.json(r, { status: 201 });
  } catch { return NextResponse.json({ error: 'Không lưu được phương án lúc này.' }, { status: 500 }); }
}
