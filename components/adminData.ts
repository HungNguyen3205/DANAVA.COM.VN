'use client';

import { useCallback, useEffect, useState } from 'react';
export * from './adminNav';

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
export function useAdminLeads(limit = 100, enabled = true) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    if (!enabled) return;
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
  }, [limit, enabled]);
  useEffect(() => {
    if (!enabled) return;
    reload();
    const onFocus = () => reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload, enabled]);
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
