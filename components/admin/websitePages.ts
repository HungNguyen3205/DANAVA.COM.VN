/**
 * Website → Trang: danh mục trang và các phần chỉnh sửa được của từng trang.
 * Mỗi tab trỏ tới nguồn dữ liệu đang dùng (không tạo bản sao):
 *  - hero: màn mở đầu trang chủ (SiteData.homeHero, lib/home-hero.ts)
 *  - presentation: trình chiếu mở đầu (SiteData.presentation)
 *  - block: một khối trong lib/blocks.ts
 *  - text: chữ đầu trang và dải kêu gọi cuối trang (khối `pages`, theo mã trang)
 */
import type { BlockKey } from '@/lib/blocks';

export type PageTab =
  | { id: string; label: string; kind: 'hero' }
  | { id: string; label: string; kind: 'presentation' }
  | { id: string; label: string; kind: 'block'; block: BlockKey }
  | { id: string; label: string; kind: 'text'; keys: string[] }
  /** Chỉnh trực tiếp trên trang thật (components/admin/LiveEditor.tsx + components/site/cms-editor.ts) */
  | { id: string; label: string; kind: 'visual' };

export type SitePage = { id: string; label: string; path: string; group: string; tabs: PageTab[] };

const text = (keys: string[], label = 'Đầu & cuối trang'): PageTab => ({ id: 'chu', label, kind: 'text', keys });

export const SITE_PAGES: SitePage[] = [
  {
    id: 'trang-chu', label: 'Trang chủ', path: '/', group: 'Trang chính',
    tabs: [
      { id: 'mo-dau', label: 'Màn mở đầu', kind: 'hero' },
      { id: 'anh', label: 'Ảnh doanh nghiệp', kind: 'block', block: 'gallery' },
      text(['mac-dinh'], 'Dải liên hệ mặc định'),
    ],
  },
  { id: 'gioi-thieu', label: 'Giới thiệu', path: '/ve-danava/', group: 'Trang chính', tabs: [text(['ve-danava']), { id: 'noi-dung', label: 'Nội dung trang', kind: 'block', block: 'about' }] },
  { id: 'giai-phap', label: 'Giải pháp (tổng hợp)', path: '/giai-phap/', group: 'Trang chính', tabs: [text(['giai-phap']), text(['studio', 'website'], 'Dải cuối trang sản phẩm')].map((t, i) => ({ ...t, id: i ? 'cta-san-pham' : 'chu' })) },
  { id: 'he-sinh-thai', label: 'Hệ sinh thái', path: '/he-sinh-thai/', group: 'Trang chính', tabs: [text(['he-sinh-thai']), { id: 'noi-dung', label: 'Nội dung trang', kind: 'block', block: 'ecosystem' }] },
  { id: 'du-an', label: 'Dự án', path: '/du-an/', group: 'Trang chính', tabs: [text(['du-an', 'case-study'])] },
  { id: 'blogs', label: 'Blogs', path: '/blogs/', group: 'Trang chính', tabs: [text(['kien-thuc'])] },
  { id: 'lien-he', label: 'Liên hệ', path: '/lien-he/', group: 'Trang chính', tabs: [text(['lien-he'])] },
  { id: 'doi-ngu', label: 'Đội ngũ', path: '/doi-ngu/', group: 'Trang thông tin', tabs: [text(['doi-ngu'])] },
  { id: 'doi-tac', label: 'Đối tác đồng hành', path: '/doi-tac/', group: 'Trang thông tin', tabs: [text(['doi-tac'])] },
  { id: 'tuyen-dung', label: 'Tuyển dụng', path: '/tuyen-dung/', group: 'Trang thông tin', tabs: [{ id: 'noi-dung', label: 'Nội dung & vị trí tuyển', kind: 'block', block: 'careers' }] },
  { id: 'chinh-sach-rieng-tu', label: 'Chính sách quyền riêng tư', path: '/chinh-sach-rieng-tu/', group: 'Chính sách', tabs: [{ id: 'noi-dung', label: 'Nội dung', kind: 'block', block: 'privacy' }] },
  { id: 'chinh-sach-dich-vu', label: 'Chính sách dịch vụ', path: '/chinh-sach-dich-vu/', group: 'Chính sách', tabs: [{ id: 'noi-dung', label: 'Nội dung', kind: 'block', block: 'servicePolicy' }] },
];

export const findSitePage = (id: string) => SITE_PAGES.find(p => p.id === id);
