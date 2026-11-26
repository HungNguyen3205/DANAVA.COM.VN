import type { Metadata } from 'next';
import { demoFontVars } from '@/lib/demo-fonts';
import './demo.css';

/** Demo chạy thật của kho mẫu (/mau-website/): trang độc lập, không header/footer DANAVA, không lập chỉ mục. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`dm ${demoFontVars}`}>{children}</div>;
}
