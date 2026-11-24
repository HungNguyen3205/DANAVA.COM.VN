/**
 * Thuộc tính đánh dấu vùng chỉnh trực tiếp (admin → Website → Trang → Chỉnh trực tiếp).
 * Chỉ là thuộc tính data-*: khách truy cập không thấy gì khác; trình chỉnh (components/site/cms-editor)
 * đọc khóa ở đây để biết vùng nào ứng với trường nào trong dữ liệu (lib/cms-paths.ts).
 */
type Attrs = Record<`data-${string}`, string>;

/** Chữ một dòng / nhiều dòng; rich = cho phép *nhấn mạnh* (hiển thị qua rich()). */
export function cmsText(path: string, label: string, opts: { rich?: boolean; multiline?: boolean } = {}): Attrs {
  const a: Attrs = { 'data-cms': path, 'data-cms-label': label };
  if (opts.rich) a['data-cms-rich'] = '';
  if (opts.multiline) a['data-cms-multiline'] = '';
  return a;
}

/** Ảnh: base = khóa của bản ghi ảnh (có các trường image, alt, focus). */
export function cmsImage(base: string, label: string): Attrs {
  return { 'data-cms-img': base, 'data-cms-label': label };
}

/** Nút / liên kết: khóa chữ của nút và khóa đường dẫn. Chữ của nút nằm trong phần tử con có cmsLinkText(). */
export function cmsLink(labelPath: string, hrefPath: string, label: string): Attrs {
  return { 'data-cms-link': labelPath, 'data-cms-href': hrefPath, 'data-cms-label': label };
}
export const cmsLinkText: Attrs = { 'data-cms-link-text': '' };

/** Khối nội dung (viền + tên khối khi chỉnh). Điểm mở rộng cho di chuyển / đổi kích thước sau này. */
export function cmsBlock(name: string, id?: string): Attrs {
  return id ? { 'data-cms-block': name, 'data-cms-block-id': id } : { 'data-cms-block': name };
}

/** Vùng tương tác riêng (vd. mô hình 3D): nhấn giữ ở đây không mở chế độ chỉnh. */
export const cmsSkip: Attrs = { 'data-cms-skip': '' };
