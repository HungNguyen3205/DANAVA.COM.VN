'use client';

import { useCallback, useEffect, useState } from 'react';

export type AdminLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_type?: string;
  service?: string;
  source?: string;
  message: string;
  created_at: number;
  status: string;
  assigned_to?: string;
  assigned_note?: string;
};

export type AdminAnalytics = {
  days: number;
  totals: { pageviews: number; visitors: number; sessions: number; seconds: number };
  online: { n: number };
  daily: { day: string; pageviews: number; visitors: number }[];
  pages: { path: string; pageviews: number; seconds: number }[];
  sources: { source: string; pageviews: number }[];
};

/** Nhóm menu quản trị — thứ tự theo tần suất dùng: theo dõi → nội dung → tư liệu. */
export const adminNav: {
  group: string;
  items: { slug: string; icon: string; label: string; desc: string }[];
}[] = [
  {
    group: 'Tổng quan',
    items: [
      { slug: 'tong-quan', icon: 'home', label: 'Tổng quan', desc: 'Tình hình website và những việc cần xử lý hôm nay.' },
      { slug: 'khach-hang', icon: 'inbox', label: 'Khách hàng', desc: 'Yêu cầu tư vấn gửi từ website — phân công người phụ trách và theo dõi tiến độ.' },
      { slug: 'thong-ke', icon: 'chart', label: 'Thống kê', desc: 'Lượt truy cập thực tế từ trình duyệt đồng ý đo lường. Không thu thập IP, không tính lượt của quản trị viên.' },
    ],
  },
  {
    group: 'Nội dung',
    items: [
      { slug: 'trang-chu', icon: 'layout', label: 'Trang chủ', desc: 'Tiêu đề H1, thông điệp thương hiệu và câu mô tả ở màn mở đầu.' },
      { slug: 'trinh-chieu', icon: 'play', label: 'Trình chiếu', desc: 'Nội dung 5 cảnh mở đầu và sơ đồ hệ sinh thái DANAVA.' },
      { slug: 'bai-viet', icon: 'file', label: 'Bài viết', desc: 'Viết, chỉnh sửa và xuất bản bài cho mục Kiến thức: danh mục, tác giả, giải pháp liên quan, SEO.' },
      { slug: 'trung-bay', icon: 'globe', label: 'Portfolio', desc: 'Website, landing page và chương trình sự kiện đã thực hiện: chọn mục nổi bật, sắp xếp thứ tự, phạm vi và case study.' },
      { slug: 'du-an', icon: 'briefcase', label: 'Dự án', desc: 'Hồ sơ dự án đã triển khai. Dự án chỉ hiện công khai khi bật xuất bản và lưu.' },
      { slug: 'giai-phap', icon: 'layers', label: 'Giải pháp', desc: 'Nội dung, FAQ, quy trình, chi phí, SEO của từng giải pháp và các trang dịch vụ con.' },
      { slug: 'chu-de', icon: 'menu', label: 'Danh mục kiến thức', desc: 'Nhóm chủ đề cho mục Kiến thức, gắn với giải pháp liên quan.' },
      { slug: 'bang-chung', icon: 'check', label: 'Đối tác & nhận xét', desc: 'Khách hàng tiêu biểu và nhận xét — chỉ hiển thị khi đã có quyền công bố.' },
      { slug: 'so-lieu', icon: 'trend', label: 'Số liệu', desc: 'Các con số hiển thị trên trang chủ. Để trống khi chưa có số liệu xác nhận.' },
    ],
  },
  {
    group: 'Trang & thông tin',
    items: [
      { slug: 'cong-ty', icon: 'building', label: 'Thông tin công ty', desc: 'Pháp nhân, địa chỉ, giờ làm việc, bản đồ, Facebook, YouTube, sứ mệnh — dùng ở chân trang, Liên hệ, Về DANAVA và dữ liệu cho Google.' },
      { slug: 'menu-giai-phap', icon: 'menu', label: 'Menu Giải pháp', desc: 'Các cột và mục trong menu Giải pháp ở đầu trang và menu điện thoại.' },
      { slug: 'chu-tren-trang', icon: 'type', label: 'Chữ trên các trang', desc: 'Tiêu đề, câu dẫn đầu trang và dải kêu gọi liên hệ cuối trang của từng trang.' },
      { slug: 've-danava', icon: 'info', label: 'Về DANAVA', desc: 'Giá trị, sứ mệnh, tầm nhìn, cột mốc, ảnh hoạt động, nguyên tắc làm việc và quy trình hợp tác.' },
      { slug: 'he-sinh-thai', icon: 'network', label: 'Hệ sinh thái', desc: 'Khối năng lực, hành trình khách hàng, đơn vị và sản phẩm đang chạy trên trang Hệ sinh thái.' },
      { slug: 'ho-so-nhan-su', icon: 'idcard', label: 'Hồ sơ nhân sự', desc: 'Giới thiệu, chuyên môn, kỹ năng, vai trò trong dự án và liên kết của từng nhân sự.' },
      { slug: 'chinh-sach', icon: 'scroll', label: 'Chính sách', desc: 'Chính sách quyền riêng tư và chính sách dịch vụ (SLA, kênh hỗ trợ, điều khoản).' },
    ],
  },
  {
    group: 'Tư liệu',
    items: [
      { slug: 'thu-vien', icon: 'image', label: 'Thư viện ảnh', desc: 'Tải ảnh lên — hệ thống tự xóa thông tin EXIF, thu nhỏ và nén sang WebP.' },
      { slug: 'nhan-su', icon: 'users', label: 'Nhân sự', desc: 'Đội ngũ hiển thị trên website. Hồ sơ hiển thị không cấp quyền quản trị.' },
    ],
  },
];

