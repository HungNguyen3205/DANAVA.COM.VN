/** Hàm thuần cho dự án — dùng được ở cả server component và client component. */
import type { Person, Project } from '@/lib/content';

const PROJECT_ROLES: Record<string, Record<string, string>> = {
  'hariver-studio': {
    thanh: 'Chỉ đạo giải pháp & kiến trúc hệ thống',
    trang: 'Triển khai vận hành quầy & đào tạo lễ tân',
    avinash: 'Thiết kế nhận diện số & giao diện app hội viên',
    thong: 'Quản lý triển khai kỹ thuật & thiết bị check-in'
  },
  'hue-studio': {
    thanh: 'Chỉ đạo giải pháp & luồng đặt lịch',
    trang: 'Đào tạo nhân sự & hướng dẫn hội viên',
    avinash: 'Thiết kế thời khóa biểu & trải nghiệm đặt chỗ',
    thong: 'Quản lý triển khai & kiểm thử sĩ số lớp'
  }
};

/** Đội ngũ tham gia dự án: chỉ hiển thị khi đã có phân công được xác nhận. */
export function getProjectTeam(projectId: string, staff: Person[]) {
  const roles = PROJECT_ROLES[projectId];
  if (!roles) return [];
  return staff.filter(s => s.visible && roles[s.id]).map(s => ({ ...s, projectRole: roles[s.id] }));
}

/** Tìm dự án theo slug, hoặc theo id (hỗ trợ đường dẫn cũ). */
export function findProject(list: Project[], slug: string) {
  return list.find(p => p.slug === slug) || list.find(p => p.id === slug);
}

/** Ảnh dự án: ảnh đại diện + thư viện ảnh trong CMS; dự án Studio đã kiểm chứng có thêm ảnh giao diện. */
export function projectGallery(p: Project) {
  const items: { src: string; caption: string }[] = [];
  if (p.image) items.push({ src: p.image, caption: p.client || p.title });
  for (const g of p.gallery || []) items.push(g);
  if (!p.gallery?.length) {
    if (p.id === 'hariver-studio' || p.slug === 'hariver-gym-danava-studio') {
      items.push({ src: '/assets/presentation/studio-dashboard.webp', caption: 'Bảng điều khiển DANAVA Studio: hội viên, check-in và gói tập' });
    } else if (p.id === 'hue-studio' || p.slug === 'hue-pilates-yoga-danava-studio') {
      items.push({ src: '/assets/presentation/studio-dashboard.webp', caption: 'Quản lý lịch lớp, sĩ số và danh sách chờ trên DANAVA Studio' });
    }
  }
  return items.filter((v, i, a) => a.findIndex(x => x.src === v.src) === i);
}

