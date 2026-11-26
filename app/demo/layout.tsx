import type { Metadata } from 'next';
import { demoFontVars } from '@/lib/demo-fonts';
import './demo.css';
import { CmsOverlay } from '@/components/site/CmsOverlay';
import { CmsStyles } from '@/components/site/CmsStyles';

/** Demo chạy thật của kho mẫu (/mau-website/): trang độc lập, không header/footer DANAVA, không lập chỉ mục. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  // CmsOverlay: sửa chữ tại chỗ khi mở trong Quản trị → Chỉnh sửa website (?cms=1)
  return <div className={`dm ${demoFontVars}`}>{children}<CmsStyles /><CmsOverlay /></div>;
}
