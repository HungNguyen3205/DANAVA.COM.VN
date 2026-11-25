/**
 * Chuyển hướng khi đổi đường dẫn (SEO):
 *  - autoRedirects(): khi XUẤT BẢN, bản ghi đang công khai đổi đường dẫn → thêm chuyển hướng 301 từ đường dẫn cũ.
 *  - redirectFor(): trang không tìm thấy bản ghi → tra bảng chuyển hướng trước khi trả 404.
 */
import type { Redirect, SiteData } from './content.ts';

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/** Đường dẫn công khai của các bản ghi có URL riêng, theo ID ổn định. */
function publicUrls(data: SiteData): Map<string, string> {
  const m = new Map<string, string>();
  for (const p of data.posts) if (p.published && !p.archived) m.set(`post:${p.id}`, `/blogs/${p.slug}/`);
  for (const s of data.services) if (s.published !== false) m.set(`service:${s.id}`, `/giai-phap/${s.slug}/`);
  for (const p of data.projects || []) if (p.published) m.set(`project:${p.id}`, `/du-an/${p.slug}/`);
  for (const x of data.showcase || []) if (x.published && x.caseStudy) m.set(`case:${x.id}`, `/du-an/${x.slug}/`);
  for (const l of data.landings || []) if (l.kind === 'internal' && l.status === 'published') m.set(`landing:${l.id}`, `/lp/${l.slug}/`);
  // Danh mục bài viết và trang con giải pháp (đổi được đường dẫn ở Nội dung website → Trang website)
  for (const t of data.topics || []) if (t.published) m.set(`topic:${t.id}`, `/blogs/chu-de/${t.slug}/`);
  for (const s of data.subServices || []) {
    const parent = data.services.find(x => x.id === s.parentId);
    if (s.published && parent && parent.published !== false) m.set(`sub:${s.id}`, `/giai-phap/${parent.slug}/${s.slug}/`);
  }
  return m;
}

/**
 * Bảng chuyển hướng sau khi xuất bản `next` thay cho `before`.
 * Bỏ chuyển hướng có nguồn trùng URL đang dùng (để trang mới cùng địa chỉ không bị chuyển đi),
 * và nối chuỗi A → B → C thành A → C.
 */
export function autoRedirects(before: SiteData, next: SiteData): Redirect[] {
  const old = publicUrls(before), now = publicUrls(next);
  const live = new Set(now.values());
  let list = [...(next.redirects || [])];
  for (const [key, from] of old) {
    const to = now.get(key);
    if (!to || to === from) continue;
    list = list.map(r => (r.to === from ? { ...r, to } : r));
    if (!list.some(r => r.from === from)) list.push({ id: 'r' + globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 10), from, to, auto: true, created: today() });
  }
  return list.filter(r => !live.has(r.from) && r.from !== r.to).slice(-500);
}

/** Đích chuyển hướng cho một đường dẫn (có dấu / cuối), hoặc null. */
export function redirectFor(data: SiteData, path: string): string | null {
  const p = path.endsWith('/') ? path : path + '/';
  return (data.redirects || []).find(r => r.from === p)?.to || null;
}
