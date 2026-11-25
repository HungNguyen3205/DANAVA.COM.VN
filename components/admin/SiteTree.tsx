'use client';
/**
 * Nội dung website → Trang website: sơ đồ mọi trang dạng cây
 *   Trang chủ
 *   Giải pháp
 *     01 Vận hành DANAVA      (cột menu Giải pháp)
 *       DANAVA Studio          (/giai-phap/danava-studio/)
 *         trang con …
 * Mỗi dòng: tên, đường link (mở trang), trạng thái, nút sửa nội dung / hồ sơ, và ĐỔI ĐƯỜNG LINK với trang có đường dẫn riêng
 * (bài viết, dự án, case study, danh mục, giải pháp tự thêm, trang con, landing page).
 * Đổi link trang đang công khai → khi Xuất bản tự tạo chuyển hướng 301 từ link cũ (lib/redirects.ts) và cập nhật link trong menu.
 */
import Link from 'next/link';
import { ChevronRight, ExternalLink, Link2, Lock, Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SiteData } from '@/lib/content';
import { initial } from '@/lib/content';
import { block, withBlock } from '@/lib/blocks';
import { DICH_VU } from '@/lib/dich-vu';
import { SERVICE_MENU } from '@/lib/services-menu';
import { slugify } from './ProductsScreen';
import { fold } from './ui';

type Status = 'live' | 'draft' | 'hidden';
type SlugEdit = { value: string; prefix: string; set: (v: string) => string | null; lockReason?: string };
type Node = { key: string; label: string; path?: string; status?: Status; note?: string; edit?: { href: string; label: string }; slug?: SlugEdit; children?: Node[]; group?: boolean; collapsed?: boolean };

const STATUS: Record<Status, string> = { live: 'Công khai', draft: 'Nháp', hidden: 'Ẩn' };
const editor = (path: string) => ({ href: `/admin/chinh-sua/?path=${encodeURIComponent(path)}`, label: 'Sửa nội dung' });
const two = (n: number) => String(n).padStart(2, '0');

