'use client';
/**
 * Trình chỉnh sửa chung cho các khối nội dung (lib/blocks.ts).
 * Biểu mẫu sinh theo cấu trúc dữ liệu mặc định:
 *  - chuỗi ngắn → ô một dòng; chuỗi dài → ô nhiều dòng; khóa ảnh → chọn ảnh từ Thư viện
 *  - danh sách chuỗi → mỗi dòng một mục; danh sách đối tượng → thẻ thu gọn, thêm / xóa / đổi thứ tự
 *  - trường có giá trị cố định (loại, giai đoạn, phòng ban…) → ô chọn
 * Không đổi cấu trúc dữ liệu → trang công khai luôn đọc được (máy chủ kiểm tra lại khi lưu).
 */
import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react';
import MediaPicker from './MediaPicker';

type Json = string | number | boolean | Json[] | { [k: string]: Json };
export type EnumMap = Record<string, { value: string; label: string }[]>;
export type BlockEditorConfig = {
  labels: Record<string, string>;
  /** Khóa không hiển thị (mã nội bộ) */
  hidden?: string[];
  enums?: EnumMap;
  /** Khóa luôn dùng ô nhiều dòng */
  long?: string[];
  /** Danh sách cố định số mục (không thêm/xóa), theo tên khóa; '' = gốc */
  fixed?: string[];
  /** Tên hiển thị cho từng khóa con của một object dạng bản đồ (vd. trang) */
  groupTitle?: (key: string) => string | undefined;
  /** Gợi ý dưới trường */
  hints?: Record<string, string>;
};

const IMAGE_KEY = /^(image|src|cover|logo|screenshot|photo)$/i;
const uid = () => globalThis.crypto.randomUUID().slice(0, 8);
const isObj = (v: unknown): v is Record<string, Json> => !!v && typeof v === 'object' && !Array.isArray(v);
const humanize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

/** Giá trị trống cùng cấu trúc (dùng khi thêm mục mới). */
function blank(t: Json | undefined, key?: string): Json {
  if (typeof t === 'string') return key === 'id' || key === 'key' ? uid() : '';
  if (typeof t === 'number') return 0;
  if (typeof t === 'boolean') return key === 'visible' || key === 'published';
  if (Array.isArray(t)) return [];
  if (isObj(t)) return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, blank(v, k)]));
  return '';
}
/** Mẫu cho phần tử danh sách: gộp khóa của mọi phần tử mặc định. */
function itemTemplate(items: Json[] | undefined): Json | undefined {
  if (!items?.length) return undefined;
  if (items.every(isObj)) {
    const out: Record<string, Json> = {};
    for (const it of items as Record<string, Json>[]) for (const [k, v] of Object.entries(it)) if (!(k in out)) out[k] = v;
    return out;
  }
  return items[0];
}
const summaryOf = (v: Json, i: number) => {
  if (isObj(v)) for (const k of ['title', 'name', 'label', 'levelLabel', 'year', 'group', 'type', 'category', 'role', 'tag', 'projectId', 'id']) {
    const x = v[k]; if (typeof x === 'string' && x.trim()) return x.length > 80 ? x.slice(0, 80) + '…' : x;
  }
  return `Mục ${i + 1}`;
};

export function BlockEditor({ value, def, onChange, config }: { value: Json; def: Json; onChange: (v: Json) => void; config: BlockEditorConfig }) {
  return <div className="blk">{node(value, def, onChange, config, '', 0)}</div>;
}

function label(cfg: BlockEditorConfig, key: string) { return cfg.labels[key] || humanize(key); }

