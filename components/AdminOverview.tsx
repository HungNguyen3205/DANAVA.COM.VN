'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Icon } from './AdminIcons';
import { fillDays, leadStatus, timeAgo, useAdminAnalytics, type AdminLead } from './adminData';
import { initials } from './AdminShell';
import { postPhotos } from '@/lib/media';
import type { SiteData } from '@/lib/content';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : `${Math.round(s)} giây`);
const dayLabel = (d: string) => d.slice(8, 10) + '/' + d.slice(5, 7);

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/* ---------- Biểu đồ SVG nhẹ, không thư viện ---------- */
function AreaChart({ values, labels }: { values: number[]; labels: string[] }) {
  const w = 640,
    h = 150,
    max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - 12 - (v / max) * (h - 30)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const peak = values.indexOf(Math.max(...values));
  const [px, py] = pts[peak] || [0, h];
  return (
    <div className="adm-area">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Lượt xem trang theo ngày">
        <defs>
          <linearGradient id="adm-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--adm-accent)" stopOpacity=".42" />
            <stop offset="1" stopColor="var(--adm-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map(f => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="adm-grid-line" />
        ))}
        <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#adm-area-fill)" />
        <path d={line} className="adm-area-line" vectorEffect="non-scaling-stroke" />
        {values.some(Boolean) && <line x1={px} x2={px} y1="0" y2={h} className="adm-peak-line" vectorEffect="non-scaling-stroke" />}
      </svg>
      {values.some(Boolean) && (
        <span className="adm-peak" style={{ left: `${(px / w) * 100}%`, top: `${(py / h) * 100}%` }} aria-hidden="true" />
      )}
      <div className="adm-axis">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