export const adminSettings = {
  slug: 'cai-dat',
  icon: 'settings',
  label: 'Cài đặt',
  desc: 'Thông tin liên hệ, sao lưu và khôi phục dữ liệu.',
};

export const allAdminItems = [...adminNav.flatMap(g => g.items.map(i => ({ ...i, group: g.group }))), { ...adminSettings, group: 'Hệ thống' }];

export function sectionInfo(slug: string) {
  return allAdminItems.find(i => i.slug === slug) || allAdminItems[0];
}

export const leadStatus: Record<string, { label: string; tone: string }> = {
  new: { label: 'Mới', tone: 'amber' },
  assigned: { label: 'Đã phân công', tone: 'blue' },
  contacted: { label: 'Đang trao đổi', tone: 'violet' },
  completed: { label: 'Hoàn tất', tone: 'green' },
};

export function timeAgo(ms: number) {
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(ms).toLocaleDateString('vi-VN');
}

/** Danh sách khách hàng dùng chung cho thanh bên, chuông thông báo và trang Tổng quan. */
export function useAdminLeads(limit = 100) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/leads/?limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải danh sách khách hàng.');
      setLeads((await res.json()).leads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [limit]);
  useEffect(() => {
    reload();
    const onFocus = () => reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);
  return { leads, setLeads, loading, error, reload };
}

export function useAdminAnalytics(days = 30) {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/analytics/?days=${days}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(v => alive && setData(v))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [days]);
  return data;
}

/** Điền đủ các ngày trống để biểu đồ liền mạch. */
export function fillDays(daily: { day: string; pageviews: number; visitors: number }[], days: number) {
  const map = new Map(daily.map(d => [d.day, d]));
  const out: { day: string; pageviews: number; visitors: number }[] = [];
  const now = new Date(Date.now() + 7 * 3600_000);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000).toISOString().slice(0, 10);
    out.push(map.get(d) || { day: d, pageviews: 0, visitors: 0 });
  }
  return out;
}

export async function csrfToken() {
  const s = await fetch('/api/admin/session/', { cache: 'no-store' }).then(r => r.json());
  return String(s.csrf || '');
}
