/**
 * Chuyển hướng quản lý trong admin (Hệ thống → SEO & chuyển hướng), gồm chuyển hướng tự tạo khi đổi đường dẫn.
 * Chuyển hướng cố định trong code vẫn ở next.config.ts (chạy trước proxy).
 * Bảng chuyển hướng được giữ trong bộ nhớ 60 giây; xuất bản nội dung xóa bộ nhớ đệm ngay (app/api/admin/content).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getContent } from '@/lib/database';

type Cache = { at: number; map: Map<string, string> };
const g = globalThis as typeof globalThis & { __danavaRedirects?: Cache };
const TTL = 60_000;

async function table(): Promise<Map<string, string>> {
  const c = g.__danavaRedirects;
  if (c && Date.now() - c.at < TTL) return c.map;
  try {
    const { data } = await getContent();
    const map = new Map((data.redirects || []).map(r => [r.from, r.to]));
    g.__danavaRedirects = { at: Date.now(), map };
    return map;
  } catch {
    return c?.map || new Map();
  }
}

/** Cờ "đang mở trong trình chỉnh trực tiếp": chỉ proxy được đặt (xóa giá trị gửi từ trình duyệt). Máy chủ còn kiểm tra phiên admin. */
const CMS_HEADER = 'x-danava-cms';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.endsWith('/') ? request.nextUrl.pathname : request.nextUrl.pathname + '/';
  const to = (await table()).get(path);
  if (!to) {
    const headers = new Headers(request.headers);
    headers.delete(CMS_HEADER);
    if (request.nextUrl.searchParams.get('cms') === '1') headers.set(CMS_HEADER, '1');
    return NextResponse.next({ request: { headers } });
  }
  const target = to.startsWith('http') ? new URL(to) : new URL(to, request.url);
  if (!to.startsWith('http')) target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

export const config = {
  // Bỏ qua tài nguyên tĩnh, API, admin và file có phần mở rộng
  matcher: ['/((?!_next/|assets/|api/|admin|favicon|icon|robots|sitemap|.*\\.[a-zA-Z0-9]{2,5}$).*)']
};
