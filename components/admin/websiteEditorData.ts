/**
 * Chỉnh sửa website (admin → Chỉnh sửa website): danh sách trang cho bộ chọn và chuyển hướng từ đường dẫn admin cũ.
 * Dữ liệu lấy từ bản đang soạn của admin (cùng nguồn với các module Sản phẩm, Bài viết, Dự án, Landing page).
 */
import type { SiteData } from '@/lib/content';
import { DICH_VU } from '@/lib/dich-vu';
import { SITE_PAGES, findSitePage } from './websitePages';
import type { EditorPage } from './LiveEditor';
import { webTemplatesOf } from '@/lib/web-templates';

export const EDITOR_SLUG = 'chinh-sua';
export const EDITOR_LAST_KEY = 'danava-editor-last';

/** Mọi trang chỉnh được: trang chính, danh sách, chi tiết sản phẩm / dịch vụ / bài viết / dự án, landing page nội bộ. */
export function editorPages(d: SiteData): EditorPage[] {
  const out: EditorPage[] = SITE_PAGES.map(p => ({ path: p.path, label: p.label, type: 'Trang' }));
  const add = (p: EditorPage) => { if (!out.some(x => x.path === p.path)) out.push(p); };
  add({ path: '/dich-vu/', label: 'Dịch vụ (tổng hợp)', type: 'Trang' });
  add({ path: '/bao-gia-web/', label: 'Báo giá website', type: 'Trang' });
  // Menu Dịch vụ (lib/services-menu.ts): báo giá sự kiện, setup phòng gym
  add({ path: '/bao-gia-su-kien/', label: 'Báo giá tổ chức sự kiện', type: 'Trang' });
  add({ path: '/giai-phap/setup-van-hanh-phong-gym/', label: 'Setup & vận hành phòng gym', type: 'Trang' });
  add({ path: '/bao-gia-setup-phong-gym/', label: 'Phòng lab 3D setup phòng gym', type: 'Trang' });
  add({ path: '/thiet-bi-gym/', label: 'Thiết bị phòng gym', type: 'Trang', note: 'giá máy sửa ở Giải pháp → Thiết bị phòng gym' });
  // Kho mẫu website: trang danh sách, trang xem trước và chữ bên trong từng demo (Giải pháp → Kho mẫu website)
  add({ path: '/mau-website/', label: 'Kho mẫu website', type: 'Trang', note: 'thẻ mẫu sửa ở Giải pháp → Kho mẫu website' });
  for (const t of webTemplatesOf(d)) if (t.kind === 'demo') {
    add({ path: `/mau-website/${t.id}/`, label: `Xem trước: ${t.name}`, type: 'Kho mẫu' });
    add({ path: `/demo/${t.id}/`, label: `Demo: ${t.brand}`, type: 'Kho mẫu', note: 'chữ bên trong trang demo' });
  }
  for (const s of d.services) if (s.published !== false) add({ path: `/giai-phap/${s.slug}/`, label: s.title, type: 'Sản phẩm' });
  for (const s of d.subServices || []) {
    const parent = d.services.find(x => x.id === s.parentId);
    if (parent && s.published && parent.published !== false) add({ path: `/giai-phap/${parent.slug}/${s.slug}/`, label: s.title, type: 'Sản phẩm', note: `trang con của ${parent.title}` });
  }
  for (const s of DICH_VU) add({ path: `/dich-vu/${s.slug}/`, label: s.title, type: 'Dịch vụ' });
  for (const p of d.posts) add({ path: `/blogs/${p.slug}/`, label: p.title, type: 'Bài viết', note: p.published ? undefined : 'nháp' });
  for (const p of d.projects || []) if (p.published) add({ path: `/du-an/${p.slug}/`, label: p.title, type: 'Dự án' });
  for (const l of d.landings || []) if (l.kind === 'internal') add({ path: `/lp/${l.slug}/`, label: l.title, type: 'Landing page', note: l.status === 'published' ? undefined : 'nháp' });
  return out;
}

/** Bản ghi nguồn của một trang chi tiết (để mở hồ sơ đầy đủ trong module). */
export function recordOf(d: SiteData, path: string) {
  const [, a, b, c] = path.split('/');
  if (a === 'giai-phap' && b && !c) { const s = d.services.find(x => x.slug === b); if (s) return { kind: 'service' as const, id: s.id, title: s.title }; }
  if (a === 'blogs' && b && b !== 'chu-de' && b !== 'doc') { const p = d.posts.find(x => x.slug === b); if (p) return { kind: 'post' as const, id: p.id, title: p.title }; }
  if (a === 'du-an' && b) { const p = (d.projects || []).find(x => x.slug === b); if (p) return { kind: 'project' as const, id: p.id, title: p.title }; }
  if (a === 'lp' && b) { const l = (d.landings || []).find(x => x.slug === b); if (l) return { kind: 'landing' as const, id: l.id, title: l.title }; }
  return null;
}

/**
 * Đường dẫn admin cũ của nhóm Website → trình biên tập (giữ bookmark / liên kết cũ):
 *  trang/?page=X[&tab=Y] → chinh-sua/?path=<đường dẫn trang>[&panel=page:Y]
 *  landing-page/… → chinh-sua/?panel=landings (giữ id, new, mau) · mau-khoi → panel=blocks · menu → panel=menu · giao-dien → panel=site
 */
export function legacyEditorTarget(section: string, search: string): string | null {
  const q = new URLSearchParams(search);
  const out = new URLSearchParams();
  if (section === 'trang') {
    const page = findSitePage(q.get('page') || '');
    if (page) out.set('path', page.path);
    const tab = q.get('tab') || '';
    if (page && tab && !['giao-dien', 'truc-tiep', 'visual'].includes(tab)) out.set('panel', `page:${tab}`);
    if (page && !tab && page.tabs.length && page.path !== '/') out.set('panel', 'page');
  } else if (section === 'landing-page') {
    out.set('panel', 'landings');
    for (const k of ['id', 'new', 'mau', 'tab']) { const v = q.get(k); if (v) out.set(k, v); }
  } else if (section === 'mau-khoi') out.set('panel', 'blocks');
  else if (section === 'menu') out.set('panel', 'menu');
  else if (section === 'giao-dien') out.set('panel', 'site');
  else return null;
  const s = out.toString();
  return `${EDITOR_SLUG}/${s ? `?${s}` : ''}`;
}