function Bars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="adm-bars" role="img" aria-label="Khách truy cập theo ngày">
      {values.map((v, i) => (
        <span key={i} style={{ height: `${Math.max(4, (v / max) * 100)}%` }} className={i === values.length - 1 ? 'is-now' : ''} />
      ))}
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  const w = 110,
    h = 34,
    max = Math.max(1, ...values);
  const d = values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / Math.max(1, values.length - 1)) * w).toFixed(1)},${(h - 3 - (v / max) * (h - 8)).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="adm-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function AdminOverview({ data, leads }: { data: SiteData; leads: AdminLead[] }) {
  const analytics = useAdminAnalytics(30);
  const days = useMemo(() => fillDays(analytics?.daily || [], 30), [analytics]);
  const totals = analytics?.totals || { pageviews: 0, visitors: 0, sessions: 0, seconds: 0 };
  const hasTraffic = totals.pageviews > 0;

  const posts = data.posts;
  const published = posts.filter(p => p.published);
  const latest = [...published].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  const latestImage = latest ? latest.image || postPhotos[latest.id] : '';
  const projects = data.projects || [];

  const week = Date.now() - 7 * 86400_000;
  const leadsWeek = leads.filter(l => l.created_at >= week).length;
  const newLeads = leads.filter(l => (l.status || 'new') === 'new');
  const leadDays = useMemo(() => {
    const out = Array(14).fill(0);
    const start = Date.now() - 14 * 86400_000;
    for (const l of leads) if (l.created_at >= start) out[Math.min(13, Math.floor((l.created_at - start) / 86400_000))]++;
    return out;
  }, [leads]);

  const checklist = [
    { done: projects.some(p => p.published), label: 'Có ít nhất một dự án xuất bản', href: 'du-an' },
    { done: published.length >= 3, label: 'Có từ 3 bài viết xuất bản trở lên', href: 'bai-viet' },
    { done: data.staff.some(s => s.visible), label: 'Hồ sơ đội ngũ đang hiển thị', href: 'nhan-su' },
    { done: Boolean(data.phone && data.email), label: 'Hotline và email liên hệ đã điền', href: 'cai-dat' },
    { done: newLeads.length === 0, label: 'Không còn khách hàng mới chưa phân công', href: 'khach-hang' },
  ];

  return (
    <div className="adm-overview">
      <div className="adm-ov-top">
        {/* Thẻ nổi bật: bài viết mới nhất + lưu lượng 30 ngày */}
        <section className="adm-card adm-hero" style={latestImage ? { ['--hero-img' as string]: `url("${latestImage}")` } : undefined}>
          <div className="adm-hero-top">
            <span className="adm-chip">
              <Icon name="file" size={14} />
              {latest ? `Bài viết mới nhất · ${latest.date ? latest.date.split('-').reverse().join('/') : 'chưa đặt ngày'}` : 'Chưa có bài viết xuất bản'}
            </span>
            <span className="adm-chip">30 ngày</span>
          </div>
          <h2>{latest?.title || 'Website DANAVA Solutions'}</h2>
          <div className="adm-hero-stats">
            <div>
              <strong>{fmt(totals.pageviews)}</strong>
              <small>lượt xem trang</small>
            </div>
            <div>
              <strong>{fmt(totals.visitors)}</strong>
              <small>khách truy cập</small>
            </div>
            <div>
              <strong>{fmt(totals.sessions)}</strong>
              <small>phiên truy cập</small>
            </div>
            <div>
              <strong>{totals.sessions ? duration(totals.seconds / totals.sessions) : '—'}</strong>
              <small>thời gian / phiên</small>
            </div>
          </div>
          <div className="adm-hero-chart">
            <p>
              <b>{hasTraffic ? fmt(Math.max(...days.map(d => d.pageviews))) : 0}</b> lượt xem cao nhất trong một ngày
            </p>
            <AreaChart values={days.map(d => d.pageviews)} labels={days.map(d => dayLabel(d.day))} />
            {!hasTraffic && <p className="adm-chart-empty">Chưa có lượt truy cập được đo. Số liệu xuất hiện khi khách đồng ý đo lường trên website.</p>}
          </div>
          <div className="adm-hero-foot">
            <Link href="/admin/thong-ke/" className="adm-btn adm-btn-light">
              Mở báo cáo truy cập <Icon name="arrow" size={16} />
            </Link>
            {latest && (
              <Link href={`/kien-thuc/${latest.slug}/`} target="_blank" className="adm-btn adm-btn-ghost">
                Xem bài trên website <Icon name="external" size={14} />
              </Link>
            )}
          </div>
        </section>

        {/* Thẻ trực tiếp */}
        <section className="adm-card adm-live">
          <div className="adm-card-head">
            <div>
              <h2>Đang xem website</h2>
              <p>Trong 90 giây vừa qua</p>
            </div>
            <span className="adm-live-pill">
              <i /> Trực tiếp
            </span>
          </div>
          <p className="adm-live-number">
            <strong>{fmt(analytics?.online?.n || 0)}</strong> người
          </p>
          <Bars values={days.map(d => d.visitors)} />
          <div className="adm-axis">
            <span>30 ngày trước</span>
            <span>hôm nay</span>
          </div>
          <div className="adm-top-pages">
            <p className="adm-mini-title">Trang xem nhiều</p>
            {(analytics?.pages || []).slice(0, 4).map(p => (
              <div key={p.path} className="adm-top-page">
                <span>{p.path === '/' ? 'Trang chủ' : p.path}</span>
                <b>{fmt(p.pageviews)}</b>
              </div>
            ))}
            {!(analytics?.pages || []).length && <p className="adm-empty-mini">Chưa có dữ liệu trang.</p>}
          </div>
        </section>
      </div>

      {/* Thẻ số liệu */}
      <div className="adm-stats">
        <Link href="/admin/khach-hang/" className="adm-card adm-stat tone-amber">
          <span className="adm-stat-label">
            <Icon name="inbox" size={16} /> Khách hàng liên hệ
          </span>
          <strong>{fmt(leads.length)}</strong>
          <span className="adm-stat-foot">
            <em className={leadsWeek ? 'up' : ''}>+{leadsWeek}</em> trong 7 ngày
          </span>
          <Spark values={leadDays} />
        </Link>
        <Link href="/admin/khach-hang/" className="adm-card adm-stat tone-rose">
          <span className="adm-stat-label">
            <Icon name="bell" size={16} /> Chờ phân công
          </span>
          <strong>{fmt(newLeads.length)}</strong>
          <span className="adm-stat-foot">{newLeads.length ? 'Cần người phụ trách liên hệ lại' : 'Đã xử lý hết'}</span>
        </Link>
        <Link href="/admin/bai-viet/" className="adm-card adm-stat tone-teal">
          <span className="adm-stat-label">
            <Icon name="file" size={16} /> Bài viết xuất bản
          </span>
          <strong>{fmt(published.length)}</strong>
          <span className="adm-stat-foot">{posts.length - published.length} bản nháp</span>
        </Link>
        <Link href="/admin/du-an/" className="adm-card adm-stat tone-blue">
          <span className="adm-stat-label">
            <Icon name="briefcase" size={16} /> Dự án công khai
          </span>
          <strong>{fmt(projects.filter(p => p.published).length)}</strong>
          <span className="adm-stat-foot">trên {projects.length} hồ sơ dự án</span>
        </Link>
      </div>

      <div className="adm-ov-bottom">
        <section className="adm-card">
          <div className="adm-card-head">
            <div>
              <h2>Khách hàng gần đây</h2>
              <p>Yêu cầu tư vấn mới nhất từ website</p>
            </div>
            <Link href="/admin/khach-hang/" className="adm-btn adm-btn-ghost">
              Tất cả <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className="adm-list">
            {leads.slice(0, 5).map(l => {
              const st = leadStatus[l.status || 'new'] || leadStatus.new;
              return (
                <Link key={l.id} href="/admin/khach-hang/" className="adm-list-row">
                  <span className="adm-avatar sm">{initials(l.name)}</span>
                  <span className="adm-list-main">
                    <b>{l.name}</b>
                    <small>{l.service || 'Tư vấn chung'}</small>
                  </span>
                  <span className={`adm-pill tone-${st.tone}`}>{st.label}</span>
                  <small className="adm-list-time">{timeAgo(l.created_at)}</small>
                </Link>
              );
            })}
            {!leads.length && <p className="adm-empty-mini">Chưa có khách hàng gửi yêu cầu.</p>}
          </div>
        </section>

        <section className="adm-card">
          <div className="adm-card-head">
            <div>
              <h2>Sẵn sàng đưa lên website thật</h2>
              <p>
                {checklist.filter(c => c.done).length}/{checklist.length} mục đã hoàn thành
              </p>
            </div>
          </div>
          <div className="adm-progress">
            <span style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }} />
          </div>
          <ul className="adm-checklist">
            {checklist.map(c => (
              <li key={c.label} className={c.done ? 'is-done' : ''}>
                <span className="adm-check">{c.done && <Icon name="check" size={14} />}</span>
                <span>{c.label}</span>
                {!c.done && (
                  <Link href={`/admin/${c.href}/`}>
                    Xử lý <Icon name="arrow" size={14} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
