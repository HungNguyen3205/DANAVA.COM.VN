/**
 * Trình chỉnh trực tiếp chạy BÊN TRONG trang thật (iframe ?cms=1 của admin → Website → Trang → Chỉnh trực tiếp).
 * Chỉ được tải (import động) khi CmsOverlay xác nhận đang nằm trong admin cùng nguồn; khách truy cập không tải file này.
 *
 * - Chế độ Xem: cuộn/xem bình thường; NHẤN GIỮ ~550ms vào chữ, ảnh, nút → chuyển sang Chỉnh sửa và chọn đúng phần đó.
 * - Chế độ Chỉnh sửa: chạm/bấm (hoặc Tab + Enter) để chọn; chữ sửa ngay tại chỗ (contenteditable), ảnh → "Đổi ảnh",
 *   nút → popover sửa chữ + đường dẫn, khối → viền + tên khối. Bấm ra ngoài để xong; Esc để hủy lần sửa hiện tại.
 * - Mỗi vùng mang khóa dữ liệu ổn định (components/site/cms.ts → lib/cms-paths.ts). Thay đổi gửi về cửa sổ admin
 *   (postMessage cùng nguồn) để cập nhật BẢN NHÁP; admin lưu nháp / xuất bản qua API có kiểm tra quyền.
 * - Không ghi DOM của phần đang gõ khi nhận dữ liệu từ admin → không mất con trỏ, không vỡ bộ gõ tiếng Việt.
 * - Kiểu chữ (màu, cỡ chữ máy tính / điện thoại) của phần chữ đang chọn: nút "Kiểu chữ" → bảng ngay cạnh phần đó;
 *   xem trước ngay bằng thẻ <style id="cms-text-styles"> (cùng CSS với website, lib/text-styles.ts), lưu vào bản nháp qua admin.
 */

import { BRAND_COLORS, MOBILE_MAX, SIZE_BY_KIND, SIZE_LIMITS, normalizeHex, textStylesCss, type StyleDevice, type TextStyle, type TextStyles } from '@/lib/text-styles';

type Mode = 'view' | 'edit';
type Kind = 'text' | 'image' | 'link' | 'block';
type Sel = { el: HTMLElement; kind: Kind; label: string };

