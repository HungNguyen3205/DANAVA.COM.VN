/**
 * Dữ liệu theo TỪNG yêu cầu trang (React cache của Server Components):
 * getSiteContent() ghi vào đây để các khối dùng chung không nhận `data` (blocks.tsx, ui.tsx) và hàm seo() vẫn đọc được:
 *  - texts: chữ đã sửa (SiteData.texts)
 *  - view: ngôn ngữ đang xem + bản dịch chữ cố định (txt.*) và tiêu đề / mô tả SEO (meta:…) — lib/i18n-server.ts
 * Ngoài Server Components (trình duyệt, script, test) cache không ghi nhớ → luôn rỗng → tiếng Việt, chữ mặc định.
 */
import { cache } from 'react';
import type { LocaleView } from './content.ts';

export const requestTexts = cache((): { texts?: Record<string, string>; view?: LocaleView } => ({}));
