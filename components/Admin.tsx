'use client';
import Link from 'next/link';
import MediaPicker, { MediaLibrary } from './MediaPicker';
import PresentationEditor from './PresentationEditor';
import { defaultPresentation } from '@/lib/presentation';
import AdminGate from './AdminGate';
import ProjectManager from './ProjectManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import LeadsManager from './LeadsManager';
import { personPhoto } from '@/lib/media';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminShell from './AdminShell';
import AdminOverview, { greeting } from './AdminOverview';
import { Icon } from './AdminIcons';
import { useAdminLeads } from './adminData';
import { initial, validateContent, type SiteData, type Post } from '@/lib/content';
import { useSite } from './SiteStore';
import { ServicesEditor, TopicsEditor, ProofEditor, ShowcaseEditor, ServiceChecks, Text, Toggle, cleanFeatures } from './AdminContentEditors';
import { BlockEditor, BlockPanel } from './AdminBlockEditor';
import { ChannelsEditor } from './AdminChannels';
import { BLOCK_META } from './adminBlockConfig';
import { block, blockDefaults, savedBlock, withBlock, type BlockKey } from '@/lib/blocks';
export const adminSections = [
  'tong-quan',
  'khach-hang',
  'trinh-chieu',
  'thu-vien',
  'thong-ke',
  'du-an',
  'trang-chu',
  'so-lieu',
  'bai-viet',
  'nhan-su',
  'giai-phap',
  'chu-de',
  'bang-chung',
  'trung-bay',
  'cai-dat',
];
const uid = () => globalThis.crypto.randomUUID();
export default function Admin({ section = 'tong-quan' }: { section?: string }) {
  return (
    <AdminGate>
      <AdminWorkspace section={section} />
    </AdminGate>
  );
}

