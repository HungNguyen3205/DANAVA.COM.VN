'use client';
/**
 * Cổng vào trình chỉnh trực tiếp: chỉ bật khi trang mở với ?cms=1 BÊN TRONG trang admin cùng nguồn
 * (admin → Website → Trang → Chỉnh trực tiếp). Khi đó mới tải trình chỉnh (./cms-editor, import động);
 * khách truy cập bình thường không tải thêm gì và trang hoạt động như cũ.
 * Bản nháp được máy chủ hiển thị chỉ khi người mở đã đăng nhập admin (lib/database.ts → getSiteContent).
 */
import { useEffect } from 'react';

function insideAdmin(): boolean {
  if (window.parent === window || new URLSearchParams(location.search).get('cms') !== '1') return false;
  try {
    // Cùng nguồn mới đọc được location của cửa sổ cha; khác nguồn → ném lỗi → không bật
    return window.parent.location.origin === location.origin && window.parent.location.pathname.startsWith('/admin');
  } catch {
    return false;
  }
}

export function CmsOverlay() {
  useEffect(() => {
    if (!insideAdmin()) return;
    let alive = true;
    import('./cms-editor').then(m => { if (alive) m.startCmsEditor(); });
    return () => { alive = false; };
  }, []);
  return null;
}
