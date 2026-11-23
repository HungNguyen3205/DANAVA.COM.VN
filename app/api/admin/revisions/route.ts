import { NextResponse } from 'next/server';
import { requirePermission, actorOf } from '@/lib/auth';
import { getRevision, getWorkingContent, listRevisions, logAction, migrationStatus, writeContent } from '@/lib/database';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store' };

/** Lịch sử phiên bản đã xuất bản. ?id=… trả nội dung của một phiên bản (để xem so sánh). */
export async function GET(req: Request) {
  const user = await requirePermission(req, 'content.read');
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get('id');
  if (id) {
    const r = await getRevision(id);
    return r ? NextResponse.json(r, { headers: noStore }) : NextResponse.json({ error: 'Không tìm thấy phiên bản.' }, { status: 404 });
  }
  return NextResponse.json({ revisions: await listRevisions(60), migrations: await migrationStatus() }, { headers: noStore });
}

/**
 * Khôi phục một phiên bản: { id, revision, publish }.
 * Mặc định đưa phiên bản cũ vào BẢN NHÁP để kiểm tra rồi mới xuất bản; publish = true thì xuất bản luôn.
 */
export async function POST(req: Request) {
  const user = await requirePermission(req, 'content.publish', true);
  if (user instanceof Response) return user;
  let body: { id?: unknown; revision?: unknown; publish?: unknown };
  try { body = await req.json(); } catch { return new Response(null, { status: 400 }); }
  if (typeof body.id !== 'string' || !Number.isSafeInteger(body.revision)) return NextResponse.json({ error: 'Thiếu thông tin phiên bản.' }, { status: 400 });
  const found = await getRevision(body.id);
  if (!found) return NextResponse.json({ error: 'Không tìm thấy phiên bản.' }, { status: 404 });
  const when = new Date(found.info.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const publish = body.publish === true;
  const next = await writeContent(found.data, body.revision as number, { draftOnly: !publish, actor: actorOf(user), kind: 'restore', note: `Khôi phục phiên bản ${when}` });
  if (next === null) return NextResponse.json({ error: 'Nội dung đã thay đổi ở phiên khác. Tải lại trang rồi thử lại.' }, { status: 409 });
  await logAction(actorOf(user), publish ? 'khoi-phuc-xuat-ban' : 'khoi-phuc-vao-nhap', `Phiên bản ${when}`);
  return NextResponse.json({ revision: next, content: publish ? undefined : await getWorkingContent() }, { headers: noStore });
}
