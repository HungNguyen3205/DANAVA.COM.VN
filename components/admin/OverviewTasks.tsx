'use client';
/** Tổng quan → Việc cần xử lý: tổng hợp từ dữ liệu thật, mỗi việc dẫn tới đúng chỗ xử lý. */
import Link from 'next/link';
import type { SiteData } from '@/lib/content';
import { can } from '@/lib/permissions';
import type { AdminLead } from '../adminData';
import type { DraftInfo } from '../SiteStore';
import { useAdminUser } from './ui';

export function OverviewTasks({ data, leads, draft }: { data: SiteData; leads: AdminLead[]; draft: DraftInfo }) {
  const user = useAdminUser();
  const tasks: { text: string; href: string; tone?: string }[] = [];
  if (can(user.role, 'content.read')) {
    if (draft.hasDraft) tasks.push({ text: 'Có bản nháp chưa xuất bản — kiểm tra rồi bấm Xuất bản hoặc Bỏ nháp.', href: '/admin/nhat-ky/', tone: 'warn' });
    const hiddenProducts = data.services.filter(s => s.published === false);
    if (hiddenProducts.length) tasks.push({ text: `${hiddenProducts.length} sản phẩm đang ẩn (${hiddenProducts.slice(0, 3).map(s => s.title).join(', ')}).`, href: '/admin/san-pham/' });
    const draftLandings = (data.landings || []).filter(l => l.status === 'draft');
    if (draftLandings.length) tasks.push({ text: `${draftLandings.length} landing page ở trạng thái Nháp.`, href: '/admin/landing-page/' });
    const draftPosts = data.posts.filter(p => !p.published && !p.archived);
    if (draftPosts.length) tasks.push({ text: `${draftPosts.length} bài viết nháp chưa công khai.`, href: '/admin/bai-viet/' });
    const noSeo = data.posts.filter(p => p.published && !p.archived && !p.seoDescription && !p.excerpt).length + data.services.filter(s => s.published !== false && !s.seoDescription).length;
    if (noSeo) tasks.push({ text: `${noSeo} trang công khai chưa có mô tả SEO.`, href: '/admin/seo/?tab=kiem-tra' });
  }
  if (can(user.role, 'leads.read')) {
    const fresh = leads.filter(l => (l.status || 'new') === 'new').length;
    if (fresh) tasks.unshift({ text: `${fresh} yêu cầu tư vấn mới chưa phân công.`, href: '/admin/khach-hang/', tone: 'hot' });
  }
  const shortcuts = [
    can(user.role, 'content.draft') && { label: 'Viết bài', href: '/admin/bai-viet/?new=1' },
    can(user.role, 'content.draft') && { label: 'Thêm sản phẩm', href: '/admin/san-pham/?new=1' },
    can(user.role, 'content.draft') && { label: 'Tạo landing page', href: '/admin/landing-page/?new=1' },
    can(user.role, 'content.read') && { label: 'Sửa trang chủ', href: '/admin/trang/?page=trang-chu' },
    can(user.role, 'leads.read') && { label: 'Danh bạ khách hàng', href: '/admin/danh-ba/' },
    can(user.role, 'reports.read') && { label: 'Hiệu quả nội dung', href: '/admin/hieu-qua/' }
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="admin-two adm-overview-tasks">
      <section className="admin-panel">
        <h2>Việc cần xử lý</h2>
        {tasks.length ? (
          <ul className="adm-tasks">{tasks.map(t => <li key={t.text} className={t.tone ? `is-${t.tone}` : ''}><Link href={t.href}>{t.text}</Link></li>)}</ul>
        ) : <p className="adm-ok">Không có việc tồn đọng.</p>}
      </section>
      <section className="admin-panel">
        <h2>Lối tắt</h2>
        <div className="adm-shortcuts">{shortcuts.map(s => <Link key={s.href} className="adm-btn adm-btn-ghost" href={s.href}>{s.label}</Link>)}</div>
      </section>
    </div>
  );
}
