import { LandingPreview } from '@/components/site/LandingPreview';

/** Khung xem trước cho trình chỉnh sửa landing page (admin). Không có dữ liệu riêng, không lập chỉ mục. */
export const metadata = { title: 'Xem trước landing page', robots: { index: false, follow: false } };

export default function Page() {
  return <LandingPreview />;
}
