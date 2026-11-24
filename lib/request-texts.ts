/**
 * Kho chữ đã sửa (SiteData.texts) theo TỪNG yêu cầu trang (React cache của Server Components):
 * getSiteContent() ghi vào đây để các khối dùng chung không nhận `data` (blocks.tsx, ui.tsx) vẫn đọc được bản sửa.
 * Ngoài Server Components (trình duyệt, script, test) cache không ghi nhớ → luôn rỗng → dùng chữ mặc định.
 */
import { cache } from 'react';

export const requestTexts = cache((): { texts?: Record<string, string> } => ({}));
