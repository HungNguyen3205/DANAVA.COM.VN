'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MediaPicker, { MediaLibrary } from './MediaPicker';
import PresentationEditor from './PresentationEditor';
import { defaultPresentation } from '@/lib/presentation';
import ProjectManager from './ProjectManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import LeadsManager from './LeadsManager';
import { personPhoto } from '@/lib/media';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminShell, { type SearchRecord } from './AdminShell';
import AdminOverview, { greeting } from './AdminOverview';
import { Icon } from './AdminIcons';
import { LEGACY_SECTIONS, sectionInfo, useAdminLeads, visibleTabs } from './adminData';
import { initial, validateContent, type SiteData } from '@/lib/content';
import { normalizeContent } from '@/lib/content-defaults';
import { useSite, type SaveMode } from './SiteStore';
import { TopicsEditor, ProofEditor, ShowcaseEditor, cleanFeatures } from './AdminContentEditors';
import { BlockEditor, BlockPanel } from './AdminBlockEditor';
import { ChannelsEditor } from './AdminChannels';
import { AnnaStatus } from './AdminAnnaStatus';
import { CAREERS_SAMPLE } from '@/lib/careers';
import { BLOCK_META, PAGE_NAMES } from './adminBlockConfig';
import { block, blockDefaults, savedBlock, withBlock, type BlockKey } from '@/lib/blocks';
import { can } from '@/lib/permissions';
import { ContactBook, FormsReport, SourcesReport } from './admin/CustomerReports';
import { EDITOR_LAST_KEY, EDITOR_SLUG, editorPages, legacyEditorTarget, recordOf } from './admin/websiteEditorData';
import { SITE_PAGES } from './admin/websitePages';
import { AuditScreen, RevisionsScreen, UsersScreen } from './admin/SystemScreens';
import { GroupsScreen, ProductsScreen } from './admin/ProductsScreen';
import { PostsScreen } from './admin/PostsScreen';
import { BlockLibraryScreen, LandingsScreen } from './admin/LandingsScreen';
import { LiveEditor, type EditorPanel } from './admin/LiveEditor';
import { PageSettings } from './admin/PageSettings';
import { ContentPerformance, Redirects, SeoCheck } from './admin/SeoScreens';
import { PageSeoEditor } from './admin/PageSeoEditor';
import { TrackingEditor } from './admin/TrackingEditor';
import { OverviewTasks } from './admin/OverviewTasks';
import { HomeHeroEditor } from './admin/HomeHeroEditor';
import { GalleryOrder, MenuEditor, StaffOrder } from './admin/SortEditors';
import { ask } from './admin/kit';
import type { PageTab, SitePage } from './admin/websitePages';
import { Empty, Loading, useAdminUser, useQueryParam, useTabs } from './admin/ui';

const uid = () => globalThis.crypto.randomUUID();
/** Nội dung gốc sau chuẩn hóa: dùng để biết trang nào đã được tùy chỉnh. */
const BASE = normalizeContent(initial);

export default function Admin({ section = 'tong-quan' }: { section?: string }) {
  return (
    // Cổng đăng nhập nằm ở app/admin/layout.tsx: giữ nguyên khi chuyển trang, không kiểm tra phiên/tải nội dung lại
    <AdminRoute section={section} />
  );
}

/** Đường dẫn admin cũ (vd. /admin/trang-chu/) → vị trí mới trong menu 8 nhóm. */
function AdminRoute({ section }: { section: string }) {
  const router = useRouter();
  // Nhóm Website cũ (Trang, Landing page, Menu, Giao diện chung, Mẫu & khối) đã gom vào "Chỉnh sửa website"
  const editorLegacy = ['trang', 'landing-page', 'menu', 'giao-dien', 'mau-khoi'].includes(section);
  const legacy = LEGACY_SECTIONS[section] || (editorLegacy ? section : '');
  useEffect(() => {
    if (!legacy) return;
    // Mục cũ → (đường dẫn mới) → nếu thuộc nhóm Website cũ thì đổi tiếp sang trình biên tập, giữ tham số
    const [slug, query = ''] = legacy.replace(/\/$/, '').split('/?');
    const search = editorLegacy ? location.search : query ? `?${query}` : '';
    const target = legacyEditorTarget(slug.replace(/\/$/, ''), search) || legacy;
    router.replace(`/admin/${target}`);
  }, [legacy, editorLegacy, router]);
  if (legacy) return <Loading label="Đang chuyển tới vị trí mới của mục này…" />;
  return <AdminWorkspace section={section} />;
}

