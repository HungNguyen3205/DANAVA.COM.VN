import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requirePermission, actorOf } from '@/lib/auth';
import { discardDraft, getWorkingContent, logAction, writeContent } from '@/lib/database';
import { validateContent } from '@/lib/content';
import { contentProblem } from '@/lib/content-check';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store' };
const CONFLICT = 'Nội dung đã được người khác lưu sau khi bạn mở. Tải lại trang để lấy bản mới nhất trước khi lưu (thay đổi của bạn sẽ mất nếu chưa sao chép).';

/** Bản đang soạn (bản nháp phía máy chủ nếu có) + mã chỉnh sửa. Chỉ người có quyền xem nội dung. */
export async function GET(req: Request) {
  const user = await requirePermission(req, 'content.read');
  if (user instanceof Response) return user;
  return NextResponse.json(await getWorkingContent(), { headers: noStore });
}

/**
 * Lưu nội dung: { data, revision, mode }.
 *  mode 'draft'   → lưu bản nháp phía máy chủ (website không đổi) — cần quyền content.draft
 *  mode 'publish' → xuất bản (mặc định, tương thích bản cũ) — cần quyền content.publish
 */
export async function PUT(req: Request) {
  if (Number(req.headers.get('content-length') || 0) > 2_100_000) return new Response(null, { status: 413 });
  let body: { data?: unknown; revision?: unknown; mode?: unknown; note?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 2_000_000) return new Response(null, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Không đọc được dữ liệu gửi lên.' }, { status: 400 });
  }
  const mode = body.mode === 'draft' ? 'draft' : 'publish';
  const user = await requirePermission(req, mode === 'draft' ? 'content.draft' : 'content.publish', true);
  if (user instanceof Response) return user;
  const { data, revision } = body;
  if (!Number.isSafeInteger(revision) || (revision as number) < 0) return NextResponse.json({ error: 'Thiếu mã phiên bản.' }, { status: 400 });
  if (!validateContent(data)) {
    // Ưu tiên lý do cụ thể (vd. đường dẫn trùng) thay cho thông báo chung
    let reason: string | null = null;
    try { reason = contentProblem(data as never); } catch {}
    return NextResponse.json({ error: reason || 'Nội dung không đúng cấu trúc.' }, { status: 400 });
  }
  const problem = contentProblem(data);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  try {
    const note = typeof body.note === 'string' ? body.note.slice(0, 300) : '';
    const next = await writeContent(data, revision as number, { draftOnly: mode === 'draft', actor: actorOf(user), note });
    if (next === null) return NextResponse.json({ error: CONFLICT }, { status: 409 });
    await logAction(actorOf(user), mode === 'draft' ? 'luu-nhap' : 'xuat-ban', 'Nội dung website', note);
    // Website đọc dữ liệu mới ở mỗi request; xóa thêm cache trang (nếu có) để chắc chắn hiển thị bản vừa xuất bản
    if (mode === 'publish') try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ revision: next, mode }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'Không thể lưu nội dung.' }, { status: 400 });
  }
}

/** Bỏ bản nháp, quay về bản đang công khai: { revision }. */
export async function DELETE(req: Request) {
  const user = await requirePermission(req, 'content.publish', true);
  if (user instanceof Response) return user;
  const revision = Number(new URL(req.url).searchParams.get('revision'));
  if (!Number.isSafeInteger(revision)) return NextResponse.json({ error: 'Thiếu mã phiên bản.' }, { status: 400 });
  const next = await discardDraft(revision);
  if (next === null) return NextResponse.json({ error: CONFLICT }, { status: 409 });
  await logAction(actorOf(user), 'bo-nhap', 'Nội dung website');
  return NextResponse.json({ revision: next }, { headers: noStore });
}
