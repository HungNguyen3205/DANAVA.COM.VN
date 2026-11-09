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
      { slug: 'trang-chu', icon: 'layout', label: 'Trang chủ', desc: 'Tiêu đề và câu mô tả ở cảnh mở đầu.' },
      { slug: 'trinh-chieu', icon: 'play', label: 'Trình chiếu', desc: 'Nội dung 5 cảnh mở đầu và sơ đồ hệ sinh thái DANAVA.' },
      { slug: 'bai-viet', icon: 'file', label: 'Bài viết', desc: 'Viết, chỉnh sửa và xuất bản bài cho mục Bản tin & Góc nhìn.' },
      { slug: 'du-an', icon: 'briefcase', label: 'Dự án', desc: 'Hồ sơ dự án đã triển khai. Dự án chỉ hiện công khai khi bật xuất bản và lưu.' },
      { slug: 'giai-phap', icon: 'layers', label: 'Giải pháp', desc: 'Tên, mô tả và phạm vi của từng giải pháp DANAVA.' },
      { slug: 'so-lieu', icon: 'trend', label: 'Số liệu', desc: 'Các con số hiển thị trên trang chủ. Để trống khi chưa có số liệu xác nhận.' },
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
