'use client';
/** Tổng quan: chỉ số chính (dữ liệu thật từ BE), việc cần xử lý, lối tắt. Mỗi mục dẫn tới đúng chỗ xử lý. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ChartColumn, FileText, Inbox, Package, Plus, Rocket, Users } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { can } from '@/lib/permissions';
import type { AdminLead } from '../adminData';
import type { DraftInfo } from '../SiteStore';
import { Card, EmptyState } from './kit';
import { useAdminUser } from './ui';

function useVisitors(enabled: boolean) {
  const [v, setV] = useState<{ visitors: number; pageviews: number } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch('/api/admin/analytics/?days=30', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null))
      .then(d => alive && d && setV({ visitors: Number(d.totals?.visitors || 0), pageviews: Number(d.totals?.pageviews || 0) })).catch(() => {});
    return () => { alive = false; };
  }, [enabled]);
  return v;
}

export function OverviewTasks({ data, leads, draft }: { data: SiteData; leads: AdminLead[]; draft: DraftInfo }) {
  const user = useAdminUser();
  const content = can(user.role, 'content.read');
  const sales = can(user.role, 'leads.read');
  const visitors = useVisitors(can(user.role, 'reports.read'));
  const fresh = leads.filter(l => (l.status || 'new') === 'new').length;
  const month = leads.filter(l => l.created_at >= Date.now() - 30 * 86400_000).length;

  const kpis = [
    sales && { label: 'Yêu cầu mới', value: fresh, note: `${month} yêu cầu trong 30 ngày`, href: '/admin/khach-hang/', icon: Inbox, tone: '' },
    can(user.role, 'reports.read') && { label: 'Người xem 30 ngày', value: visitors ? visitors.visitors : '—', note: visitors ? `${visitors.pageviews} lượt xem trang` : 'Đang tải…', href: '/admin/thong-ke/', icon: ChartColumn, tone: 'is-navy' },
    content && { label: 'Bài viết công khai', value: data.posts.filter(p => p.published && !p.archived).length, note: `${data.posts.filter(p => !p.published && !p.archived).length} bài nháp`, href: '/admin/bai-viet/', icon: FileText, tone: 'is-green' },
    content && { label: 'Sản phẩm & dịch vụ', value: data.services.filter(s => s.published !== false).length, note: `${(data.landings || []).filter(l => l.status === 'published').length} landing page công khai`, href: '/admin/san-pham/', icon: Package, tone: '' }
  ].filter(Boolean) as { label: string; value: number | string; note: string; href: string; icon: typeof Inbox; tone: string }[];

  const tasks: { text: string; href: string }[] = [];
  if (sales && fresh) tasks.push({ text: `${fresh} yêu cầu tư vấn mới chưa phân công`, href: '/admin/khach-hang/' });
  if (content) {
    if (draft.hasDraft) tasks.push({ text: 'Bản nháp chưa xuất bản — kiểm tra rồi Xuất bản hoặc Bỏ nháp', href: '/admin/nhat-ky/' });
    const hidden = data.services.filter(s => s.published === false).length;
    if (hidden) tasks.push({ text: `${hidden} sản phẩm đang ẩn`, href: '/admin/san-pham/' });
    const lp = (data.landings || []).filter(l => l.status === 'draft').length;
    if (lp) tasks.push({ text: `${lp} landing page ở trạng thái Nháp`, href: '/admin/chinh-sua/?panel=landings' });
    const noSeo = data.posts.filter(p => p.published && !p.archived && !p.seoDescription && !p.excerpt).length + data.services.filter(s => s.published !== false && !s.seoDescription).length;
    if (noSeo) tasks.push({ text: `${noSeo} trang công khai chưa có mô tả SEO`, href: '/admin/seo/?tab=kiem-tra' });
  }
  const shortcuts = [
    can(user.role, 'content.draft') && { label: 'Viết bài', href: '/admin/bai-viet/?new=1', icon: Plus },
    can(user.role, 'content.draft') && { label: 'Thêm sản phẩm', href: '/admin/san-pham/?new=1', icon: Package },
    can(user.role, 'content.draft') && { label: 'Tạo landing page', href: '/admin/chinh-sua/?panel=landings&new=1', icon: Rocket },
    content && { label: 'Chỉnh sửa website', href: '/admin/chinh-sua/?path=/', icon: FileText },
    sales && { label: 'Danh bạ khách hàng', href: '/admin/danh-ba/', icon: Users },
    can(user.role, 'reports.read') && { label: 'Hiệu quả nội dung', href: '/admin/hieu-qua/', icon: ChartColumn }
  ].filter(Boolean) as { label: string; href: string; icon: typeof Plus }[];

  return (
    <>
      {kpis.length > 0 && (
        <div className="ax-kpis">
          {kpis.map(k => (
            <Link key={k.label} href={k.href} className="ax-kpi">
              <span className="ax-kpi__label"><span className={`ax-kpi__icon ${k.tone}`}><k.icon size={16} /></span>{k.label}</span>
              <b>{k.value}</b>
              <small>{k.note}</small>
            </Link>
          ))}
        </div>
      )}
      <div className="ax-grid-2" style={{ marginBottom: 16 }}>
        <Card title="Việc cần xử lý" description="Tổng hợp từ dữ liệu hiện tại">
          {tasks.length
            ? <ul className="ax-tasks">{tasks.map(t => <li key={t.text}><Link href={t.href}><span>{t.text}</span><ArrowRight size={15} /></Link></li>)}</ul>
            : <EmptyState title="Không có việc tồn đọng">Mọi yêu cầu và nội dung đã được xử lý.</EmptyState>}
        </Card>
        <Card title="Lối tắt">
          <div className="ax-shortcuts">{shortcuts.map(s => <Link key={s.href} href={s.href}><s.icon size={16} /><span>{s.label}</span></Link>)}</div>
        </Card>
      </div>
    </>
  );
}