function AdminWorkspace({ section }: { section: string }) {
  const router = useRouter();
  const { data, save, ready, error, draft: serverDraft, discardDraft, takeAutoInfo } = useSite(),
    user = useAdminUser(),
    [draft, setDraft] = useState<SiteData>(data),
    [notice, setNotice] = useState(''),
    [dismissedError, setDismissedError] = useState(''),
    [saving, setSaving] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const info = sectionInfo(section);
  const allowed = !info.perm || can(user.role, info.perm);
  const { tab, bar } = useTabs(visibleTabs(info, user.role));
  const { leads } = useAdminLeads(100, can(user.role, 'leads.read'));
  useEffect(() => {
    setDraft(data);
  }, [data, ready]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data);
  const [edPath, setEdPath] = useQueryParam('path');
  const [edPanel, setEdPanel] = useQueryParam('panel');
  const dismissNotice = useCallback(() => {
    setNotice('');
    setDismissedError(error);
  }, [error]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** Bỏ dòng trống trong danh sách (FAQ, quy trình, tính năng) trước khi lưu. */
  function cleaned(d: SiteData): SiteData {
    return {
      ...d,
      services: d.services.map(x => ({ ...x, faqs: cleanFeatures(x.faqs), process: cleanFeatures(x.process), items: x.items.map(i => i.trim()).filter(Boolean), audience: (x.audience || []).filter(i => i.trim()), problems: (x.problems || []).filter(i => i.trim()) })),
      subServices: (d.subServices || []).map(x => ({ ...x, faqs: cleanFeatures(x.faqs), process: cleanFeatures(x.process), features: cleanFeatures(x.features), audience: x.audience.filter(i => i.trim()), problems: x.problems.filter(i => i.trim()) })),
      projects: (d.projects || []).map(x => ({ ...x, scope: (x.scope || []).map(i => i.trim()).filter(Boolean) })),
      showcase: (d.showcase || []).map(x => ({ ...x, scope: x.scope.map(i => i.trim()).filter(Boolean), tags: x.tags.map(i => i.trim()).filter(Boolean), highlights: cleanFeatures(x.highlights) }))
    };
  }
  async function persist(mode: SaveMode = 'draft') {
    if (mode === 'publish' && !can(user.role, 'content.publish')) mode = 'draft';
    setSaving(true);
    try {
      const next = cleaned(draft);
      if (await save(next, mode)) {
        setDraft(next);
        const auto = mode === 'publish' ? takeAutoInfo() : null;
        const tail = !auto ? '' : auto.noKey ? ' Có câu tiếng Việt vừa đổi chưa được dịch: máy chủ chưa cấu hình dịch tự động, bản tiếng Anh / tiếng Nhật tạm hiện tiếng Việt cho các câu đó.'
          : auto.done && !auto.failed ? ` Đã tự dịch ${auto.done} câu vừa đổi sang English / 日本語.`
          : auto.done || auto.failed ? ` Đã tự dịch ${auto.done} câu; ${auto.failed} câu chưa dịch được (tạm hiện tiếng Việt, bấm Dịch tự động trong trình biên tập để thử lại).` : '';
        setNotice((mode === 'draft' ? 'Đã lưu nháp trên máy chủ. Website chưa thay đổi cho tới khi bấm Xuất bản.' : 'Đã xuất bản. Website đã cập nhật nội dung mới.') + tail);
      }
    } finally {
      setSaving(false);
    }
  }
  async function dropDraft() {
    if (!(await ask('Bỏ bản nháp đã lưu?', { body: 'Quay về nội dung đang hiển thị trên website. Bản nháp sẽ mất.', confirmLabel: 'Bỏ nháp' }))) return;
    setSaving(true);
    try { if (await discardDraft()) setNotice('Đã bỏ bản nháp. Đang hiển thị nội dung của website.'); } finally { setSaving(false); }
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'danava-content.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Đã xuất bản sao dữ liệu đang lưu.');
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw Error('Dung lượng file tối đa 2 MB.');
      const next: unknown = JSON.parse(await file.text());
      if (!validateContent(next)) throw Error('File không đúng cấu trúc dữ liệu DANAVA.');
      if (await save(next)) {
        setDraft(next);
        setNotice('Đã nhập và lưu dữ liệu lên máy chủ.');
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Không đọc được file.');
    }
    if (importInput.current) importInput.current.value = '';
  }
  async function removePerson(id: string) {
    if (await ask('Xóa hồ sơ nhân sự này?', { body: 'Thay đổi áp dụng khi Lưu nháp hoặc Xuất bản.', confirmLabel: 'Xóa' }))
      setDraft({ ...draft, staff: draft.staff.filter((p) => p.id !== id) });
  }
  const newLeadCount = leads.filter((l) => (l.status || 'new') === 'new').length;

  // Khối nội dung (lib/blocks.ts): sửa trong bản nháp, ghi vào database khi bấm Lưu
  const blockPanel = (key: BlockKey) => {
    const meta = BLOCK_META[key];
    const def = key === 'staff' ? blockDefaults(draft.staff).staff : key === 'careers' ? CAREERS_SAMPLE : blockDefaults()[key];
    const saved = savedBlock(draft, key);
    return (
      <BlockPanel key={key} title={meta.title} desc={meta.desc} edited={saved !== undefined}
        onReset={() => setDraft(withBlock(draft, key, undefined))}>
        <BlockEditor value={block(draft, key) as never} def={def as never}
          config={key === 'staff' ? { ...meta.config, enums: { ...meta.config.enums, projectId: (draft.projects || []).map(p => ({ value: p.id, label: p.title })) }, itemTitle: (it, _i, k) => (k === '' && it && typeof it === 'object' && !Array.isArray(it) ? draft.staff.find(p => p.id === it.id)?.name : undefined) } : meta.config}
          onChange={v => setDraft(withBlock(draft, key, v))} />
      </BlockPanel>
    );
  };

  /** Chữ đầu trang / dải cuối trang của một trang (một mã trong khối `pages`). */
  const pageTextPanel = (key: string) => {
    const pages = block(draft, 'pages') as Record<string, Record<string, string>>;
    const defaults = blockDefaults().pages as Record<string, Record<string, string>>;
    const saved = (savedBlock(draft, 'pages') as Record<string, unknown> | undefined)?.[key];
    return (
      <BlockPanel key={key} title={PAGE_NAMES[key] || key} desc={BLOCK_META.pages.desc} edited={saved !== undefined}
        onReset={() => {
          const next = { ...((savedBlock(draft, 'pages') as Record<string, unknown>) || {}) };
          delete next[key];
          setDraft(withBlock(draft, 'pages', Object.keys(next).length ? { ...pages, ...next, [key]: defaults[key] } : undefined));
        }}>
        <BlockEditor value={pages[key] as never} def={defaults[key] as never} config={{ ...BLOCK_META.pages.config, groupTitle: undefined }}
          onChange={v => setDraft(withBlock(draft, 'pages', { ...pages, [key]: v }))} />
      </BlockPanel>
    );
  };

  const renderPageTab = (_page: SitePage, t: PageTab, exit: () => void) => {
    if (t.kind === 'hero') return <HomeHeroEditor draft={draft} setDraft={setDraft} />;
    if (t.kind === 'presentation') return <PresentationEditor value={draft.presentation || defaultPresentation} onChange={(presentation) => setDraft({ ...draft, presentation })} />;
    if (t.kind === 'block' && t.block === 'gallery') return <div className="blk-stack"><GalleryOrder draft={draft} setDraft={setDraft} />{blockPanel('gallery')}</div>;
    if (t.kind === 'block') return blockPanel(t.block);
    if (t.kind === 'visual') { void exit; return null; }
    return <div className="blk-stack">{t.keys.map(pageTextPanel)}</div>;
  };

  /* ---------------- Chỉnh sửa website: ngăn thiết lập theo ngữ cảnh ---------------- */
  const editorPageList = useMemo(() => editorPages(draft), [draft]);
  const renderEditorPanel = (panel: string, path: string): EditorPanel | null => {
    const [kind, arg] = panel.split(':');
    if (kind === 'page') {
      const page = SITE_PAGES.find(p => p.path === path);
      const rec = recordOf(draft, path);
      if (page) {
        const tabs = page.tabs.filter(t => t.kind !== 'visual');
        return { title: `Thiết lập trang · ${page.label}`, scope: 'page', body: <PageSettings tabs={tabs} initial={arg} render={t => renderPageTab(page, t, () => undefined)} note={`Các phần khác của trang ${page.label}. Chữ, ảnh và nút ở đầu trang sửa trực tiếp trên trang. Tiêu đề tìm kiếm của trang này đặt trong mã nguồn.`} /> };
      }
      if (rec) {
        const href = rec.kind === 'service' ? `/admin/san-pham/?id=${rec.id}` : rec.kind === 'post' ? `/admin/bai-viet/?id=${rec.id}` : rec.kind === 'project' ? `/admin/du-an/?tab=du-an&id=${rec.id}` : '';
        if (rec.kind === 'landing') return { title: `Landing page · ${rec.title}`, scope: 'record', scopeLabel: 'Landing page này', body: <LandingsScreen draft={draft} setDraft={setDraft} saveBar={recordSave} /> };
        return { title: `Thiết lập · ${rec.title}`, scope: 'record', scopeLabel: 'Hồ sơ dùng chung', body: (
          <div className="blk-stack">
            <p className="field-note">Trang này hiển thị từ hồ sơ <b>{rec.title}</b>. Sửa tiêu đề, câu dẫn, ảnh bìa ngay trên trang (cập nhật thẳng vào hồ sơ). SEO, nội dung đầy đủ, gói giá, danh mục… sửa trong hồ sơ đầy đủ — cùng một bản nháp.</p>
            <a className="ax-btn ax-btn--secondary" href={href}>Mở hồ sơ đầy đủ trong quản trị</a>
          </div>
        ) };
      }
      return { title: 'Thiết lập trang', scope: 'page', body: <p className="field-note">Trang này chưa có thiết lập riêng. Sửa chữ, ảnh và nút trực tiếp trên trang; phần dùng chung ở Thiết lập website.</p> };
    }
    if (kind === 'site') return { title: 'Thiết lập website', scope: 'global', body: (
      <div className="blk-stack">
        <div className="lv-links">
          <button type="button" className="ax-btn ax-btn--secondary" onClick={() => setEdPanel('menu')}>Menu điều hướng (đầu trang)</button>
          <a className="ax-btn ax-btn--secondary" href="/admin/cai-dat/?tab=nhan-dien">Thông tin công ty (chân trang)</a>
          <a className="ax-btn ax-btn--secondary" href="/admin/cai-dat/?tab=mang-xa-hoi">Kênh liên hệ & mạng xã hội</a>
        </div>
        {contactSettings}
        {blockPanel('anna')}
        <p className="field-note">Font, màu và chiều rộng nội dung theo bộ nhận diện DANAVA, cố định trong mã nguồn (chưa có tùy chọn chỉnh trong quản trị).</p>
      </div>
    ) };
    if (kind === 'menu') return { title: 'Menu điều hướng', scope: 'global', body: <MenuEditor draft={draft} setDraft={setDraft} /> };
    if (kind === 'landings') return { title: 'Landing page & liên kết ngoài', scope: 'global', scopeLabel: '', body: <LandingsScreen draft={draft} setDraft={setDraft} saveBar={recordSave} /> };
    if (kind === 'landing-edit') return renderEditorPanel('page', path);
    if (kind === 'blocks') return { title: 'Mẫu & khối', body: <BlockLibraryScreen /> };
    return null;
  };
  // Lần đầu: Trang chủ; lần sau: trang chỉnh gần nhất (nếu còn tồn tại)
  useEffect(() => {
    if (section !== EDITOR_SLUG) return;
    if (edPath) { try { localStorage.setItem(EDITOR_LAST_KEY, edPath); } catch {} return; }
    if (new URLSearchParams(location.search).get('path')) return; // đường dẫn trên URL (liên kết / tải lại) được ưu tiên
    let last = '/';
    try { last = localStorage.getItem(EDITOR_LAST_KEY) || '/'; } catch {}
    setEdPath(editorPageList.some(p => p.path === last) ? last : '/');
  }, [section, edPath, editorPageList, setEdPath]);
  // So với nội dung gốc (normalizeContent luôn điền sẵn các trường này nên không dùng "có/không có")
  const pageEdited = (page: SitePage) => page.tabs.some(t => {
    if (t.kind === 'hero') return !!draft.homeHero || draft.headline !== BASE.headline;
    if (t.kind === 'presentation') return JSON.stringify(draft.presentation || defaultPresentation) !== JSON.stringify(defaultPresentation);
    if (t.kind === 'block') return savedBlock(draft, t.block) !== undefined;
    if (t.kind === 'visual') return false;
    const saved = savedBlock(draft, 'pages') as Record<string, unknown> | undefined;
    return t.keys.some(k => saved?.[k] !== undefined);
  });

  const metricsEditor = (
    <section className="admin-panel">
      <h2>Số liệu trên giao diện chính</h2>
      <p>Để trống hoặc tắt hiển thị khi chưa có số liệu xác nhận. Không tự sinh số liệu kinh doanh.</p>
      {draft.metrics.map((m, i) => (
        <div className="metric-editor" key={m.id}>
          <label>
            Nhãn
            <input value={m.label} onChange={(e) => setDraft({ ...draft, metrics: draft.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
          </label>
          <label>
            Giá trị
            <input maxLength={50} placeholder="Chờ xác nhận" value={m.value} onChange={(e) => setDraft({ ...draft, metrics: draft.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={m.visible} onChange={(e) => setDraft({ ...draft, metrics: draft.metrics.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)) })} />
            Hiển thị
          </label>
        </div>
      ))}
    </section>
  );

  const staffEditor = (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>Đội ngũ hiển thị trên website</h2>
        <button className="admin-secondary" onClick={() => setDraft({ ...draft, staff: [...draft.staff, { id: uid(), name: 'Nhân sự mới', role: 'Chức danh', visible: false }] })}>
          + Thêm nhân sự
        </button>
      </div>
      <div className="field-note">
        Hồ sơ nhân sự công khai tách biệt với tài khoản đăng nhập admin: thêm người ở đây không cấp quyền quản trị. Có thể tải ảnh mới trực tiếp hoặc chọn từ Thư viện.
      </div>
      {draft.staff.map((p, i) => (
        <div className="staff-editor" key={p.id}>
          <span className="staff-avatar">{personPhoto(p) ? <img src={personPhoto(p)} alt={p.name} /> : p.name.split(' ').slice(-1)[0]?.[0]}</span>
          <label>
            Họ tên
            <input maxLength={150} value={p.name} onChange={(e) => setDraft({ ...draft, staff: draft.staff.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) })} />
          </label>
          <label>
            Chức danh
            <input maxLength={200} value={p.role} onChange={(e) => setDraft({ ...draft, staff: draft.staff.map((x) => (x.id === p.id ? { ...x, role: e.target.value } : x)) })} />
          </label>
          <div className="staff-image-field">
            <MediaPicker label="Ảnh nhân sự" value={personPhoto(p)} onChange={(image) => setDraft({ ...draft, staff: draft.staff.map((x) => (x.id === p.id ? { ...x, image } : x)) })} />
          </div>
          <label className="toggle-label">
            <input type="checkbox" checked={p.visible} onChange={(e) => setDraft({ ...draft, staff: draft.staff.map((x) => (x.id === p.id ? { ...x, visible: e.target.checked } : x)) })} />
            Hiển thị
          </label>
          <div className="row-actions">
            <button disabled={i === 0} aria-label={`Đưa ${p.name} lên trên`} onClick={() => { const staff = [...draft.staff]; [staff[i - 1], staff[i]] = [staff[i], staff[i - 1]]; setDraft({ ...draft, staff }); }}>↑</button>
            <button className="danger" onClick={() => removePerson(p.id)}>Xóa</button>
          </div>
        </div>
      ))}
    </section>
  );

  const contactSettings = (
    <section className="admin-panel">
      <h2>Thông tin liên hệ</h2>
      <label>Email<input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
      <label>Điện thoại<input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
      <div className="field-note">
        Nội dung lưu trong database của website (MySQL trên hosting, SQLite khi chạy máy cá nhân). Mật khẩu quản trị được cấu hình qua biến môi trường; không nhập
        mật khẩu trong nội dung website.
      </div>
    </section>
  );

  const backupPanel = (
    <section className="admin-panel">
      <h2>Sao lưu và nhập nội dung</h2>
      <button
        className="admin-secondary"
        onClick={() => {
          const posts = [...draft.posts], projects = [...(draft.projects || [])];
          for (const p of initial.posts) if (!posts.some((x) => x.id === p.id || x.slug === p.slug)) posts.push(structuredClone(p));
          for (const p of initial.projects || []) if (!projects.some((x) => x.id === p.id || x.slug === p.slug)) projects.push(structuredClone(p));
          setDraft({ ...draft, posts, projects });
          setNotice('Đã bổ sung hồ sơ và bài viết còn thiếu vào bản chỉnh sửa. Nội dung có sẵn được giữ nguyên; kiểm tra và lưu để áp dụng.');
        }}
      >
        Bổ sung kho nội dung DANAVA đã đối chiếu
      </button>
      <p>Xuất JSON để sao lưu nội dung. File ảnh tải lên cần được sao lưu cùng thư mục media trên máy chủ. Import có kiểm tra cấu trúc trước khi lưu.</p>
      <div className="data-actions">
        <button className="admin-secondary" onClick={exportData}>Xuất dữ liệu JSON ↓</button>
        <button className="admin-secondary" onClick={() => importInput.current?.click()}>Nhập dữ liệu JSON ↑</button>
        <input hidden ref={importInput} type="file" accept=".json,application/json" onChange={(e) => importData(e.target.files?.[0])} />
        <button
          className="danger"
          onClick={async () => {
            if (await ask('Khôi phục nội dung mặc định?', { body: 'Toàn bộ nội dung hiện tại sẽ bị thay. Hãy xuất bản sao JSON trước nếu cần.', confirmLabel: 'Khôi phục mặc định' })) {
              if (await save(structuredClone(initial))) setNotice('Đã khôi phục dữ liệu mặc định trên máy chủ.');
            }
          }}
        >
          Khôi phục nội dung mặc định
        </button>
      </div>
    </section>
  );

  /** Nút lưu riêng ở cuối mỗi hồ sơ (cùng tác dụng với nút trên thanh trên cùng). */
  const recordSave = can(user.role, 'content.draft') ? (
    <div className="adm-record-save">
      <span className="field-note">{dirty ? 'Có thay đổi chưa lưu.' : serverDraft.hasDraft ? 'Đã lưu nháp, chưa xuất bản.' : 'Đã xuất bản.'}</span>
      <span className="adm-btn-row">
        <button type="button" className="admin-secondary" disabled={!dirty || saving} onClick={() => persist('draft')}>Lưu nháp</button>
        {can(user.role, 'content.publish') && <button type="button" className="admin-primary" disabled={(!dirty && !serverDraft.hasDraft) || saving} onClick={() => persist('publish')}>{saving ? 'Đang lưu…' : 'Xuất bản'}</button>}
      </span>
    </div>
  ) : null;

  function body() {
    if (!allowed) return <Empty>Tài khoản của bạn chưa được cấp quyền dùng mục này. Liên hệ quản trị viên nếu cần.</Empty>;
    switch (section) {
      case 'tong-quan': return <div className="blk-stack"><OverviewTasks data={data} leads={leads} draft={serverDraft} />{can(user.role, 'content.read') && <AdminOverview data={data} leads={leads} />}</div>;
      case EDITOR_SLUG: return edPath ? (
        <LiveEditor path={edPath} onPathChange={p => setEdPath(p, true)} pages={editorPageList}
          panel={edPanel} onPanel={p => setEdPanel(p)} renderPanel={renderEditorPanel}
          draft={draft} setDraft={setDraft} onSave={persist} saving={saving} dirty={dirty} hasDraft={serverDraft.hasDraft}
          error={error && error !== dismissedError ? error : ''} canEdit={can(user.role, 'content.draft')} canPublish={can(user.role, 'content.publish')}
          onExit={() => router.push('/admin/tong-quan/')} />
      ) : <Loading label="Đang mở trình biên tập…" />;
      case 'san-pham': return <ProductsScreen draft={draft} setDraft={setDraft} studioPricing={blockPanel('pricing')} ctaText={pageTextPanel} saveBar={recordSave} />;
      case 'nhom-loai': return <GroupsScreen draft={draft} setDraft={setDraft} />;
      case 'bai-viet': return tab === 'danh-muc' ? <TopicsEditor draft={draft} setDraft={setDraft} /> : <PostsScreen draft={draft} setDraft={setDraft} saveBar={recordSave} />;
      case 'du-an': return tab === 'portfolio'
        ? <ShowcaseEditor draft={draft} setDraft={setDraft} />
        : <ProjectManager projects={draft.projects || []} services={draft.services} onChange={(projects) => setDraft({ ...draft, projects })} />;
      case 'thuong-hieu':
        switch (tab) {
          case 'doi-ngu': return <div className="blk-stack"><StaffOrder draft={draft} setDraft={setDraft} />{staffEditor}</div>;
          case 'ho-so-nhan-su': return blockPanel('staff');
          case 'doi-tac': return <ProofEditor draft={draft} setDraft={setDraft} part="clients" />; // liên kết cũ thuong-hieu/?tab=doi-tac
          case 'so-lieu': return metricsEditor;
          case 'cong-ty': return blockPanel('company'); // liên kết cũ
          default: return <div className="blk-stack"><StaffOrder draft={draft} setDraft={setDraft} />{staffEditor}</div>;
        }
      case 'khach-hang': return <LeadsManager />;
      case 'danh-ba': return <ContactBook />;
      case 'bieu-mau': return <FormsReport />;
      case 'doi-tac': return <ProofEditor draft={draft} setDraft={setDraft} part="clients" />;
      case 'nhan-xet': return <ProofEditor draft={draft} setDraft={setDraft} part="testimonials" />;
      case 'thu-vien': return <MediaLibrary data={draft} />;
      case 'thong-ke': return <AnalyticsDashboard />;
      case 'nguon-khach': return <SourcesReport />;
      case 'hieu-qua': return <ContentPerformance draft={draft} />;
      case 'cai-dat':
        switch (tab) {
          case 'lien-he': return contactSettings;
          case 'mang-xa-hoi': return <ChannelsEditor draft={draft} setDraft={setDraft} />;
          case 'theo-doi': return <TrackingEditor draft={draft} setDraft={setDraft} />;
          case 'seo': return <PageSeoEditor draft={draft} setDraft={setDraft} />;
          case 'chuyen-huong': return <Redirects draft={draft} setDraft={setDraft} />;
          case 'kiem-tra': return <SeoCheck draft={draft} />;
          case 'tich-hop': return <AnnaStatus />;
          default: return blockPanel('company');
        }
      case 'tai-khoan': return <UsersScreen />;
      case 'nhat-ky':
        if (tab === 'nhat-ky') return <AuditScreen />;
        if (tab === 'sao-luu') return backupPanel;
        return <RevisionsScreen onRestored={setNotice} />;
      default: return <Empty action={<Link className="admin-secondary" href="/admin/tong-quan/">Về Tổng quan</Link>}>Không tìm thấy mục “{section}”.</Empty>;
    }
  }

  // Tìm kiếm toàn admin: mục menu + bản ghi (bài viết, sản phẩm, dự án, portfolio, nhân sự, khách hàng)
  const records = useMemo<SearchRecord[]>(() => {
    const out: SearchRecord[] = [];
    if (can(user.role, 'content.read')) {
      for (const p of draft.posts) out.push({ label: p.title, kind: 'Bài viết', href: `/admin/bai-viet/?id=${p.id}` });
      for (const s of draft.services) out.push({ label: s.title, kind: 'Sản phẩm & dịch vụ', href: `/admin/san-pham/?id=${s.id}` });
      for (const p of draft.projects || []) out.push({ label: p.title, kind: 'Dự án', href: `/admin/du-an/?tab=du-an&id=${p.id}` });
      for (const x of draft.showcase || []) out.push({ label: x.name, kind: 'Portfolio', href: `/admin/du-an/?tab=portfolio&id=${x.id}` });
      for (const p of draft.staff) out.push({ label: p.name, kind: 'Đội ngũ', href: '/admin/thuong-hieu/?tab=doi-ngu' });
      for (const l of draft.landings || []) out.push({ label: l.title, kind: 'Landing page', href: `/admin/chinh-sua/?panel=landings&id=${l.id}` });
    }
    if (can(user.role, 'leads.read')) for (const l of leads) out.push({ label: `${l.name} ${l.phone || ''}`.trim(), kind: 'Khách hàng', href: '/admin/khach-hang/' });
    return out;
  }, [draft, leads, user.role]);

  const isOverview = section === 'tong-quan';
  const canEdit = can(user.role, 'content.draft');
  return (
    <AdminShell
      section={section}
      tabs={bar}
      dirty={canEdit && dirty}
      ready={ready && canEdit}
      saving={saving}
      onSave={persist}
      onDiscard={async () => {
        if (await ask('Hoàn tác thay đổi chưa lưu?', { body: 'Quay về bản đang lưu trên máy chủ.', confirmLabel: 'Hoàn tác' })) setDraft(data);
      }}
      onDiscardDraft={dropDraft}
      draft={serverDraft}
      notice={notice}
      error={error && error !== dismissedError ? error : ''}
      onDismissNotice={dismissNotice}
      leads={leads}
      records={records}
      counts={{ 'khach-hang': newLeadCount }}
      heading={
        isOverview ? (
          <>
            <h1>{greeting()}, {user.name}</h1>
            <p>
              {can(user.role, 'leads.read') && (newLeadCount ? <>Có <b>{newLeadCount} khách hàng mới</b> đang chờ phân công.{' '}</> : <>Mọi yêu cầu tư vấn đã được xử lý. </>)}
              Website đang có {(data.projects || []).filter((p) => p.published).length} dự án và {data.posts.filter((p) => p.published).length} bài viết công khai.
            </p>
          </>
        ) : undefined
      }
      actions={
        isOverview && can(user.role, 'content.read') ? (
          <>
            {can(user.role, 'reports.read') && <Link href="/admin/thong-ke/" className="adm-btn adm-btn-ghost"><Icon name="chart" /> Truy cập</Link>}
            <Link href="/admin/bai-viet/?new=1" className="adm-btn adm-btn-ghost"><Icon name="plus" /> Viết bài</Link>
          </>
        ) : undefined
      }
    >
      <div className="adm-section" data-section={section}>{body()}</div>
    </AdminShell>
  );
}