function buildTree(d: SiteData, setDraft: (d: SiteData) => void): Node[] {
  const menu = block(d, 'menu');
  const coreIds = new Set(initial.services.map(s => s.id));
  /** Đổi đường dẫn trong một danh sách bản ghi + cập nhật link menu đang trỏ tới đường dẫn cũ. Trả câu lỗi hoặc null. */
  function rename<K extends 'posts' | 'projects' | 'showcase' | 'topics' | 'services' | 'subServices' | 'landings'>(
    key: K, id: string, next: string, url: (slug: string) => string, sameScope: (x: { id: string; slug: string }) => boolean = () => true
  ): string | null {
    const list = (d[key] || []) as unknown as { id: string; slug: string }[];
    const cur = list.find(x => x.id === id);
    if (!cur) return 'Không tìm thấy trang.';
    const slug = slugify(next);
    if (!slug) return 'Đường link cần có chữ hoặc số.';
    if (slug === cur.slug) return null;
    if (list.some(x => x.id !== id && x.slug === slug && sameScope(x))) return `Đường link "${slug}" đã được trang khác dùng.`;
    const oldUrl = url(cur.slug), newUrl = url(slug);
    let nd = { ...d, [key]: list.map(x => (x.id === id ? { ...x, slug } : x)) } as SiteData;
    // Link trong menu trỏ tới đường dẫn cũ → đổi theo
    const m = block(nd, 'menu');
    const fix = (h: string) => (h === oldUrl ? newUrl : h);
    if (m.columns.some(c => c.items.some(i => i.href === oldUrl)) || m.footHref === oldUrl)
      nd = withBlock(nd, 'menu', { ...m, footHref: fix(m.footHref), columns: m.columns.map(c => ({ ...c, items: c.items.map(i => ({ ...i, href: fix(i.href) })) })) });
    setDraft(nd);
    return null;
  }

  const servicePath = (slug: string) => `/giai-phap/${slug}/`;
  const serviceNode = (s: SiteData['services'][number]): Node => ({
    key: 'svc-' + s.id, label: s.title, path: servicePath(s.slug), status: s.published === false ? 'hidden' : 'live',
    edit: { href: `/admin/san-pham/?id=${s.id}`, label: 'Sửa hồ sơ' },
    slug: { value: s.slug, prefix: '/giai-phap/', set: v => rename('services', s.id, v, servicePath),
      lockReason: coreIds.has(s.id) ? 'Giải pháp gốc giữ cố định đường link để không mất thứ hạng Google.' : undefined },
    children: (d.subServices || []).filter(x => x.parentId === s.id).map(x => ({
      key: 'sub-' + x.id, label: x.title, path: `/giai-phap/${s.slug}/${x.slug}/`, status: x.published ? 'live' : 'draft',
      edit: { href: `/admin/san-pham/?id=${s.id}`, label: 'Sửa hồ sơ' },
      slug: { value: x.slug, prefix: `/giai-phap/${s.slug}/`, set: v => rename('subServices', x.id, v, sl => `/giai-phap/${s.slug}/${sl}/`, o => (o as unknown as { parentId: string }).parentId === s.id) }
    }))
  });
  const staticNode = (label: string, path: string, children?: Node[]): Node => ({ key: 'p-' + path, label, path, status: 'live', edit: editor(path), children });

  // Giải pháp: theo cột menu (01, 02, …) rồi tới giải pháp không có trong menu
  const inMenu = new Set<string>();
  const columns: Node[] = menu.columns.map((c, i) => ({
    key: 'col-' + i, label: `${two(i + 1)} ${c.title}`, group: true, note: 'Cột menu Giải pháp',
    children: c.items.filter(it => it.href).map((it, j) => {
      const svc = d.services.find(s => servicePath(s.slug) === it.href);
      if (svc) { inMenu.add(svc.id); return { ...serviceNode(svc), key: `col-${i}-${svc.id}` }; }
      return { ...staticNode(it.label, it.href), key: `col-${i}-${j}`, note: it.href.startsWith('/giai-phap/') ? undefined : 'Liên kết tới trang khác' };
    })
  }));
  const extra = d.services.filter(s => !inMenu.has(s.id));
  if (extra.length) columns.push({ key: 'col-extra', label: 'Giải pháp chưa có trong menu', group: true, children: extra.map(serviceNode) });

  const projectPath = (slug: string) => `/du-an/${slug}/`;
  const posts = [...d.posts].filter(p => !p.archived).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const topicPath = (slug: string) => `/blogs/chu-de/${slug}/`;
  const postPath = (slug: string) => `/blogs/${slug}/`;
  const lpPath = (slug: string) => `/lp/${slug}/`;

  return [
    staticNode('Trang chủ', '/'),
    staticNode('Giới thiệu', '/ve-danava/'),
    staticNode('Giải pháp', '/giai-phap/', columns),
    // Menu chính → Dịch vụ: từng nhóm báo giá và các trang trong nhóm (lib/services-menu.ts)
    { key: 'svc-menu', label: 'Dịch vụ (menu chính)', group: true, note: 'Báo giá & setup phòng gym', children: SERVICE_MENU.map(g => ({
      key: 'svcg-' + g.id, label: g.label, group: true,
      children: g.items.map(it => ({
        ...staticNode(it.label, it.href), key: `svci-${g.id}-${it.id}`, note: it.badge,
        // Trang thiết bị: giá / kích thước / mô hình 3D sửa ở mục riêng
        ...(it.href === '/thiet-bi-gym/' ? { edit: { href: '/admin/thiet-bi/', label: 'Sửa giá thiết bị' } } : {})
      }))
    })) },
    staticNode('Dịch vụ', '/dich-vu/', DICH_VU.map(s => ({ key: 'dv-' + s.id, label: s.title, path: `/dich-vu/${s.slug}/`, status: 'live' as Status, edit: editor(`/dich-vu/${s.slug}/`), slug: { value: s.slug, prefix: '/dich-vu/', set: () => null, lockReason: 'Trang dịch vụ cố định trong mã nguồn.' } }))),
    staticNode('Dự án', '/du-an/', [
      ...(d.projects || []).map(p => ({ key: 'prj-' + p.id, label: p.title, path: projectPath(p.slug), status: (p.published ? 'live' : 'draft') as Status, edit: { href: '/admin/du-an/', label: 'Sửa hồ sơ' },
        slug: { value: p.slug, prefix: '/du-an/', set: (v: string) => rename('projects', p.id, v, projectPath) } })),
      ...(d.showcase || []).filter(x => x.caseStudy).map(x => ({ key: 'cs-' + x.id, label: x.name, note: 'Case study', path: projectPath(x.slug), status: (x.published ? 'live' : 'draft') as Status, edit: { href: '/admin/du-an/?tab=portfolio', label: 'Sửa hồ sơ' },
        slug: { value: x.slug, prefix: '/du-an/', set: (v: string) => rename('showcase', x.id, v, projectPath) } }))
    ]),
    staticNode('Blogs', '/blogs/', [
      { key: 'topics', label: 'Danh mục bài viết', group: true, children: (d.topics || []).map(t => ({ key: 'tp-' + t.id, label: t.name, path: topicPath(t.slug), status: (t.published ? 'live' : 'hidden') as Status, edit: { href: '/admin/bai-viet/?tab=danh-muc', label: 'Sửa danh mục' },
        slug: { value: t.slug, prefix: '/blogs/chu-de/', set: (v: string) => rename('topics', t.id, v, topicPath) } })) },
      { key: 'posts', label: `Bài viết (${posts.length})`, group: true, collapsed: true, children: posts.map(p => ({ key: 'post-' + p.id, label: p.title || '(chưa có tiêu đề)', path: postPath(p.slug), status: (p.published ? 'live' : 'draft') as Status, edit: { href: `/admin/bai-viet/?id=${p.id}`, label: 'Sửa bài' },
        slug: { value: p.slug, prefix: '/blogs/', set: (v: string) => rename('posts', p.id, v, postPath) } })) }
    ]),
    staticNode('Hệ sinh thái', '/he-sinh-thai/'),
    staticNode('Đối tác', '/doi-tac/'),
    staticNode('Đội ngũ', '/doi-ngu/', d.staff.filter(p => p.visible).map(p => ({ key: 'st-' + p.id, label: p.name, note: p.role, path: `/doi-ngu/${p.id}/`, status: 'live' as Status, edit: { href: '/admin/thuong-hieu/?tab=doi-ngu', label: 'Sửa hồ sơ' } }))),
    staticNode('Tuyển dụng', '/tuyen-dung/'),
    staticNode('Liên hệ', '/lien-he/'),
    staticNode('Báo giá website', '/bao-gia-web/'),
    ...((d.landings || []).some(l => l.kind === 'internal') ? [{
      key: 'lp', label: 'Landing page', group: true, children: (d.landings || []).filter(l => l.kind === 'internal').map(l => ({
        key: 'lp-' + l.id, label: l.title, path: lpPath(l.slug), status: (l.status === 'published' ? 'live' : l.status === 'draft' ? 'draft' : 'hidden') as Status, edit: editor(lpPath(l.slug)),
        slug: { value: l.slug, prefix: '/lp/', set: (v: string) => rename('landings', l.id, v, lpPath) } }))
    }] : []),
    { key: 'policy', label: 'Chính sách', group: true, children: [staticNode('Chính sách quyền riêng tư', '/chinh-sach-rieng-tu/'), staticNode('Chính sách dịch vụ', '/chinh-sach-dich-vu/')] }
  ];
}