function AdminWorkspace({ section }: { section: string }) {
  const { data, save, ready, error } = useSite(),
    [draft, setDraft] = useState<SiteData>(data),
    [notice, setNotice] = useState(''),
    [dismissedError, setDismissedError] = useState(''),
    [saving, setSaving] = useState(false),
    [query, setQuery] = useState(''),
    [selected, setSelected] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const { leads } = useAdminLeads();
  useEffect(() => {
    setDraft(data);
  }, [data, ready]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data);
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
  async function persist() {
    setSaving(true);
    try {
      const next = cleaned(draft);
      if (await save(next)) { setDraft(next); setNotice('Đã lưu. Nội dung xuất bản đã cập nhật trên website.'); }
    } finally {
      setSaving(false);
    }
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
  function removePerson(id: string) {
    if (confirm('Xóa hồ sơ nhân sự này khỏi bản chỉnh sửa?'))
      setDraft({ ...draft, staff: draft.staff.filter((p) => p.id !== id) });
  }
  function removePost(id: string) {
    if (confirm('Xóa bài viết này khỏi bản chỉnh sửa?')) {
      setDraft({ ...draft, posts: draft.posts.filter((p) => p.id !== id) });
      setSelected(null);
    }
  }
  const post = draft.posts.find((p) => p.id === selected);
  function editPost(patch: Partial<Post>) {
    setDraft({ ...draft, posts: draft.posts.map((p) => (p.id === selected ? { ...p, ...patch } : p)) });
  }
  const newLeadCount = leads.filter((l) => (l.status || 'new') === 'new').length;
  // Khối nội dung (lib/blocks.ts): sửa trong bản nháp, ghi vào database khi bấm Lưu
  const blockPanel = (key: BlockKey) => {
    const meta = BLOCK_META[key];
    const def = key === 'staff' ? blockDefaults(draft.staff).staff : blockDefaults()[key];
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
  const isOverview = section === 'tong-quan';
  return (
    <AdminShell
      section={section}
      dirty={dirty}
      ready={ready}
      saving={saving}
      onSave={persist}
      onDiscard={() => {
        if (confirm('Bỏ mọi thay đổi chưa lưu và quay về bản đang lưu trên máy chủ?')) setDraft(data);
      }}
      notice={notice}
      error={error && error !== dismissedError ? error : ''}
      onDismissNotice={dismissNotice}
      leads={leads}
      counts={{
        'khach-hang': newLeadCount,
        'bai-viet': draft.posts.length,
        'du-an': (draft.projects || []).length,
        'nhan-su': draft.staff.length,
      }}
      heading={
        isOverview ? (
          <>
            <h1>{greeting()}, Quản trị viên</h1>
            <p>
              {newLeadCount ? (
                <>
                  Có <b>{newLeadCount} khách hàng mới</b> đang chờ phân công.{' '}
                </>
              ) : (
                <>Mọi yêu cầu tư vấn đã được xử lý. </>
              )}
              Website đang có {(data.projects || []).filter((p) => p.published).length} dự án và{' '}
              {data.posts.filter((p) => p.published).length} bài viết công khai.
            </p>
          </>
        ) : undefined
      }
      actions={
        isOverview ? (
          <>
            <Link href="/admin/thong-ke/" className="adm-btn adm-btn-ghost">
              <Icon name="chart" /> Thống kê
            </Link>
            <Link href="/admin/bai-viet/" className="adm-btn adm-btn-ghost">
              <Icon name="plus" /> Viết bài
            </Link>
          </>
        ) : undefined
      }
    >
      <div className="adm-section" data-section={section}>
        {isOverview && <AdminOverview data={data} leads={leads} />}
        {section === 'trinh-chieu' && (
          <PresentationEditor
            value={draft.presentation || defaultPresentation}
            onChange={(presentation) => setDraft({ ...draft, presentation })}
          />
        )}
        {section === 'thu-vien' && <MediaLibrary />}
        {section === 'thong-ke' && <AnalyticsDashboard />}
        {section === 'du-an' && (
          <ProjectManager projects={draft.projects || []} services={draft.services} onChange={(projects) => setDraft({ ...draft, projects })} />
        )}
        {section === 'khach-hang' && <LeadsManager />}
        {section === 'trang-chu' && (
          <div className="admin-two">
            <section className="admin-panel">
              <h2>Màn mở đầu</h2>
              <label>
                Tiêu đề H1 (định vị: doanh nghiệp làm gì, cho ai)
                <input
                  maxLength={150}
                  value={draft.heroTitle || ''}
                  onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                />
              </label>
              <label>
                Thông điệp thương hiệu
                <input
                  maxLength={150}
                  value={draft.headline}
                  onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                />
              </label>
              <label>
                Mô tả
                <textarea
                  maxLength={1000}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
              <div className="field-note">
                Ảnh nền và chuyển động đã được thiết kế sẵn. Để thay ảnh, cập nhật file trong kho assets của dự án.
              </div>
              <h2 className="subheading">Kịch bản cuộn</h2>
              {[
                'Logo và không gian thương hiệu',
                'Màn hình công nghệ kéo ra',
                'Người đại diện DANAVA',
                'Hệ sinh thái kết nối',
                'Lời mời khám phá giải pháp',
              ].map((x, i) => (
                <p className="timeline-row" key={x}>
                  <b>0{i + 1}</b>
                  {x}
                </p>
              ))}
            </section>
            <section className="admin-panel preview-panel">
              <span>XEM TRƯỚC NỘI DUNG</span>
              <div className="mini-hero">
                <img src="/assets/danava-logo.png" alt="DANAVA" />
                <h2>{draft.headline}</h2>
                <p>{draft.description}</p>
                <small>Cuộn để khám phá ↓</small>
              </div>
              <Link className="text-link" target="_blank" href="/">
                Mở trang chủ sau khi lưu ↗
              </Link>
            </section>
          </div>
        )}
        {section === 'so-lieu' && (
          <section className="admin-panel">
            <h2>Số liệu trên giao diện chính</h2>
            <p>Để trống hoặc tắt hiển thị khi chưa có số liệu xác nhận. Không tự sinh số liệu kinh doanh.</p>
            {draft.metrics.map((m, i) => (
              <div className="metric-editor" key={m.id}>
                <label>
                  Nhãn
                  <input
                    value={m.label}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        metrics: draft.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                      })
                    }
                  />
                </label>
                <label>
                  Giá trị
                  <input
                    maxLength={50}
                    placeholder="Chờ xác nhận"
                    value={m.value}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        metrics: draft.metrics.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                      })
                    }
                  />
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={m.visible}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        metrics: draft.metrics.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)),
                      })
                    }
                  />
                  Hiển thị
                </label>
              </div>
            ))}
          </section>
        )}
        {section === 'nhan-su' && (
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>Hồ sơ đội ngũ</h2>
              <button
                className="admin-secondary"
                onClick={() =>
                  setDraft({
                    ...draft,
                    staff: [...draft.staff, { id: uid(), name: 'Nhân sự mới', role: 'Chức danh', visible: false }],
                  })
                }
              >
                + Thêm nhân sự
              </button>
            </div>
            <div className="field-note">
              Hồ sơ hiển thị không cấp quyền truy cập quản trị. Ảnh hiện tại được lấy từ hồ sơ trên web DANAVA. Có thể
              tải ảnh mới trực tiếp hoặc chọn đường dẫn từ Thư viện ảnh.
            </div>
            {draft.staff.map((p, i) => (
              <div className="staff-editor" key={p.id}>
                <span className="staff-avatar">
                  {personPhoto(p) ? <img src={personPhoto(p)} alt={p.name} /> : p.name.split(' ').slice(-1)[0]?.[0]}
                </span>
                <label>
                  Họ tên
                  <input
                    maxLength={150}
                    value={p.name}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        staff: draft.staff.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)),
                      })
                    }
                  />
                </label>
                <label>
                  Chức danh
                  <input
                    maxLength={200}
                    value={p.role}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        staff: draft.staff.map((x) => (x.id === p.id ? { ...x, role: e.target.value } : x)),
                      })
                    }
                  />
                </label>
                <div className="staff-image-field">
                  <MediaPicker
                    label="Ảnh nhân sự"
                    value={personPhoto(p)}
                    onChange={(image) =>
                      setDraft({ ...draft, staff: draft.staff.map((x) => (x.id === p.id ? { ...x, image } : x)) })
                    }
                  />
                </div>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={p.visible}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        staff: draft.staff.map((x) => (x.id === p.id ? { ...x, visible: e.target.checked } : x)),
                      })
                    }
                  />
                  Hiển thị
                </label>
                <div className="row-actions">
                  <button
                    disabled={i === 0}
                    aria-label={`Đưa ${p.name} lên trên`}
                    onClick={() => {
                      const staff = [...draft.staff];
                      [staff[i - 1], staff[i]] = [staff[i], staff[i - 1]];
                      setDraft({ ...draft, staff });
                    }}
                  >
                    ↑
                  </button>
                  <button className="danger" onClick={() => removePerson(p.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
        {section === 'bai-viet' && (
          <div className={post ? 'admin-post-layout' : ''}>
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Danh sách bài viết</h2>
                <button
                  className="admin-secondary"
                  onClick={() => {
                    const id = uid();
                    setDraft({
                      ...draft,
                      posts: [
                        {
                          id,
                          slug: `bai-viet-${id.slice(0, 8)}`,
                          title: 'Bài viết mới',
                          category: 'Kiến thức',
                          date: new Date().toISOString().slice(0, 10),
                          body: '',
                          published: false,
                        },
                        ...draft.posts,
                      ],
                    });
                    setSelected(id);
                  }}
                >
                  + Viết bài mới
                </button>
              </div>
              <input
                className="search-input"
                placeholder="Tìm tiêu đề…"
                aria-label="Tìm tiêu đề bài viết"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.posts
                      .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <b>{p.title}</b>
                            <small>
                              {p.category} · {p.date || 'Chờ ngày đăng'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${p.published ? 'green' : ''}`}>
                              {p.published ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                          </td>
                          <td>
                            <button className="text-link" onClick={() => setSelected(p.id)}>
                              Sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
            {post && (
              <section className="admin-panel post-editor">
                <div className="panel-heading">
                  <h2>Chỉnh sửa bài viết</h2>
                  <button onClick={() => setSelected(null)} aria-label="Đóng trình sửa">
                    ×
                  </button>
                </div>
                <label>
                  Tiêu đề
                  <input maxLength={250} value={post.title} onChange={(e) => editPost({ title: e.target.value })} />
                </label>
                <label>
                  Đường dẫn SEO
                  <input maxLength={150} value={post.slug} onChange={(e) => editPost({ slug: e.target.value })} />
                </label>
                <MediaPicker
                  label="Ảnh bìa bài viết"
                  value={post.image || ''}
                  onChange={(image) => editPost({ image })}
                />
                <Text label="Tiêu đề SEO (bỏ trống = tiêu đề bài)" value={post.seoTitle || ''} max={300} onChange={(seoTitle) => editPost({ seoTitle })} />
                <label>
                  Mô tả SEO
                  <textarea
                    maxLength={300}
                    value={post.seoDescription || ''}
                    onChange={(e) => editPost({ seoDescription: e.target.value })}
                  />
                </label>
                <Text label="Tóm tắt (hiện trên thẻ bài và đầu bài)" value={post.excerpt || ''} area max={1000} onChange={(excerpt) => editPost({ excerpt })} />
                <label>
                  Danh mục kiến thức
                  <select value={post.topicId || ''} onChange={(e) => editPost({ topicId: e.target.value })}>
                    <option value="">Chưa phân loại</option>
                    {(draft.topics || []).map((t) => <option key={t.id} value={t.id}>{t.name}{t.published ? '' : ' (ẩn)'}</option>)}
                  </select>
                </label>
                <label>
                  Tác giả
                  <select value={post.authorId || ''} onChange={(e) => editPost({ authorId: e.target.value || undefined })}>
                    <option value="">DANAVA Solutions (tổ chức)</option>
                    {draft.staff.filter((p) => p.visible).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
                  </select>
                  <small className="field-note">Chỉ chọn người thật sự viết bài. Bỏ trống thì tác giả là DANAVA Solutions.</small>
                </label>
                <ServiceChecks services={draft.services} value={post.serviceIds || []} onChange={(serviceIds) => editPost({ serviceIds })} />
                <label>
                  Chuyên mục
                  <input
                    maxLength={100}
                    value={post.category}
                    onChange={(e) => editPost({ category: e.target.value })}
                  />
                </label>
                <label>
                  Ngày đăng
                  <input type="date" value={post.date} onChange={(e) => editPost({ date: e.target.value })} />
                </label>
                <label>
                  Ngày cập nhật (khi sửa nội dung đáng kể)
                  <input type="date" value={post.updated || ''} onChange={(e) => editPost({ updated: e.target.value || undefined })} />
                </label>
                <label>
                  Nội dung văn bản
                  <textarea
                    rows={12}
                    maxLength={60000}
                    value={post.body}
                    onChange={(e) => editPost({ body: e.target.value })}
                  />
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={post.published}
                    onChange={(e) => editPost({ published: e.target.checked })}
                  />
                  Xuất bản công khai
                </label>
                <Toggle label="Không cho Google lập chỉ mục bài này (noindex)" checked={!!post.noindex} onChange={(noindex) => editPost({ noindex: noindex || undefined })} />
                <p className="field-note">
                  Bài xuất bản có đường dẫn riêng và được đưa vào sitemap (trừ bài noindex). Bản nháp trả 404 với khách;
                  quản trị viên đang đăng nhập xem trước được tại{' '}
                  <a className="text-link" href={`/kien-thuc/${post.slug}/`} target="_blank" rel="noopener">/kien-thuc/{post.slug}/ ↗</a> (sau khi lưu).
                </p>
                <div className="panel-heading">
                  <button className="admin-primary" onClick={persist}>
                    Lưu bài viết
                  </button>
                  <button className="danger" onClick={() => removePost(post.id)}>
                    Xóa bài
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
        {section === 'giai-phap' && <ServicesEditor draft={draft} setDraft={setDraft} />}
        {section === 'chu-de' && <TopicsEditor draft={draft} setDraft={setDraft} />}
        {section === 'bang-chung' && <ProofEditor draft={draft} setDraft={setDraft} />}
        {section === 'trung-bay' && <ShowcaseEditor draft={draft} setDraft={setDraft} />}
        {(['cong-ty', 'menu-giai-phap', 'chu-tren-trang', 've-danava', 'he-sinh-thai', 'ho-so-nhan-su'] as const).includes(section as 'cong-ty') && blockPanel(({ 'cong-ty': 'company', 'menu-giai-phap': 'menu', 'chu-tren-trang': 'pages', 've-danava': 'about', 'he-sinh-thai': 'ecosystem', 'ho-so-nhan-su': 'staff' } as Record<string, BlockKey>)[section])}
        {section === 'anh-doanh-nghiep' && blockPanel('gallery')}
        {section === 'kenh-lien-he' && <ChannelsEditor draft={draft} setDraft={setDraft} />}
        {section === 'chinh-sach' && <div className="blk-stack">{blockPanel('privacy')}{blockPanel('servicePolicy')}</div>}
        {section === 'cai-dat' && (
          <div className="admin-two">
            <section className="admin-panel">
              <h2>Thông tin liên hệ</h2>
              <label>
                Email
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </label>
              <label>
                Điện thoại
                <input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </label>
              <div className="field-note">
                Nội dung lưu trong database của website (MySQL trên hosting, SQLite khi chạy máy cá nhân). Mật khẩu quản trị được cấu hình qua biến môi trường; không nhập
                mật khẩu trong nội dung website. Tải ảnh trực tiếp tại Thư viện ảnh, hoặc dùng đường dẫn assets.
              </div>
            </section>
            <section className="admin-panel">
              <h2>Sao lưu và nhập nội dung</h2>
              <button
                className="admin-secondary"
                onClick={() => {
                  const posts = [...draft.posts],
                    projects = [...(draft.projects || [])];
                  for (const p of initial.posts)
                    if (!posts.some((x) => x.id === p.id || x.slug === p.slug)) posts.push(structuredClone(p));
                  for (const p of initial.projects || [])
                    if (!projects.some((x) => x.id === p.id || x.slug === p.slug)) projects.push(structuredClone(p));
                  setDraft({ ...draft, posts, projects });
                  setNotice(
                    'Đã bổ sung hồ sơ và bài viết còn thiếu vào bản chỉnh sửa. Nội dung có sẵn được giữ nguyên; kiểm tra và lưu để áp dụng.',
                  );
                }}
              >
                Bổ sung kho nội dung DANAVA đã đối chiếu
              </button>
              <p>
                Xuất JSON để sao lưu nội dung. File ảnh tải lên cần được sao lưu cùng thư mục media trên máy chủ. Import
                có kiểm tra cấu trúc trước khi lưu.
              </p>
              <div className="data-actions">
                <button className="admin-secondary" onClick={exportData}>
                  Xuất dữ liệu JSON ↓
                </button>
                <button className="admin-secondary" onClick={() => importInput.current?.click()}>
                  Nhập dữ liệu JSON ↑
                </button>
                <input
                  hidden
                  ref={importInput}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => importData(e.target.files?.[0])}
                />
                <button
                  className="danger"
                  onClick={async () => {
                    if (confirm('Khôi phục nội dung mặc định? Hãy xuất bản sao trước nếu cần.')) {
                      if (await save(structuredClone(initial)))
                        setNotice('Đã khôi phục dữ liệu mặc định trên máy chủ.');
                    }
                  }}
                >
                  Khôi phục nội dung mặc định
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
