import {
  LayoutDashboard, Megaphone, GraduationCap, Hotel, Clapperboard, Plane, Globe, Users, CalendarDays, Handshake, Sparkles,
  type LucideIcon
} from 'lucide-react';
import type { EcosystemItem } from '@/lib/presentation';
import type { Service } from '@/lib/content';

/**
 * Lớp trình bày cho dữ liệu CMS: ánh xạ id → icon, ảnh, nhóm, đường dẫn.
 * Nội dung chữ (tên, mô tả, tính năng) vẫn lấy từ CMS để quản trị viên tự sửa.
 */
export type Tone = 'blue' | 'orange' | 'sky' | 'navy' | 'green';
export type GroupId = 'phan-mem' | 'marketing' | 'trai-nghiem';

export const GROUPS: { id: GroupId; label: string; short: string }[] = [
  { id: 'phan-mem', label: 'Phần mềm quản lý', short: 'Phần mềm' },
  { id: 'marketing', label: 'Marketing & Media', short: 'Marketing' },
  { id: 'trai-nghiem', label: 'Trải nghiệm & Cộng đồng', short: 'Trải nghiệm' }
];

export type OfferingMeta = {
  group: GroupId;
  tag: string;
  icon: LucideIcon;
  tone: Tone;
  href: string;
  external?: boolean;
  image?: string;
  imageAlt?: string;
};

/** Khớp với id trong presentation.ecosystem (CMS → Trình chiếu). */
export const OFFERING_META: Record<string, OfferingMeta> = {
  studio: { group: 'phan-mem', tag: 'Gym · Yoga · Pilates · Spa', icon: LayoutDashboard, tone: 'blue', href: '/giai-phap/danava-studio/', image: '/assets/presentation/studio-dashboard.webp', imageAlt: 'Giao diện tổng quan DANAVA Studio' },
  pms: { group: 'phan-mem', tag: 'Khách sạn · Căn hộ', icon: Hotel, tone: 'sky', href: '/he-sinh-thai/#pms' },
  elearning: { group: 'phan-mem', tag: 'Đào tạo trực tuyến', icon: GraduationCap, tone: 'navy', href: '/he-sinh-thai/#elearning' },
  digital: { group: 'marketing', tag: 'Website · Quảng cáo · Nội dung', icon: Megaphone, tone: 'orange', href: '/giai-phap/digital-marketing/' },
  media: { group: 'marketing', tag: 'Sự kiện · Quay phim · Chụp ảnh', icon: Clapperboard, tone: 'navy', href: '/giai-phap/su-kien-truyen-thong/', image: '/assets/legacy/event-group.webp', imageAlt: 'Workshop do DANAVA tổ chức' },
  go: { group: 'trai-nghiem', tag: 'Tour · Retreat · Dịch vụ', icon: Plane, tone: 'green', href: '/giai-phap/du-lich-su-kien/', image: '/assets/legacy/community.webp', imageAlt: 'Buổi tập yoga ngoài trời' }
};

export const FALLBACK_META: OfferingMeta = { group: 'trai-nghiem', tag: 'DANAVA', icon: Sparkles, tone: 'blue', href: '/he-sinh-thai/' };

export type Offering = EcosystemItem & { meta: OfferingMeta; featureList: string[] };

export function offeringsFrom(items: EcosystemItem[] | undefined): Offering[] {
  return (items || [])
    .filter(i => i.visible)
    .map(i => ({
      ...i,
      meta: OFFERING_META[i.id] || FALLBACK_META,
      featureList: i.features.split(/\n|·/).map(s => s.trim()).filter(Boolean)
    }));
}

/** Khớp với id trong data.services (CMS → Giải pháp). */
export const SERVICE_META: Record<string, { icon: LucideIcon; tone: Tone; group: GroupId; image?: string; imageAlt?: string; kicker: string }> = {
  studio: { icon: LayoutDashboard, tone: 'blue', group: 'phan-mem', image: '/assets/presentation/studio-dashboard.webp', imageAlt: 'Màn hình tổng quan DANAVA Studio', kicker: 'Phần mềm quản lý' },
  website: { icon: Globe, tone: 'sky', group: 'marketing', kicker: 'Không gian số' },
  marketing: { icon: Megaphone, tone: 'orange', group: 'marketing', image: '/assets/legacy/event-session.webp', imageAlt: 'Ảnh tổng kết có khung nhận diện cho workshop do DANAVA tổ chức', kicker: 'Digital Marketing' },
  events: { icon: Clapperboard, tone: 'navy', group: 'trai-nghiem', image: '/assets/profile/set-stage.webp', imageAlt: 'Sân khấu và đạo cụ phim trường tại Nhà hát Trưng Vương', kicker: 'Sự kiện & Truyền thông' },
  travel: { icon: CalendarDays, tone: 'green', group: 'trai-nghiem', image: '/assets/legacy/community.webp', imageAlt: 'Cộng đồng yoga tập luyện ngoài trời', kicker: 'Du lịch trải nghiệm' },
  community: { icon: Users, tone: 'navy', group: 'trai-nghiem', image: '/assets/legacy/community.webp', imageAlt: 'Cộng đồng yoga tập luyện ngoài trời', kicker: 'Cộng đồng' }
};

export const serviceMeta = (s: Service) => SERVICE_META[s.id] || { icon: Handshake, tone: 'blue' as Tone, group: 'trai-nghiem' as GroupId, kicker: 'Giải pháp' };

/** Thứ tự ưu tiên hiển thị giải pháp: sản phẩm chủ lực trước (lib/site-queries.ts). */
export { SERVICE_ORDER, sortServices } from '@/lib/site-queries';

export { CONTACT } from '@/lib/company';
import { CONTACT } from '@/lib/company';

/** Định dạng số điện thoại CMS thành dạng dễ đọc: 0935 91 76 77 */
export function formatPhone(raw: string | undefined) {
  const d = (raw || CONTACT.phone).replace(/\D/g, '');
  if (d.length === 10) return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
  return raw || CONTACT.phoneDisplay;
}

export function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
}

export const excerpt = (text: string, max = 160) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max).replace(/\s+\S*$/, '') + '…' : clean;
};