const HOLD_MS = 550;
const MOVE_PX = 8;
const ORANGE = '#f26b1d';
const SELECTOR = '[data-cms],[data-cms-img],[data-cms-link],[data-cms-block]';
const LINK_OK = (v: string) => v.length <= 300 && (v === '' || /^#[a-z0-9-]{1,60}$/.test(v) || (/^\/[a-z0-9\-/#?=&._%]*$/i.test(v) && !v.startsWith('//')) || /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"'<>]*)?$/i.test(v));

export function startCmsEditor() {
  if (document.querySelector('[data-cms-ui]')) return; // đã chạy (vd. effect chạy lại)
  const origin = location.origin;
  const post = (type: string, payload: Record<string, unknown> = {}) => window.parent.postMessage({ type: `danava-cms:${type}`, ...payload }, origin);
  const root = document.documentElement;
  let mode: Mode = 'view';
  let canEdit = false;
  let limits: Record<string, number> = {};
  let values: Record<string, string> = {};
  let sel: Sel | null = null;
  let editing: { el: HTMLElement; path: string; before: string; rich: boolean; multiline: boolean } | null = null;
  let suppressClick = false;
  let styles: TextStyles = {};
  let styleOpen = false;
  let styleSession = false;

  /* ---------------- CSS trên trang (chỉ trong khung chỉnh) ---------------- */
  const css = document.createElement('style');
  css.textContent = `
    html[data-cms-edit] [data-cms], html[data-cms-edit] [data-cms-img], html[data-cms-edit] [data-cms-link] { -webkit-touch-callout: none; }
    html[data-cms-mode=edit] [data-cms], html[data-cms-mode=edit] [data-cms-img], html[data-cms-mode=edit] [data-cms-link] { outline: 1px dashed rgba(242,107,29,.6); outline-offset: 3px; cursor: pointer; }
    html[data-cms-mode=edit] [data-cms-block]:hover { outline: 1px dashed rgba(19,36,79,.35); outline-offset: 6px; }
    html[data-cms-mode=edit] .is-cms-sel { outline: 2px solid ${ORANGE} !important; outline-offset: 3px; }
    html[data-cms-mode=edit] [data-cms-block].is-cms-sel { outline-offset: 8px; }
    [data-cms][contenteditable] { cursor: text !important; -webkit-user-select: text !important; user-select: text !important; caret-color: ${ORANGE}; }
    [data-cms][contenteditable]:focus { outline: 2px solid ${ORANGE} !important; background: rgba(242,107,29,.06); }
    [data-cms-multiline] { white-space: pre-line; }
    .is-cms-press { animation: cms-press ${HOLD_MS}ms linear forwards; }
    @keyframes cms-press { from { box-shadow: 0 0 0 0 rgba(242,107,29,.0); } to { box-shadow: 0 0 0 6px rgba(242,107,29,.35); } }
    @media (prefers-reduced-motion: reduce) { .is-cms-press { animation: none; box-shadow: 0 0 0 4px rgba(242,107,29,.35); } }
  `;
  document.head.appendChild(css);
  root.dataset.cmsEdit = '1';

  /* ---------------- Giao diện nổi (shadow DOM: CSS của website không ảnh hưởng) ---------------- */
  const host = document.createElement('div');
  host.setAttribute('data-cms-ui', '');
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif; }
    .bar { position: fixed; display: none; align-items: center; gap: 4px; max-width: calc(100vw - 16px); padding: 4px; border-radius: 12px; background: #0f1c3f; color: #fff; box-shadow: 0 12px 32px -12px rgba(8,16,40,.6); pointer-events: auto; font-size: 13px; animation: in .16s ease-out; }
    .bar.on { display: flex; }
    .scope { padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,.12); color: #dbe4f7; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
    .scope.is-global { background: #ffb27a; color: #3b1d06; }
    .tag { padding: 0 8px 0 6px; color: #c9d3ea; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    button { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: #fff; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
    button:hover { background: rgba(255,255,255,.12); }
    button:focus-visible { outline: 2px solid #ffb27a; outline-offset: 1px; }
    button.pri { background: ${ORANGE}; }
    button.pri:hover { background: #e15e12; }
    button[aria-pressed=true] { background: rgba(255,255,255,.2); }
    svg { width: 15px; height: 15px; flex: none; }
    .pop { position: fixed; display: none; width: min(320px, calc(100vw - 16px)); padding: 12px; border-radius: 14px; background: #fff; color: #13244f; box-shadow: 0 18px 44px -16px rgba(8,16,40,.5); border: 1px solid #e3e8f0; pointer-events: auto; font-size: 13px; animation: in .16s ease-out; }
    .pop.on { display: grid; gap: 10px; }
    .pop b { font-size: 14px; }
    label { display: grid; gap: 5px; font-weight: 600; color: #3d4a6b; }
    input, select { width: 100%; height: 36px; padding: 0 10px; border: 1px solid #cdd5e3; border-radius: 9px; font: inherit; font-weight: 400; color: #13244f; background: #fff; }
    input:focus, select:focus { outline: none; border-color: ${ORANGE}; box-shadow: 0 0 0 3px rgba(242,107,29,.18); }
    input[aria-invalid=true] { border-color: #b42318; }
    .row { display: flex; justify-content: flex-end; gap: 6px; }
    .row button { color: #13244f; border: 1px solid #e3e8f0; }
    .row button.pri { color: #fff; border-color: transparent; }
    .err { margin: 0; color: #b42318; font-size: 12px; }
    .err:empty { display: none; }
    .toast { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); display: none; padding: 8px 14px; border-radius: 999px; background: #0f1c3f; color: #fff; font-size: 13px; font-weight: 600; pointer-events: none; box-shadow: 0 10px 26px -12px rgba(8,16,40,.6); }
    .toast.on { display: block; animation: in .16s ease-out; }
    .msg { padding: 0 8px; color: #ffb4a8; font-weight: 600; white-space: nowrap; }
    .msg:empty { display: none; }
    .pop.is-style { width: min(340px, calc(100vw - 16px)); max-height: calc(100vh - 16px); overflow: auto; gap: 12px; overscroll-behavior: contain; }
    .pop.is-sheet { width: auto; max-height: min(62vh, 460px); border-radius: 16px; }
    .sec { display: grid; gap: 8px; padding-top: 12px; border-top: 1px solid #eef1f6; }
    .sec.first { padding-top: 0; border-top: 0; }
    .hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 700; color: #13244f; }
    .chip { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #eef1f6; color: #51607f; white-space: nowrap; }
    .chip.on { background: #fff1e6; color: #b4500c; }
    .sw { display: flex; flex-wrap: wrap; gap: 6px; }
    .pop .sw button { width: 30px; height: 30px; padding: 0; border-radius: 50%; border: 1px solid rgba(15,28,63,.22); }
    .pop .sw button[aria-pressed=true] { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #f26b1d; }
    .line { display: flex; align-items: center; gap: 6px; }
    .line input[type=color] { width: 44px; height: 36px; padding: 3px; flex: none; cursor: pointer; }
    .line .num { width: 76px; flex: none; text-align: center; }
    .line .px { color: #5b6886; font-weight: 600; }
    .pop button.ghost { color: #13244f; border: 1px solid #e3e8f0; }
    .pop button.ghost:hover { background: #f3f5f9; }
    .pop button.sq { width: 36px; height: 36px; padding: 0; justify-content: center; font-size: 18px; flex: none; }
    .pop button.reset { justify-self: start; height: 30px; color: #b4500c; border: 1px solid #f6d3bb; }
    .pop button.reset:hover { background: #fff6ef; }
    .pop button.reset:disabled { color: #9aa5bd; border-color: #e3e8f0; cursor: default; background: none; }
    .seg { display: inline-flex; justify-self: start; padding: 3px; border-radius: 10px; background: #eef1f6; gap: 2px; }
    .pop .seg button { height: 28px; padding: 0 10px; color: #3d4a6b; font-size: 12.5px; }
    .pop .seg button[aria-pressed=true] { background: #fff; color: #13244f; box-shadow: 0 1px 2px rgba(8,16,40,.14); }
    .pop input[type=range] { height: 28px; padding: 0; border: 0; accent-color: #f26b1d; box-shadow: none; touch-action: pan-y; cursor: pointer; }
    .note { margin: 0; color: #5b6886; font-size: 12px; font-weight: 500; }
    .note b { font-size: 12px; color: #13244f; }
    @keyframes in { from { opacity: 0; transform: translateY(4px); } }
    @media (prefers-reduced-motion: reduce) { .bar, .pop, .toast.on { animation: none; } }
  </style>
  <div class="bar" role="toolbar" aria-label="Công cụ chỉnh sửa"></div>
  <div class="pop" role="dialog" aria-modal="false"></div>
  <div class="toast" role="status" aria-live="polite"></div>`;
  document.body.appendChild(host);
  const bar = shadow.querySelector<HTMLDivElement>('.bar')!;
  const pop = shadow.querySelector<HTMLDivElement>('.pop')!;
  const toast = shadow.querySelector<HTMLDivElement>('.toast')!;
  const ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    em: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>',
    type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h11v2M9.5 5v14M7 19h5"/><path d="M14 13v-1h7v1M17.5 12v7M16 19h3"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>'
  };
  let toastTimer = 0;
  function say(text: string) {
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('on'), 2200);
  }
  const btn = (html: string, title: string, on: () => void, cls = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = html;
    b.title = title;
    b.setAttribute('aria-label', title);
    if (cls) b.className = cls;
    b.addEventListener('pointerdown', e => e.preventDefault()); // giữ con trỏ trong ô đang gõ
    b.addEventListener('click', e => { e.stopPropagation(); on(); });
    return b;
  };

  /* ---------------- Đọc / ghi chữ ---------------- */
  const norm = (s: string) => s.replace(/ /g, ' ').replace(/​/g, '');
  /** Chữ của vùng đang sửa → giá trị lưu (giữ *nhấn mạnh* nếu vùng cho phép). */
  function serialize(el: HTMLElement, rich: boolean, multiline: boolean): string {
    if (!rich) return norm(multiline ? el.innerText : el.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    let out = '';
    const walk = (node: Node, top: boolean) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) { out += n.textContent || ''; return; }
        if (!(n instanceof HTMLElement)) return;
        if (n.tagName === 'BR') { out += multiline ? '\n' : ' '; return; }
        if (/^(DIV|P)$/.test(n.tagName)) { out += multiline ? '\n' : ' '; walk(n, top); return; }
        const t = (n.textContent || '').replace(/\*/g, '');
        if (top && t.trim()) out += `*${t}*`; else out += t;
      });
    };
    walk(el, true);
    return norm(out).replace(/\*\*/g, '').trim();
  }
  /** Giá trị → hiển thị (an toàn: chỉ tạo nút chữ + thẻ nhấn mạnh cùng kiểu với thẻ đang có). */
  function render(el: HTMLElement, value: string, rich: boolean) {
    if (!rich) { el.textContent = value; return; }
    const sample = el.querySelector('em, span');
    const make = () => {
      const tag = sample ? sample.tagName.toLowerCase() : 'em';
      const e = document.createElement(tag);
      if (sample?.className) e.className = sample.className;
      return e;
    };
    const parts = value.replace(/DANAVA Solutions/g, 'DANAVA Solutions').split(/\*([^*]+)\*/g);
    el.replaceChildren(...parts.map((p, i) => { if (i % 2) { const e = make(); e.textContent = p; return e; } return document.createTextNode(p); }));
  }

  /* ---------------- Áp giá trị từ admin (không đụng phần đang gõ) ---------------- */
  function applyValues(next: Record<string, string>) {
    values = { ...values, ...next };
    document.querySelectorAll<HTMLElement>('[data-cms]').forEach(el => {
      const path = el.dataset.cms!;
      if (!(path in next) || editing?.el === el) return;
      // Chữ cố định (txt.*): giá trị trống = chữ mặc định trong mã nguồn
      const want = next[path] || (el.dataset.cmsDefault ?? next[path]);
      if (serialize(el, el.hasAttribute('data-cms-rich'), el.hasAttribute('data-cms-multiline')) !== want) render(el, want, el.hasAttribute('data-cms-rich'));
    });
    document.querySelectorAll<HTMLImageElement>('img[data-cms-img]').forEach(img => {
      const base = img.dataset.cmsImg!;
      if (next[`${base}.image`] && img.getAttribute('src') !== next[`${base}.image`]) { img.removeAttribute('srcset'); img.src = next[`${base}.image`]; }
      if (`${base}.alt` in next) img.alt = next[`${base}.alt`];
      if (`${base}.focus` in next) img.style.objectPosition = next[`${base}.focus`] || '';
    });
    document.querySelectorAll<HTMLElement>('[data-cms-link]').forEach(a => {
      const t = a.querySelector<HTMLElement>('[data-cms-link-text]') || a;
      const label = next[a.dataset.cmsLink!], href = next[a.dataset.cmsHref!];
      if (label !== undefined && t.textContent !== label) t.textContent = label;
      if (href !== undefined && a.getAttribute('href') !== href) a.setAttribute('href', href);
    });
    if (sel) place();
  }

  /** Danh sách khóa trên trang để admin gửi giá trị/giới hạn. */
  function collect() {
    const paths = new Set<string>();
    const images: string[] = [];
    document.querySelectorAll<HTMLElement>('[data-cms]').forEach(el => paths.add(el.dataset.cms!));
    document.querySelectorAll<HTMLImageElement>('img[data-cms-img]').forEach(img => {
      const b = img.dataset.cmsImg!;
      paths.add(`${b}.image`);
      if (img.hasAttribute('data-cms-img-meta')) { paths.add(`${b}.alt`); paths.add(`${b}.focus`); }
      images.push(img.getAttribute('src') || '');
    });
    document.querySelectorAll<HTMLElement>('[data-cms-link]').forEach(a => { paths.add(a.dataset.cmsLink!); paths.add(a.dataset.cmsHref!); });
    // Trang đang mở (để trình biên tập nhận diện khi người dùng đi theo menu / liên kết trong chế độ Xem)
    return { paths: [...paths], images: [...new Set(images.filter(Boolean))], path: location.pathname, title: document.title };
  }

  /** Phạm vi dữ liệu của phần đang chọn: toàn website / hồ sơ dùng chung / chỉ trang này. */
  function scopeOf(el: HTMLElement): { text: string; global: boolean } | null {
    const s = el.closest<HTMLElement>('[data-cms-scope]');
    const path = el.dataset.cms || '';
    if (s?.dataset.cmsScope === 'global' || path.startsWith('pages.mac-dinh.') || path.startsWith('block.company.')) return { text: 'Áp dụng toàn website', global: true };
    if (s?.dataset.cmsScope === 'record') return { text: s.dataset.cmsScopeLabel || 'Hồ sơ dùng chung', global: false };
    return null;
  }
  const PANEL_LABEL: Record<string, string> = { menu: 'Sửa menu', site: 'Thiết lập chân trang' };

  /* ---------------- Chọn / bỏ chọn ---------------- */
  function kindOf(el: HTMLElement): Kind {
    if (el.hasAttribute('data-cms-link')) return 'link';
    if (el.hasAttribute('data-cms')) return 'text';
    if (el.hasAttribute('data-cms-img')) return 'image';
    return 'block';
  }
  function target(from: EventTarget | null): HTMLElement | null {
    if (!(from instanceof Element) || from.closest('[data-cms-skip],[data-cms-ui]')) return null;
    return from.closest<HTMLElement>('[data-cms-link]') || from.closest<HTMLElement>('[data-cms]') || from.closest<HTMLElement>('[data-cms-img]') || from.closest<HTMLElement>('[data-cms-block]');
  }

  function setMode(m: Mode, tell = true) {
    if (m === 'edit' && !canEdit) return;
    mode = m;
    root.dataset.cmsMode = m;
    if (m === 'view') deselect();
    // Bàn phím: vùng chỉnh được nhận focus bằng Tab khi đang ở chế độ Chỉnh sửa
    document.querySelectorAll<HTMLElement>('[data-cms],[data-cms-img]').forEach(el => {
      if (m === 'edit') { if (!el.hasAttribute('tabindex')) { el.tabIndex = 0; el.dataset.cmsTab = '1'; } }
      else if (el.dataset.cmsTab) { el.removeAttribute('tabindex'); delete el.dataset.cmsTab; }
    });
    if (tell) post('mode', { mode: m });
  }

  function select(el: HTMLElement, at?: { x: number; y: number }) {
    if (sel?.el === el) { if (at && editing) caretAt(at); return; }
    deselect();
    const kind = kindOf(el);
    sel = { el, kind, label: el.dataset.cmsLabel || el.dataset.cmsBlock || 'Phần nội dung' };
    el.classList.add('is-cms-sel');
    post('select', { label: sel.label, kind });
    if (kind === 'text') startText(el, at);
    else if (kind === 'link') openLink(el);
    toolbar();
    place();
  }

  function deselect(commitText = true) {
    endStyle();
    if (editing) commitText ? finishText() : cancelText();
    if (!sel) return;
    sel.el.classList.remove('is-cms-sel');
    sel = null;
    bar.classList.remove('on');
    pop.classList.remove('on');
    post('select', { label: '', kind: '' });
  }

  /* ---------------- Sửa chữ tại chỗ ---------------- */
  function caretAt({ x, y }: { x: number; y: number }) {
    const d = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null };
    let r: Range | null = null;
    if (d.caretPositionFromPoint) { const p = d.caretPositionFromPoint(x, y); if (p) { r = document.createRange(); r.setStart(p.offsetNode, p.offset); } }
    else if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(x, y);
    if (!r || !editing?.el.contains(r.startContainer)) return;
    r.collapse(true);
    const s = getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
  }
  function startText(el: HTMLElement, at?: { x: number; y: number }) {
    const rich = el.hasAttribute('data-cms-rich'), multiline = el.hasAttribute('data-cms-multiline');
    const path = el.dataset.cms!;
    editing = { el, path, before: el.innerHTML, rich, multiline };
    post('begin', { path });
    try { el.contentEditable = rich ? 'true' : 'plaintext-only'; } catch { el.contentEditable = 'true'; }
    if (el.contentEditable !== 'plaintext-only' && !rich) el.contentEditable = 'true';
    el.spellcheck = false;
    el.setAttribute('role', 'textbox');
    el.setAttribute('aria-label', el.dataset.cmsLabel || 'Nội dung');
    if (multiline) el.setAttribute('aria-multiline', 'true');
    el.focus({ preventScroll: true });
    if (at) caretAt(at);
    else { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
  }
  let sendTimer = 0;
  function sendText(now = false) {
    if (!editing) return;
    const { el, path, rich, multiline } = editing;
    const run = () => post('change', { path, value: serialize(el, rich, multiline) });
    clearTimeout(sendTimer);
    if (now) run(); else sendTimer = window.setTimeout(run, 120);
  }
  function stopEditable(el: HTMLElement) {
    el.removeAttribute('contenteditable');
    el.removeAttribute('role');
    el.removeAttribute('aria-label');
    el.removeAttribute('aria-multiline');
    el.removeAttribute('spellcheck');
    el.blur();
  }
  function finishText() {
    if (!editing) return;
    const { el, rich, multiline } = editing;
    sendText(true);
    const value = serialize(el, rich, multiline);
    stopEditable(el);
    // chuẩn hóa hiển thị (vd. *nhấn mạnh* gõ tay); chữ cố định để trống → hiện lại chữ mặc định
    render(el, value || (el.dataset.cmsDefault ?? ''), rich);
    editing = null;
    post('commit');
  }
  function cancelText() {
    if (!editing) return;
    const { el, before } = editing;
    clearTimeout(sendTimer);
    el.innerHTML = before; // chỉ là nội dung đã render sẵn trước khi sửa
    stopEditable(el);
    editing = null;
    post('cancel');
  }
  function toggleEm() {
    if (!editing?.rich) return;
    const s = getSelection();
    if (!s || !s.rangeCount) return;
    const r = s.getRangeAt(0);
    const inside = (r.startContainer.parentElement)?.closest('em, span');
    if (inside && editing.el.contains(inside) && inside !== editing.el) {
      inside.replaceWith(document.createTextNode(inside.textContent || ''));
    } else if (!r.collapsed && r.startContainer === r.endContainer && r.startContainer.nodeType === Node.TEXT_NODE) {
      const sample = editing.el.querySelector('em, span');
      const e = document.createElement(sample ? sample.tagName.toLowerCase() : 'em');
      if (sample?.className) e.className = sample.className;
      r.surroundContents(e);
    } else { say('Chọn một đoạn chữ trên cùng một dòng để nhấn mạnh.'); return; }
    editing.el.normalize();
    sendText(true);
  }

  /* ---------------- Ảnh ---------------- */
  function imagePanel(img: HTMLImageElement) {
    const base = img.dataset.cmsImg!;
    pop.innerHTML = '';
    const title = document.createElement('b'); title.textContent = 'Mô tả & vị trí cắt';
    const altL = document.createElement('label'); altL.textContent = 'Mô tả ảnh (cho người dùng trình đọc màn hình, Google)';
    const alt = document.createElement('input'); alt.maxLength = 200; alt.value = values[`${base}.alt`] ?? img.alt; altL.append(alt);
    const fL = document.createElement('label'); fL.textContent = 'Giữ phần nào khi ảnh bị cắt';
    const focus = document.createElement('select');
    for (const [v, t] of [['', 'Giữa ảnh'], ['top', 'Phía trên'], ['bottom', 'Phía dưới'], ['left', 'Bên trái'], ['right', 'Bên phải']]) { const o = document.createElement('option'); o.value = v; o.textContent = t; focus.append(o); }
    focus.value = values[`${base}.focus`] ?? '';
    fL.append(focus);
    const row = document.createElement('div'); row.className = 'row';
    row.append(btn('Đóng', 'Đóng', () => pop.classList.remove('on')), btn(`${ICON.check} Áp dụng`, 'Áp dụng', () => {
      post('begin', { path: `${base}.alt` });
      post('change', { path: `${base}.alt`, value: alt.value.trim() });
      post('change', { path: `${base}.focus`, value: focus.value });
      post('commit');
      img.alt = alt.value.trim(); img.style.objectPosition = focus.value;
      pop.classList.remove('on');
      say('Đã cập nhật ảnh. Nhớ Lưu nháp.');
    }, 'pri'));
    pop.append(title, altL, fL, row);
    pop.classList.add('on');
    place();
    alt.focus();
  }

  /* ---------------- Nút / liên kết ---------------- */
  function openLink(a: HTMLElement) {
    const labelPath = a.dataset.cmsLink!, hrefPath = a.dataset.cmsHref!;
    const t = a.querySelector<HTMLElement>('[data-cms-link-text]') || a;
    pop.innerHTML = '';
    const title = document.createElement('b'); title.textContent = a.dataset.cmsLabel || 'Nút';
    const lL = document.createElement('label'); lL.textContent = 'Chữ trên nút';
    const label = document.createElement('input'); label.maxLength = limits[labelPath] || 40; label.value = values[labelPath] ?? (t.textContent || '').trim(); lL.append(label);
    const hL = document.createElement('label'); hL.textContent = 'Đường dẫn';
    const href = document.createElement('input'); href.maxLength = 300; href.placeholder = '/lien-he/ hoặc https://…'; href.value = values[hrefPath] ?? a.getAttribute('href') ?? ''; hL.append(href);
    const err = document.createElement('p'); err.className = 'err'; err.setAttribute('role', 'alert');
    const check = () => { const ok = LINK_OK(href.value.trim()) && href.value.trim() !== ''; href.setAttribute('aria-invalid', String(!ok)); err.textContent = ok ? '' : 'Đường dẫn dạng /trang/, #muc hoặc https://ten-mien…'; return ok; };
    href.addEventListener('input', check);
    const apply = () => {
      const l = label.value.trim(), h = href.value.trim();
      if (!l) { err.textContent = 'Nhập chữ trên nút.'; label.focus(); return; }
      if (!check()) { href.focus(); return; }
      post('begin', { path: labelPath });
      post('change', { path: labelPath, value: l });
      post('change', { path: hrefPath, value: h });
      post('commit');
      t.textContent = l; a.setAttribute('href', h);
      deselect();
      say('Đã sửa nút. Nhớ Lưu nháp.');
    };
    for (const i of [label, href]) i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } if (e.key === 'Escape') { e.preventDefault(); deselect(); } });
    const row = document.createElement('div'); row.className = 'row';
    row.append(btn('Hủy', 'Hủy', () => deselect()), btn(`${ICON.check} Áp dụng`, 'Áp dụng', apply, 'pri'));
    pop.append(title, lL, hL, err, row);
    pop.classList.add('on');
    requestAnimationFrame(() => { place(); label.focus(); label.select(); });
  }

  /* ---------------- Kiểu chữ: màu + cỡ chữ (máy tính / điện thoại) ---------------- */
  const styleTag = () => {
    let t = document.getElementById('cms-text-styles') as HTMLStyleElement | null;
    if (!t) { t = document.createElement('style'); t.id = 'cms-text-styles'; document.body.appendChild(t); }
    return t;
  };
  const renderStyles = () => { styleTag().textContent = textStylesCss(styles); };
  // Cùng mốc với CSS của website (lib/text-styles.ts) → bảng luôn chỉnh đúng thiết bị đang xem
  const mobileMq = matchMedia(`(max-width: ${MOBILE_MAX}.98px)`);
  const deviceNow = (): StyleDevice => (mobileMq.matches ? 'mobile' : 'desktop');
  const DEVICE_TEXT: Record<StyleDevice, string> = { desktop: 'Máy tính (từ 768px)', mobile: 'Điện thoại (dưới 768px)' };
  const toHex = (c: string) => {
    const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
    return m ? '#' + m.slice(1, 4).map(x => Math.round(Number(x)).toString(16).padStart(2, '0')).join('') : '#000000';
  };
  /**
   * Kiểu chữ giao diện của phần (không tính tùy chỉnh của chính nó) → hiển thị "mặc định".
   * Đo trên bản sao tạm không mang khóa data-cms, đặt cạnh phần gốc (cùng kế thừa); không đụng thẻ CSS đang áp.
   */
  function natural(el: HTMLElement) {
    const probe = el.cloneNode(false) as HTMLElement;
    probe.removeAttribute('data-cms');
    probe.removeAttribute('contenteditable');
    probe.classList.remove('is-cms-sel', 'is-cms-press');
    probe.setAttribute('aria-hidden', 'true');
    probe.textContent = 'x';
    probe.style.setProperty('position', 'absolute', 'important');
    probe.style.setProperty('visibility', 'hidden', 'important');
    probe.style.setProperty('pointer-events', 'none', 'important');
    el.after(probe);
    const cs = getComputedStyle(probe);
    const out = { color: toHex(cs.color), size: Math.round(parseFloat(cs.fontSize)) };
    probe.remove();
    return out;
  }
  /** Giới hạn hợp lý theo loại nội dung (tiêu đề / đoạn văn / nhãn), luôn chứa cỡ chữ mặc định. */
  function boundsFor(el: HTMLElement, def: number, d: StyleDevice): [number, number] {
    const kind = el.closest('h1,h2,h3') || def >= 28 ? 'heading' : el.hasAttribute('data-cms-multiline') || el.closest('p,blockquote,li,dd') ? 'text' : 'label';
    const [lo, hi] = SIZE_BY_KIND[kind][d];
    return [Math.max(SIZE_LIMITS[d][0], Math.min(lo, def)), Math.min(SIZE_LIMITS[d][1], Math.max(hi, def))];
  }
  const editPath = () => (sel?.kind === 'text' ? sel.el.dataset.cms || '' : '');
  const curStyle = (): TextStyle => (editPath() ? styles[editPath()] || {} : {});
  const beginStyle = () => { if (!styleSession) { styleSession = true; post('style-begin', { path: editPath() }); } };
  const commitStyle = () => { if (styleSession) { styleSession = false; post('style-commit'); } };
  /** Áp một thay đổi kiểu chữ: xem trước ngay + gửi về bản nháp (máy chủ kiểm tra lại khi lưu). */
  function setStyle(patch: Partial<Record<keyof TextStyle, number | string | undefined>>) {
    const path = editPath();
    if (!path) return;
    const next: Record<string, unknown> = { ...curStyle(), ...patch };
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
    if (Object.keys(next).length) styles = { ...styles, [path]: next as TextStyle };
    else { styles = { ...styles }; delete styles[path]; }
    renderStyles();
    post('style', { path, style: Object.keys(next).length ? next : null });
    refreshStyle();
    place();
  }
  /** Một thao tác rời (bấm màu, +/−, khôi phục) = một bước hoàn tác. */
  const once = (patch: Parameters<typeof setStyle>[0]) => { beginStyle(); setStyle(patch); commitStyle(); };

  let resumeText = false;
  function openStyle() {
    if (!sel || sel.kind !== 'text') return;
    resumeText = !!editing;
    if (editing) finishText(); // ghi nhận phần chữ vừa gõ (hoàn tác riêng), vẫn giữ đúng phần đang chọn
    styleOpen = true;
    buildStyle();
    pop.classList.add('on', 'is-style');
    toolbar();
    place();
    keepVisible();
    (pop.querySelector<HTMLElement>('.sw button[aria-pressed=true]') || pop.querySelector<HTMLElement>('.sw button'))?.focus({ preventScroll: true });
  }
  /** Đóng bảng kiểu chữ; quay lại gõ chữ nếu trước đó đang gõ. */
  function closeStyle() {
    if (!styleOpen) return;
    endStyle();
    if (sel?.kind === 'text') { if (resumeText) startText(sel.el); toolbar(); place(); }
  }
  function endStyle() {
    if (!styleOpen) return;
    commitStyle();
    styleOpen = false;
    pop.classList.remove('on', 'is-style', 'is-sheet');
    pop.style.right = ''; pop.style.bottom = '';
    pop.innerHTML = '';
  }
  /** Điện thoại: bảng nằm sát đáy màn hình; cuộn để phần đang chỉnh nằm phía trên bảng (không bị che). */
  function keepVisible() {
    if (!sel || !pop.classList.contains('is-sheet')) return;
    const r = sel.el.getBoundingClientRect(), free = innerHeight - pop.offsetHeight - 16;
    const want = Math.max(56, (free - Math.min(r.height, free - 56)) / 2);
    if (r.top < 48 || r.bottom > free) { scrollBy({ top: r.top - want, behavior: 'instant' as ScrollBehavior }); place(); }
  }

  function buildStyle() {
    pop.innerHTML = '';
    if (!sel) return;
    const el = sel.el;
    const h = document.createElement('b'); h.textContent = `Kiểu chữ · ${sel.label}`;
    // Màu chữ
    const cSec = document.createElement('div'); cSec.className = 'sec first';
    cSec.innerHTML = '<div class="hd"><span>Màu chữ</span><span class="chip" data-k="cchip"></span></div>';
    const sw = document.createElement('div'); sw.className = 'sw'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Màu nhận diện DANAVA');
    for (const c of BRAND_COLORS) {
      const b = btn('', `${c.name} (${c.hex.toUpperCase()})`, () => once({ color: c.hex }));
      b.style.background = c.hex; b.dataset.hex = c.hex;
      sw.append(b);
    }
    const line = document.createElement('div'); line.className = 'line';
    const picker = document.createElement('input'); picker.type = 'color'; picker.setAttribute('aria-label', 'Chọn màu tùy chỉnh'); picker.dataset.k = 'picker';
    picker.addEventListener('input', () => { beginStyle(); setStyle({ color: picker.value.toLowerCase() }); });
    picker.addEventListener('change', commitStyle);
    const hex = document.createElement('input'); hex.maxLength = 7; hex.spellcheck = false; hex.autocapitalize = 'off'; hex.setAttribute('aria-label', 'Mã màu HEX'); hex.placeholder = '#RRGGBB'; hex.dataset.k = 'hex';
    const cErr = document.createElement('p'); cErr.className = 'err'; cErr.setAttribute('role', 'alert');
    hex.addEventListener('input', () => {
      const raw = hex.value.trim();
      const v = normalizeHex(raw);
      hex.setAttribute('aria-invalid', String(!v && raw !== ''));
      cErr.textContent = v || !raw ? '' : 'Mã màu dạng #RRGGBB (vd. #F08A1C).';
      if (v) { beginStyle(); setStyle({ color: v }); }
    });
    hex.addEventListener('change', () => {
      commitStyle();
      if (!normalizeHex(hex.value)) { hex.removeAttribute('aria-invalid'); cErr.textContent = ''; }
      refreshStyle(true);
    });
    hex.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); hex.blur(); } });
    line.append(picker, hex);
    const cReset = btn('Khôi phục màu mặc định', 'Khôi phục màu mặc định của phần này', () => once({ color: undefined }), 'reset');
    cReset.dataset.k = 'creset';
    cSec.append(sw, line, cErr, cReset);

    // Cỡ chữ
    const sSec = document.createElement('div'); sSec.className = 'sec';
    sSec.innerHTML = '<div class="hd"><span>Cỡ chữ</span><span class="chip" data-k="schip"></span></div>';
    const seg = document.createElement('div'); seg.className = 'seg'; seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Thiết bị áp dụng cỡ chữ');
    for (const d of ['desktop', 'mobile'] as const) {
      const b = btn(d === 'desktop' ? 'Máy tính' : 'Điện thoại', `Chỉnh cỡ chữ cho ${DEVICE_TEXT[d]}`, () => { if (deviceNow() !== d) post('device', { device: d }); });
      b.dataset.dev = d; seg.append(b);
    }
    const note = document.createElement('p'); note.className = 'note'; note.dataset.k = 'dev';
    const row = document.createElement('div'); row.className = 'line';
    const num = document.createElement('input'); num.type = 'number'; num.inputMode = 'numeric'; num.step = '1'; num.className = 'num'; num.dataset.k = 'num';
    num.setAttribute('aria-label', 'Cỡ chữ (px)');
    const px = document.createElement('span'); px.className = 'px'; px.textContent = 'px';
    const sErr = document.createElement('p'); sErr.className = 'err'; sErr.setAttribute('role', 'alert');
    const field = () => (deviceNow() === 'desktop' ? 'size' : 'sizeMobile') as 'size' | 'sizeMobile';
    const sizeNow = () => curStyle()[field()] ?? natural(el).size;
    const step = (by: number) => {
      const [lo, hi] = boundsFor(el, natural(el).size, deviceNow());
      once({ [field()]: Math.max(lo, Math.min(hi, sizeNow() + by)) });
    };
    const minus = btn('−', 'Giảm cỡ chữ 1px', () => step(-1), 'ghost sq');
    const plus = btn('+', 'Tăng cỡ chữ 1px', () => step(1), 'ghost sq');
    num.addEventListener('input', () => {
      const [lo, hi] = boundsFor(el, natural(el).size, deviceNow());
      const v = Number(num.value);
      const ok = num.value !== '' && Number.isInteger(v) && v >= lo && v <= hi;
      num.setAttribute('aria-invalid', String(!ok && num.value !== ''));
      sErr.textContent = ok || num.value === '' ? '' : `Nhập số nguyên từ ${lo} đến ${hi}px.`;
      if (ok) { beginStyle(); setStyle({ [field()]: v }); }
    });
    num.addEventListener('change', () => { commitStyle(); num.removeAttribute('aria-invalid'); sErr.textContent = ''; refreshStyle(true); });
    num.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); num.blur(); } });
    row.append(minus, num, px, plus);
    const range = document.createElement('input'); range.type = 'range'; range.step = '1'; range.dataset.k = 'range'; range.setAttribute('aria-label', 'Kéo để đổi cỡ chữ');
    range.addEventListener('input', () => { beginStyle(); setStyle({ [field()]: Number(range.value) }); });
    range.addEventListener('change', commitStyle);
    range.addEventListener('pointerup', commitStyle);
    const sReset = btn('Khôi phục cỡ chữ mặc định', 'Khôi phục cỡ chữ mặc định cho thiết bị này', () => once({ [field()]: undefined }), 'reset');
    sReset.dataset.k = 'sreset';
    sSec.append(seg, note, row, range, sErr, sReset);

    const foot = document.createElement('div'); foot.className = 'row';
    foot.append(btn(`${ICON.check} Xong`, 'Đóng bảng kiểu chữ', () => closeStyle(), 'pri'));
    pop.append(h, cSec, sSec, foot);
    refreshStyle(true);
  }

  /** Cập nhật giá trị đang hiển thị trong bảng (không đè ô người dùng đang gõ). */
  function refreshStyle(all = false) {
    if (!styleOpen || !sel) return;
    const el = sel.el;
    const q = <T extends HTMLElement>(k: string) => pop.querySelector<T>(`[data-k="${k}"]`);
    const num = q<HTMLInputElement>('num'), range = q<HTMLInputElement>('range'), hex = q<HTMLInputElement>('hex'), picker = q<HTMLInputElement>('picker');
    if (!num || !range || !hex || !picker) return;
    const active = shadow.activeElement;
    const st = curStyle(), nat = natural(el), d = deviceNow();
    const color = st.color || nat.color;
    const cchip = q('cchip')!; cchip.textContent = st.color ? 'Đã tùy chỉnh' : 'Mặc định giao diện'; cchip.classList.toggle('on', !!st.color);
    pop.querySelectorAll<HTMLButtonElement>('.sw button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hex === color)));
    if (active !== picker) picker.value = color;
    if (active !== hex || all) hex.value = color.toUpperCase();
    q<HTMLButtonElement>('creset')!.disabled = !st.color;
    const custom = d === 'desktop' ? st.size : st.sizeMobile;
    const size = custom ?? nat.size;
    const [lo, hi] = boundsFor(el, nat.size, d);
    const schip = q('schip')!; schip.textContent = custom ? 'Đã tùy chỉnh' : `Mặc định · ${nat.size}px`; schip.classList.toggle('on', !!custom);
    pop.querySelectorAll<HTMLButtonElement>('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dev === d)));
    const other = d === 'desktop' ? st.sizeMobile : st.size;
    const otherName = d === 'desktop' ? 'Điện thoại' : 'Máy tính';
    const dev = q('dev')!; dev.textContent = 'Đang chỉnh cho: ';
    const nb = document.createElement('b'); nb.textContent = DEVICE_TEXT[d];
    dev.append(nb, other ? ` · ${otherName}: ${other}px` : ` · ${otherName}: theo giao diện`);
    num.min = String(lo); num.max = String(hi); if (active !== num || all) num.value = String(size);
    range.min = String(lo); range.max = String(hi); if (active !== range) range.value = String(size);
    range.setAttribute('aria-valuetext', `${size}px`);
    q<HTMLButtonElement>('sreset')!.disabled = !custom;
  }
  pop.addEventListener('keydown', e => { if (styleOpen && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeStyle(); } });
  const onDevice = () => { if (styleOpen) { refreshStyle(true); place(); keepVisible(); } };
  addEventListener('resize', onDevice);
  mobileMq.addEventListener('change', onDevice);

  /* ---------------- Thanh công cụ theo phần đang chọn ---------------- */
  function toolbar() {
    bar.innerHTML = '';
    if (!sel) return;
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = sel.kind === 'block' ? `Khối: ${sel.label}` : sel.label;
    const msg = document.createElement('span'); msg.className = 'msg'; msg.setAttribute('role', 'alert');
    bar.append(tag);
    const sc = scopeOf(sel.el);
    if (sc) { const b = document.createElement('span'); b.className = `scope${sc.global ? ' is-global' : ''}`; b.textContent = sc.text; b.title = sc.global ? 'Thay đổi hiển thị trên mọi trang dùng phần này' : 'Cập nhật hồ sơ gốc trong module quản trị'; bar.append(b); }
    if (sel.kind === 'text') {
      if (editing?.rich) { const b = btn(`${ICON.em} Nhấn mạnh`, 'Nhấn mạnh phần chữ đang chọn', toggleEm); bar.append(b); }
      const st = btn(`${ICON.type} Kiểu chữ`, 'Màu và cỡ chữ của phần này', () => (styleOpen ? closeStyle() : openStyle()));
      st.setAttribute('aria-pressed', String(styleOpen));
      st.setAttribute('aria-haspopup', 'dialog');
      bar.append(st);
      bar.append(btn(ICON.x, 'Hủy (Esc)', () => deselect(false)), btn(`${ICON.check} Xong`, 'Xong', () => deselect(), 'pri'));
    } else if (sel.kind === 'image') {
      const img = sel.el as HTMLImageElement;
      bar.append(
        btn(`${ICON.image} Đổi ảnh`, 'Đổi ảnh', () => post('pick-image', { base: img.dataset.cmsImg, label: sel?.label })),
        ...(img.hasAttribute('data-cms-img-meta') ? [btn(`${ICON.sliders} Mô tả & cắt`, 'Mô tả ảnh và vị trí cắt', () => imagePanel(img))] : []),
        btn(`${ICON.check} Xong`, 'Xong', () => deselect(), 'pri')
      );
    } else if (sel.kind === 'link') {
      bar.append(btn(`${ICON.link} Sửa nút`, 'Sửa chữ và đường dẫn', () => openLink(sel!.el)), btn(`${ICON.check} Xong`, 'Xong', () => deselect(), 'pri'));
    } else {
      const panel = sel.el.dataset.cmsPanel;
      if (panel) bar.append(btn(`${ICON.sliders} ${PANEL_LABEL[panel] || 'Thuộc tính khối'}`, PANEL_LABEL[panel] || 'Mở thuộc tính của khối', () => { const p = panel; deselect(); post('open-panel', { panel: p }); }));
      else { const hint = document.createElement('span'); hint.className = 'tag'; hint.style.color = '#8fa0c8'; hint.textContent = 'Chọn chữ, ảnh hoặc nút trong khối'; bar.append(hint); }
      bar.append(btn(`${ICON.check} Xong`, 'Xong', () => deselect(), 'pri'));
    }
    bar.append(msg);
    bar.classList.add('on');
  }
  /** Đặt thanh công cụ trên phần đang chọn (gần mép trên → đặt dưới), không ra ngoài màn hình; popover cạnh thanh. */
  function place() {
    if (!sel) return;
    const r = sel.el.getBoundingClientRect();
    const gap = 10, vw = innerWidth, vh = innerHeight;
    const bw = bar.offsetWidth, bh = bar.offsetHeight || 38;
    let top = r.top - bh - gap;
    const below = top < 8;
    if (below) top = Math.min(r.bottom + gap, vh - bh - 8);
    const left = Math.max(8, Math.min(r.left, vw - bw - 8));
    bar.style.top = `${Math.max(8, top)}px`;
    bar.style.left = `${left}px`;
    pop.classList.toggle('is-sheet', styleOpen && vw < 600);
    if (pop.classList.contains('is-sheet')) {
      pop.style.left = '8px'; pop.style.right = '8px'; pop.style.top = 'auto'; pop.style.bottom = '8px';
      // Thanh công cụ không chồng lên bảng kiểu chữ
      const limit = vh - pop.offsetHeight - bh - 16;
      if (top > limit) bar.style.top = `${Math.max(8, Math.min(r.top - bh - gap, limit))}px`;
      return;
    }
    pop.style.right = ''; pop.style.bottom = '';
    if (pop.classList.contains('on')) {
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let pt = below ? Math.max(8, top) + bh + 6 : r.bottom + gap;
      if (pt + ph > vh - 8) pt = Math.max(8, r.top - ph - gap - (below ? 0 : bh + 6));
      let pl = Math.max(8, Math.min(r.left, vw - pw - 8));
      // Không đủ chỗ trên/dưới → đặt bên cạnh để không che phần đang chỉnh
      if (pt < r.bottom && pt + ph > r.top) {
        if (vw - r.right > pw + 20) { pl = r.right + gap; pt = Math.max(8, Math.min(r.top, vh - ph - 8)); }
        else if (r.left > pw + 20) { pl = r.left - pw - gap; pt = Math.max(8, Math.min(r.top, vh - ph - 8)); }
      }
      pop.style.top = `${pt}px`;
      pop.style.left = `${pl}px`;
    }
  }
  let raf = 0;
  const replace = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
  addEventListener('scroll', replace, { passive: true, capture: true });
  addEventListener('resize', replace);

  /* ---------------- Nhấn giữ (chuột, cảm ứng, bút) ---------------- */
  let press: { id: number; x: number; y: number; top: number; left: number; el: HTMLElement; timer: number; start: number; fire: () => void } | null = null;
  const cancelPress = () => { if (!press) return; clearTimeout(press.timer); press.el.classList.remove('is-cms-press'); press = null; };
  /** Thả tay: đã giữ đủ lâu mà bộ hẹn giờ chưa chạy (luồng chính bận, vd. đang dựng 3D) → vẫn mở chỉnh sửa. */
  const releasePress = (e: Event) => {
    if (press && e.type === 'pointerup' && performance.now() - press.start >= HOLD_MS) { const p = press; clearTimeout(p.timer); p.fire(); return; }
    cancelPress();
  };
  document.addEventListener('pointerdown', e => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (editing?.el.contains(e.target as Node)) return; // đang gõ: để chọn chữ bình thường
    const el = target(e.target);
    if (mode === 'edit') {
      // Bấm ra ngoài phần đang chọn → xong
      if (sel && !sel.el.contains(e.target as Node) && !(e.target as Element).closest?.('[data-cms-ui]')) deselect();
      return;
    }
    if (!el || !canEdit) return;
    cancelPress();
    const at = { x: e.clientX, y: e.clientY };
    el.classList.add('is-cms-press');
    const fire = () => {
      if (!press || press.el !== el) return;
      el.classList.remove('is-cms-press');
      press = null;
      suppressClick = true;
      getSelection()?.removeAllRanges();
      navigator.vibrate?.(12);
      setMode('edit');
      select(el, at);
    };
    // Hết giờ → đợi khung hình kế tiếp: trình duyệt giao hết chạm/di chuột đang chờ (theo khung hình) trước rAF,
    // nên nếu người dùng đã kéo/cuộn trong lúc máy bận (vd. đang dựng 3D) thì lần nhấn đã bị hủy, không mở chỉnh sửa
    const box = el.getBoundingClientRect();
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, top: box.top, left: box.left, el, start: performance.now(), fire, timer: window.setTimeout(() => requestAnimationFrame(() => setTimeout(fire, 0)), HOLD_MS) };
  }, true);
  document.addEventListener('pointermove', e => {
    if (press && e.pointerId === press.id && Math.hypot(e.clientX - press.x, e.clientY - press.y) > MOVE_PX) cancelPress();
  }, true);
  for (const t of ['pointerup', 'pointercancel', 'dragstart']) document.addEventListener(t, releasePress, true);
  // Cuộn: chỉ hủy khi phần đang nhấn THỰC SỰ dịch chuyển (> MOVE_PX). Bỏ qua sự kiện cuộn đến trễ của lần cuộn
  // trước đó và phần tử tự chạy (dải logo, carousel…) không chứa phần đang nhấn.
  addEventListener('scroll', () => {
    if (!press) return;
    const r = press.el.getBoundingClientRect();
    if (Math.abs(r.top - press.top) > MOVE_PX || Math.abs(r.left - press.left) > MOVE_PX) cancelPress();
  }, { passive: true, capture: true });
  addEventListener('wheel', cancelPress, { passive: true, capture: true });
  document.addEventListener('contextmenu', e => { if (press || suppressClick || (mode === 'edit' && target(e.target))) e.preventDefault(); }, true);

  /* ---------------- Bấm: chọn (chế độ Chỉnh sửa); không rời trang khi đang chỉnh ---------------- */
  document.addEventListener('click', e => {
    if ((e.target as Element).closest?.('[data-cms-ui]')) return;
    if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopPropagation(); return; }
    const a = (e.target as Element).closest?.('a[href]');
    const nav = a && !(a.getAttribute('href') || '').startsWith('#');
    if (editing?.el.contains(e.target as Node)) { e.preventDefault(); return; }
    if (mode === 'edit') {
      const el = target(e.target);
      if (nav || el) { e.preventDefault(); e.stopPropagation(); }
      if (el) select(el, { x: e.clientX, y: e.clientY });
      return;
    }
    if (nav && a) {
      e.preventDefault();
      // Chế độ Xem: đi theo liên kết nội bộ trong trình biên tập (giữ ?cms=1); liên kết ngoài / admin / API không mở
      let url: URL | null = null;
      try { url = new URL(a.getAttribute('href') || '', location.href); } catch {}
      if (url && url.origin === location.origin && !/^\/(admin|api)(\/|$)/.test(url.pathname) && !/\.[a-z0-9]{2,5}$/i.test(url.pathname)) {
        url.searchParams.set('cms', '1');
        location.assign(url.pathname + url.search + url.hash);
      } else say('Liên kết ra ngoài website — không mở trong trình biên tập.');
    }
  }, true);
  document.addEventListener('submit', e => { e.preventDefault(); say('Biểu mẫu không gửi trong trình chỉnh.'); }, true);

  /* ---------------- Bàn phím ---------------- */
  document.addEventListener('keydown', e => {
    if (styleOpen && e.composedPath().includes(pop)) return; // phím trong bảng kiểu chữ (Esc xử lý riêng, Enter trong ô nhập)
    const mod = e.ctrlKey || e.metaKey;
    if (editing) {
      if (e.key === 'Escape') { e.preventDefault(); deselect(false); return; }
      if (e.key === 'Enter' && !editing.multiline && !e.isComposing) { e.preventDefault(); deselect(); return; }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); deselect(); post('key', { key: 'save' }); }
      return; // Ctrl+Z trong ô đang gõ = hoàn tác gõ chữ của trình duyệt
    }
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); post('key', { key: e.shiftKey ? 'redo' : 'undo' }); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); post('key', { key: 'redo' }); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); post('key', { key: 'save' }); return; }
    if (e.key === 'Escape' && sel) { e.preventDefault(); deselect(); return; }
    if (mode === 'edit' && (e.key === 'Enter' || e.key === ' ') && document.activeElement instanceof HTMLElement) {
      const el = target(document.activeElement);
      if (el && el === document.activeElement || el?.hasAttribute('data-cms-link')) { e.preventDefault(); select(el!); }
    }
  }, true);

  /* ---------------- Sự kiện gõ ---------------- */
  document.addEventListener('beforeinput', e => {
    if (!editing || !editing.el.contains(e.target as Node)) return;
    const ie = e as InputEvent;
    if ((ie.inputType === 'insertParagraph' || ie.inputType === 'insertLineBreak') && !editing.multiline) { e.preventDefault(); return; }
    if (/^format/.test(ie.inputType)) { e.preventDefault(); return; } // chỉ nhấn mạnh qua nút
    const limit = limits[editing.path];
    if (limit && ie.data && serialize(editing.el, editing.rich, editing.multiline).length + ie.data.length > limit && !ie.isComposing) {
      e.preventDefault();
      say(`Tối đa ${limit} ký tự.`);
    }
  }, true);
  document.addEventListener('input', e => { if (editing?.el.contains(e.target as Node)) { sendText(); place(); } }, true);
  document.addEventListener('compositionend', e => { if (editing?.el.contains(e.target as Node)) sendText(); }, true);
  document.addEventListener('paste', e => {
    if (!editing || !editing.el.contains(e.target as Node)) return;
    e.preventDefault();
    let text = e.clipboardData?.getData('text/plain') || '';
    if (!editing.multiline) text = text.replace(/\s*\n+\s*/g, ' ');
    document.execCommand('insertText', false, text); // chỉ chữ thuần; vẫn hoàn tác được bằng Ctrl+Z
  }, true);
  document.addEventListener('drop', e => { if (editing) e.preventDefault(); }, true);

  /* ---------------- Liên lạc với admin ---------------- */
  addEventListener('message', e => {
    if (e.origin !== origin || e.source !== window.parent) return;
    const d = e.data || {};
    if (d.type === 'danava-cms:init') {
      canEdit = !!d.canEdit;
      styles = d.styles && typeof d.styles === 'object' ? d.styles : {};
      renderStyles();
      limits = d.limits || {};
      applyValues(d.values || {});
      setMode(d.mode === 'edit' ? 'edit' : 'view', false);
    }
    if (d.type === 'danava-cms:mode') setMode(d.mode === 'edit' ? 'edit' : 'view', false);
    if (d.type === 'danava-cms:values') applyValues(d.values || {});
    if (d.type === 'danava-cms:styles') { styles = d.styles && typeof d.styles === 'object' ? d.styles : {}; renderStyles(); refreshStyle(); }
    if (d.type === 'danava-cms:deselect') deselect();
    if (d.type === 'danava-cms:device-changed') onDevice();
    if (d.type === 'danava-cms:error') { const m = bar.querySelector('.msg'); if (m) m.textContent = String(d.message || ''); else say(String(d.message || '')); }
    if (d.type === 'danava-cms:clear-error') { const m = bar.querySelector('.msg'); if (m) m.textContent = ''; }
    if (d.type === 'danava-cms:toast') say(String(d.message || ''));
  });
  post('ready', collect());
}