function node(value: Json, def: Json | undefined, onChange: (v: Json) => void, cfg: BlockEditorConfig, key: string, depth: number): ReactNode {
  const tpl = def ?? value;
  if (typeof tpl === 'string' || typeof value === 'string') {
    const v = typeof value === 'string' ? value : '';
    const opts = cfg.enums?.[key];
    if (opts) return (
      <label className="blk-field">{label(cfg, key)}
        <select value={v} onChange={e => onChange(e.target.value)}>{opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      </label>
    );
    if (IMAGE_KEY.test(key)) return <div className="blk-field"><MediaPicker label={label(cfg, key)} value={v} onChange={x => onChange(x)} /></div>;
    const long = cfg.long?.includes(key) || v.length > 90 || v.includes('\n') || (typeof def === 'string' && def.length > 90);
    return (
      <label className="blk-field">{label(cfg, key)}
        {long ? <textarea rows={3} value={v} onChange={e => onChange(e.target.value)} /> : <input value={v} onChange={e => onChange(e.target.value)} />}
        {cfg.hints?.[key] && <small className="field-note">{cfg.hints[key]}</small>}
      </label>
    );
  }
  if (typeof tpl === 'boolean') return <label className="toggle-label blk-toggle"><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />{label(cfg, key)}</label>;
  if (typeof tpl === 'number') return <label className="blk-field">{label(cfg, key)}<input type="number" value={Number(value) || 0} onChange={e => onChange(Number(e.target.value))} /></label>;
  if (Array.isArray(tpl)) {
    const arr = Array.isArray(value) ? value : [];
    const itpl = itemTemplate(Array.isArray(def) && def.length ? def : arr);
    // Danh sách chuỗi (hoặc danh sách rỗng chưa có mẫu): mỗi dòng một mục
    if (itpl === undefined || typeof itpl === 'string') return (
      <label className="blk-field">{label(cfg, key)} <span className="blk-sub">(mỗi dòng một mục)</span>
        <textarea rows={Math.min(8, Math.max(3, arr.length + 1))} value={(arr as string[]).join('\n')}
          onChange={e => onChange(e.target.value.split('\n'))} onBlur={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
      </label>
    );
    return <ListEditor key={key} items={arr} tpl={itpl} onChange={onChange} cfg={cfg} k={key} depth={depth} />;
  }
  if (isObj(tpl)) {
    const obj = isObj(value) ? value : {};
    const keys = Array.from(new Set([...Object.keys(tpl), ...Object.keys(obj)])).filter(k => !cfg.hidden?.includes(k));
    const body = keys.map(k => (
      <div key={k} className={Array.isArray(tpl[k]) && isObj(itemTemplate(tpl[k] as Json[])) ? 'blk-wide' : ''}>
        {node(obj[k] ?? blank(tpl[k], k), isObj(def) ? def[k] : undefined, v => onChange({ ...obj, [k]: v }), cfg, k, depth + 1)}
      </div>
    ));
    const title = cfg.groupTitle?.(key);
    if (depth > 0 && (title || keys.length > 2)) return (
      <fieldset className="blk-group"><legend>{title || label(cfg, key)}</legend><div className="blk-grid">{body}</div></fieldset>
    );
    return <div className="blk-grid">{body}</div>;
  }
  return null;
}

function ListEditor({ items, tpl, onChange, cfg, k, depth }: { items: Json[]; tpl: Json; onChange: (v: Json) => void; cfg: BlockEditorConfig; k: string; depth: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const fixed = cfg.fixed?.includes(k);
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); setOpen(j); };
  return (
    <div className="blk-list">
      <div className="blk-list__head">
        <span>{label(cfg, k)} <b>{items.length}</b></span>
        {!fixed && <button type="button" className="admin-secondary blk-btn" onClick={() => { onChange([...items, blank(tpl)]); setOpen(items.length); }}><Plus size={15} aria-hidden="true" /> Thêm</button>}
      </div>
      {items.map((it, i) => (
        <details key={i} className="blk-item" open={open === i} onToggle={e => { if ((e.target as HTMLDetailsElement).open) setOpen(i); else if (open === i) setOpen(null); }}>
          <summary>
            <span className="blk-item__n">{i + 1}</span>
            <span className="blk-item__t">{summaryOf(it, i)}</span>
            {isObj(it) && it.visible === false && <span className="adm-pill adm-pill--muted">Đang ẩn</span>}
          </summary>
          <div className="blk-item__tools">
            <button type="button" className="blk-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Đưa lên"><ArrowUp size={15} /></button>
            <button type="button" className="blk-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Đưa xuống"><ArrowDown size={15} /></button>
            {!fixed && <button type="button" className="blk-icon blk-icon--danger" onClick={() => { if (confirm('Xóa mục này?')) { onChange(items.filter((_, j) => j !== i)); setOpen(null); } }} aria-label="Xóa"><Trash2 size={15} /></button>}
          </div>
          {open === i && node(it, tpl, v => onChange(items.map((x, j) => (j === i ? v : x))), cfg, k + '[]', 0)}
        </details>
      ))}
    </div>
  );
}

/** Khung một khối: tiêu đề, mô tả, nút khôi phục mặc định. */
export function BlockPanel({ title, desc, edited, onReset, children }: { title: string; desc?: ReactNode; edited: boolean; onReset: () => void; children: ReactNode }) {
  return (
    <section className="admin-panel blk-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {edited && <button type="button" className="admin-secondary blk-btn" onClick={() => { if (confirm('Khôi phục nội dung mặc định cho mục này? Thay đổi chỉ được ghi khi bấm Lưu.')) onReset(); }}><RotateCcw size={15} aria-hidden="true" /> Khôi phục mặc định</button>}
      </div>
      {desc && <p className="field-note">{desc}</p>}
      {children}
    </section>
  );
}
