/**
 * Thuộc tính đánh dấu vùng chỉnh trực tiếp (admin → Website → Trang → Chỉnh trực tiếp).
 * Chỉ là thuộc tính data-*: khách truy cập không thấy gì khác; trình chỉnh (components/site/cms-editor)
 * đọc khóa ở đây để biết vùng nào ứng với trường nào trong dữ liệu (lib/cms-paths.ts).
 */
type Attrs = Record<`data-${string}`, string>;

/** Chữ một dòng / nhiều dòng; rich = cho phép *nhấn mạnh* (hiển thị qua rich()). */
export function cmsText(path: string, label: string, opts: { rich?: boolean; multiline?: boolean } & Scope = {}): Attrs {
  const a: Attrs = { 'data-cms': path, 'data-cms-label': label, ...scope(opts) };
  if (opts.rich) a['data-cms-rich'] = '';
  if (opts.multiline) a['data-cms-multiline'] = '';
  return a;
}

/** Phạm vi của dữ liệu: global = áp dụng toàn website; record = hồ sơ (sản phẩm, bài viết, dự án) dùng ở nhiều nơi. */
type Scope = { scope?: 'global' | 'record'; scopeLabel?: string };
function scope(o: Scope): Attrs {
  const a: Attrs = {};
  if (o.scope) a['data-cms-scope'] = o.scope;
  if (o.scopeLabel) a['data-cms-scope-label'] = o.scopeLabel;
  return a;
}

/** Ảnh: base = khóa của bản ghi ảnh (có các trường image, alt, focus). */
export function cmsImage(base: string, label: string, opts: { meta?: boolean } & Scope = {}): Attrs {
  // meta = bản ghi ảnh có thêm mô tả (alt) và vị trí cắt (focus)
  return { 'data-cms-img': base, 'data-cms-label': label, ...(opts.meta ? { 'data-cms-img-meta': '' } : {}), ...scope(opts) };
}

/** Nút / liên kết: khóa chữ của nút và khóa đường dẫn. Chữ của nút nằm trong phần tử con có cmsLinkText(). */
export function cmsLink(labelPath: string, hrefPath: string, label: string): Attrs {
  return { 'data-cms-link': labelPath, 'data-cms-href': hrefPath, 'data-cms-label': label };
}
export const cmsLinkText: Attrs = { 'data-cms-link-text': '' };

/** Khối nội dung (viền + tên khối khi chỉnh). Điểm mở rộng cho di chuyển / đổi kích thước sau này. */
export function cmsBlock(name: string, id?: string, opts: { panel?: string } & Scope = {}): Attrs {
  // panel = ngăn thuộc tính mở khi chọn khối (vd. 'page:anh', 'menu', 'site') — components/admin/LiveEditor.tsx
  return { 'data-cms-block': name, ...(id ? { 'data-cms-block-id': id } : {}), ...(opts.panel ? { 'data-cms-panel': opts.panel } : {}), ...scope(opts) };
}

/** Vùng tương tác riêng (vd. mô hình 3D): nhấn giữ ở đây không mở chế độ chỉnh. */
export const cmsSkip: Attrs = { 'data-cms-skip': '' };