/** Lọc cây theo từ khóa: giữ nhánh có dòng khớp (tên hoặc đường link). */
function filterTree(nodes: Node[], q: string): Node[] {
  if (!q) return nodes;
  const words = fold(q).split(/\s+/).filter(Boolean);
  const hit = (n: Node) => { const hay = fold(`${n.label} ${n.path || ''}`); return words.every(w => hay.includes(w)); };
  return nodes.flatMap(n => {
    const kids = filterTree(n.children || [], q);
    return hit(n) || kids.length ? [{ ...n, children: hit(n) && !kids.length ? n.children : kids, collapsed: false }] : [];
  });
}

function SlugField({ slug }: { slug: SlugEdit }) {
  const [v, setV] = useState(slug.value), [err, setErr] = useState('');
  const save = () => { const e = slug.set(v); setErr(e || ''); if (!e) setV(slugify(v) || slug.value); };
  return (
    <div className="st-slug">
      <span className="st-slug__pre">{slug.prefix}</span>
      <input value={v} autoFocus aria-label="Đường link mới" onChange={e => setV(e.target.value)} onBlur={save} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') setV(slug.value); }} />
      <span className="st-slug__pre">/</span>
      {err && <small className="st-slug__err" role="alert">{err}</small>}
    </div>
  );
}

