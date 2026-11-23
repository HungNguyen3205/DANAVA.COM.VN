import Admin from '@/components/Admin';
import { LEGACY_SECTIONS, allAdminItems } from '@/components/adminNav';

export const metadata = {
  title: 'Quản trị DANAVA',
  robots: { index: false, follow: false }
};

/** Mục hiện tại + đường dẫn cũ (được chuyển sang vị trí mới khi mở). */
export function generateStaticParams() {
  return [...allAdminItems.map(i => i.slug), ...Object.keys(LEGACY_SECTIONS)].map(section => ({ section }));
}

export default async function Page({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  return <Admin section={(await params).section} />;
}
