import type { Metadata } from 'next';
import { NotFoundContent } from '../not-found';

// notFound() trong các trang con (slug sai…): layout (site) đã render header/footer, chỉ cần phần thân.
export const metadata: Metadata = {
  title: '404 — Không tìm thấy trang | DANAVA Solutions',
  robots: { index: false, follow: false }
};

export default function SiteNotFound() {
  return <NotFoundContent />;
}
