/**
 * Kiểm tra trước khi lưu, có lời giải thích cụ thể (validateContent chỉ trả đúng/sai).
 * Chủ yếu là đường dẫn trùng: hai bản ghi cùng một URL thì một bản ghi sẽ không mở được.
 */
import { RESERVED_POST_SLUGS, type SiteData } from './content.ts';
import { isCoreProduct, missingForPublish } from './product-types.ts';

const SLUG = /^[a-z0-9-]+$/;

/** Danh sách URL công khai do bản ghi tạo ra, kèm tên bản ghi. */
export function recordUrls(data: SiteData): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = [];
  for (const p of data.posts) out.push({ url: `/blogs/${p.slug}/`, label: `Bài viết “${p.title}”` });
  for (const p of data.projects || []) out.push({ url: `/du-an/${p.slug}/`, label: `Dự án “${p.title}”` });
  for (const x of data.showcase || []) if (x.caseStudy) out.push({ url: `/du-an/${x.slug}/`, label: `Case study “${x.name}”` });
  for (const s of data.services) out.push({ url: `/giai-phap/${s.slug}/`, label: `Sản phẩm “${s.title}”` });
  for (const s of data.subServices || []) {
    const parent = data.services.find(p => p.id === s.parentId);
    if (parent) out.push({ url: `/giai-phap/${parent.slug}/${s.slug}/`, label: `Trang con “${s.title}”` });
  }
  for (const t of data.topics || []) out.push({ url: `/blogs/chu-de/${t.slug}/`, label: `Danh mục “${t.name}”` });
  return out;
}

/** Lỗi đầu tiên tìm thấy (để hiện cho người dùng), hoặc null. */
export function contentProblem(data: SiteData): string | null {
  for (const p of data.posts) {
    if (!SLUG.test(p.slug)) return `Đường dẫn bài “${p.title}” chỉ được dùng chữ thường không dấu, số và dấu gạch ngang.`;
    if (RESERVED_POST_SLUGS.includes(p.slug)) return `Đường dẫn “${p.slug}” đã dành cho trang hệ thống, hãy đặt đường dẫn khác cho bài “${p.title}”.`;
    if (p.published && (!p.title.trim() || !p.body.trim())) return `Bài “${p.title || '(chưa đặt tên)'}” cần có tiêu đề và nội dung trước khi xuất bản.`;
  }
  for (const s of data.services) {
    if (s.published === false || isCoreProduct(s.id)) continue;
    const missing = missingForPublish(s);
    if (missing.length) return `Sản phẩm “${s.title || s.id}” chưa đủ thông tin để hiển thị công khai: ${missing.join(', ')}. Bổ sung hoặc tắt “Hiển thị trên website”.`;
  }
  const groups = new Set((data.productGroups || []).map(g => g.id));
  for (const s of data.services) if (s.groupId && !groups.has(s.groupId)) return `Sản phẩm “${s.title}” đang gắn với một nhóm đã bị xóa. Chọn lại nhóm.`;
  const seen = new Map<string, string>();
  for (const r of recordUrls(data)) {
    const before = seen.get(r.url);
    if (before) return `Đường dẫn ${r.url} bị trùng: ${before} và ${r.label}. Đổi đường dẫn của một trong hai.`;
    seen.set(r.url, r.label);
  }
  return null;
}