function Row({ n, depth, open, toggle }: { n: Node; depth: number; open: Set<string>; toggle: (k: string) => void }) {
  const [editing, setEditing] = useState(false);
  const kids = n.children || [];
  const expanded = kids.length > 0 && open.has(n.key);
  return (
    <li>
      <div className={`st-row${n.group ? ' st-row--group' : ''}`} style={{ ['--depth' as string]: depth }}>
        <button type="button" className={`st-caret${expanded ? ' is-open' : ''}`} onClick={() => toggle(n.key)} disabled={!kids.length} aria-label={expanded ? 'Thu gọn' : 'Mở rộng'} aria-expanded={kids.length ? expanded : undefined}>
          {kids.length ? <ChevronRight size={15} /> : <span className="st-dot" />}
        </button>
        <div className="st-main">
          <span className="st-label">{n.label}{n.note && <small> · {n.note}</small>}{n.group && kids.length ? <small> · {kids.length} trang</small> : null}</span>
          {n.path && (editing && n.slug && !n.slug.lockReason
            ? <SlugField slug={n.slug} />
            : <a className="st-path" href={n.path} target="_blank" rel="noopener noreferrer">{n.path} <ExternalLink size={11} /></a>)}
        </div>
        {n.status && <span className={`st-status is-${n.status}`}>{STATUS[n.status]}</span>}
        <div className="st-actions">
          {n.slug && (n.slug.lockReason
            ? <span className="st-lock" title={n.slug.lockReason}><Lock size={13} /> Link cố định</span>
            : <button type="button" className={editing ? 'is-on' : ''} onClick={() => setEditing(!editing)}><Link2 size={13} /> {editing ? 'Xong' : 'Đổi link'}</button>)}
          {!n.slug && n.path && !n.group && <span className="st-lock" title="Trang cố định của website: đường link nằm trong mã nguồn."><Lock size={13} /> Link cố định</span>}
          {n.edit && <Link href={n.edit.href}><Pencil size={13} /> {n.edit.label}</Link>}
        </div>
      </div>
      {expanded && <ul>{kids.map(k => <Row key={k.key} n={k} depth={depth + 1} open={open} toggle={toggle} />)}</ul>}
    </li>
  );
}

export function SiteTree({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const tree = useMemo(() => buildTree(draft, setDraft), [draft, setDraft]);
  const [q, setQ] = useState('');
  // Mặc định mở 2 tầng đầu, trừ nhóm dài (bài viết)
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>();
    const walk = (ns: Node[], depth: number) => ns.forEach(n => { if (depth < 2 && !n.collapsed) s.add(n.key); walk(n.children || [], depth + 1); });
    walk(tree, 0);
    return s;
  });
  const shown = filterTree(tree, q.trim());
  const openAll = q.trim() ? new Set(Array.from(function* walk(ns: Node[]): Generator<string> { for (const n of ns) { yield n.key; yield* walk(n.children || []); } }(shown))) : open;
  const toggle = (k: string) => setOpen(s => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const count = (ns: Node[]): number => ns.reduce((a, n) => a + (n.path && !n.group ? 1 : 0) + count(n.children || []), 0);

  return (
    <section className="admin-panel st-page">
      <div className="panel-heading">
        <h2>Trang website</h2>
        <span className="adm-pill adm-pill--muted">{count(tree)} trang</span>
      </div>
      <p className="field-note">
        Sơ đồ mọi trang theo đúng cấu trúc menu. Bấm đường link để mở trang, <b>Sửa nội dung</b> / <b>Sửa hồ sơ</b> để chỉnh, <b>Đổi link</b> để đổi đường dẫn.
        Đổi link trang đang công khai: khi bấm <b>Xuất bản</b>, link cũ tự chuyển hướng 301 sang link mới và menu được cập nhật theo.
      </p>
      <div className="st-tools">
        <div className="mb-search"><Search size={16} aria-hidden="true" /><input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm trang theo tên hoặc đường link…" aria-label="Tìm trang" /></div>
        <button type="button" className="wp-btn" onClick={() => { const s = new Set<string>(); const walk = (ns: Node[]) => ns.forEach(n => { s.add(n.key); walk(n.children || []); }); walk(tree); setOpen(s); }}>Mở hết</button>
        <button type="button" className="wp-btn" onClick={() => setOpen(new Set())}>Thu gọn</button>
      </div>
      <ul className="st-tree">{shown.map(n => <Row key={n.key} n={n} depth={0} open={openAll} toggle={toggle} />)}</ul>
      {!shown.length && <p className="adm-empty">Không có trang nào khớp.</p>}
    </section>
  );
}
