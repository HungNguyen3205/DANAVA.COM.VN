'use client';
/**
 * Trình chỉnh sửa trực quan landing page nội bộ.
 * Trái: cây khối (kéo thả, ẩn/hiện, nhân bản, xóa, thêm từ thư viện) · Giữa: xem trước thật (iframe, desktop/tablet/mobile)
 * · Phải: thuộc tính khối đang chọn (Nội dung: chữ, ảnh, liên kết, nút · Hiển thị: cỡ chữ, căn lề, màu, độ rộng, chiều cao, khoảng cách).
 * Dữ liệu khối được kiểm tra hợp lệ khi lưu (lib/page-blocks.ts); giới hạn hiển thị giữ bố cục responsive.
 */
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Monitor, Plus, RotateCcw, Smartphone, Tablet, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MediaPicker from '../MediaPicker';
import { SortableList, ask } from './kit';
import type { Service } from '@/lib/content';
import {
  BLOCKS, STYLE_LIMITS, STYLE_OPTIONS, STYLE_STEP, blockDef, cloneBlock, newBlock, okLink,
  type BlockStyle, type BlockType, type Field, type PageBlock
} from '@/lib/page-blocks';

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICES: { id: Device; label: string; width: string; Icon: typeof Monitor }[] = [
  { id: 'desktop', label: 'Máy tính', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Máy tính bảng', width: '820px', Icon: Tablet },
  { id: 'mobile', label: 'Điện thoại', width: '390px', Icon: Smartphone }
];

const summary = (b: PageBlock) => {
  for (const k of ['title', 'kicker', 'caption', 'alt']) { const v = b.data[k]; if (typeof v === 'string' && v.trim()) return v.length > 42 ? v.slice(0, 42) + '…' : v; }
  return '';
};

export function LandingEditor({ blocks, services, slug, onChange }: { blocks: PageBlock[]; services: Service[]; slug: string; onChange: (blocks: PageBlock[]) => void }) {
  const [selected, setSelected] = useState(blocks[0]?.id || '');
  const [focusField, setFocusField] = useState('');
  const [device, setDevice] = useState<Device>('desktop');
  const [panel, setPanel] = useState<'noi-dung' | 'hien-thi'>('noi-dung');
  const [library, setLibrary] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
  const current = blocks.find(b => b.id === selected);

  const render = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'danava-lp:render', blocks, services, slug, selected }, location.origin);
  }, [blocks, services, slug, selected]);
  useEffect(render, [render]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'danava-lp:ready') render();
      if (e.data?.type === 'danava-lp:select') { setSelected(String(e.data.id)); setFocusField(String(e.data.field || '')); setPanel('noi-dung'); }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, [render]);

  // Bấm vào chữ/ảnh trong bản xem trước → đưa con trỏ tới đúng ô
  useEffect(() => {
    if (!focusField) return;
    const el = propsRef.current?.querySelector<HTMLElement>(`[data-key="${focusField}"]`);
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); (el.querySelector('input,textarea,select,button') as HTMLElement | null)?.focus({ preventScroll: true }); }
  }, [focusField, selected]);

  const update = (id: string, patch: Partial<PageBlock>) => onChange(blocks.map(b => (b.id === id ? { ...b, ...patch } : b)));
  const setData = (key: string, value: unknown) => current && update(current.id, { data: { ...current.data, [key]: value } });
  const setStyle = (patch: Partial<BlockStyle>) => {
    if (!current) return;
    const style = { ...(current.style || {}), ...patch } as Record<string, unknown>;
    for (const k of Object.keys(style)) if (style[k] === undefined || style[k] === '') delete style[k];
    update(current.id, { style: Object.keys(style).length ? (style as BlockStyle) : undefined });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    next.splice(to, 0, b);
    onChange(next);
  };
  const add = (type: BlockType) => {
    const b = newBlock(type);
    const at = blocks.findIndex(x => x.id === selected);
    const next = [...blocks];
    next.splice(at < 0 ? next.length : at + 1, 0, b);
    onChange(next);
    setSelected(b.id);
    setLibrary(false);
    setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'danava-lp:scroll', id: b.id }, location.origin), 150);
  };
  const duplicate = (b: PageBlock) => {
    const copy = cloneBlock(b);
    const at = blocks.findIndex(x => x.id === b.id);
    const next = [...blocks];
    next.splice(at + 1, 0, copy);
    onChange(next);
    setSelected(copy.id);
  };
  const remove = async (b: PageBlock) => {
    if (!(await ask(`Xóa khối “${blockDef(b.type)?.label}”?`, { confirmLabel: 'Xóa khối' }))) return;
    const at = blocks.findIndex(x => x.id === b.id);
    const next = blocks.filter(x => x.id !== b.id);
    onChange(next);
    setSelected(next[Math.min(at, next.length - 1)]?.id || '');
  };
  const pick = (id: string) => {
    setSelected(id);
    setFocusField('');
    frame.current?.contentWindow?.postMessage({ type: 'danava-lp:scroll', id }, location.origin);
  };

  return (
    <div className="lpe">
      {/* ---------- Cây khối ---------- */}
      <aside className="lpe-tree" aria-label="Các khối của trang">
        <div className="lpe-tree__head">
          <b>Khối ({blocks.length})</b>
          <button type="button" className="admin-secondary" onClick={() => setLibrary(v => !v)} aria-expanded={library}><Plus size={14} /> Thêm khối</button>
        </div>
        {library && (
          <div className="lpe-library" role="menu" aria-label="Thư viện khối">
            {BLOCKS.map(b => (
              <button key={b.type} type="button" role="menuitem" onClick={() => add(b.type)}><b>{b.label}</b><small>{b.desc}</small></button>
            ))}
          </div>
        )}
        <SortableList className="lpe-list" items={blocks} getId={b => b.id} getLabel={b => blockDef(b.type)?.label || b.type} onReorder={onChange}
          render={(b, handle) => {
            const i = blocks.findIndex(x => x.id === b.id);
            return (
              <div className={`lpe-node${b.id === selected ? ' is-on' : ''}${b.hidden ? ' is-hidden' : ''}`}>
                {handle}
                <button type="button" className="lpe-pick" onClick={() => pick(b.id)} aria-current={b.id === selected}>
                  <b>{blockDef(b.type)?.label || b.type}</b>
                  <small>{b.hidden ? 'Đang ẩn · ' : ''}{summary(b) || ' '}</small>
                </button>
                <span className="lpe-tools">
                  <button type="button" aria-label="Đưa lên" disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp size={13} /></button>
                  <button type="button" aria-label="Đưa xuống" disabled={i === blocks.length - 1} onClick={() => move(i, i + 1)}><ArrowDown size={13} /></button>
                  <button type="button" aria-label={b.hidden ? 'Hiện khối' : 'Ẩn khối'} onClick={() => update(b.id, { hidden: b.hidden ? undefined : true })}>{b.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                  <button type="button" aria-label="Nhân bản" onClick={() => duplicate(b)}><Copy size={13} /></button>
                  <button type="button" aria-label="Xóa khối" onClick={() => remove(b)}><Trash2 size={13} /></button>
                </span>
              </div>
            );
          }} />
        {!blocks.length && <p className="field-note">Chưa có khối nào. Bấm “Thêm khối”.</p>}
      </aside>

      {/* ---------- Xem trước ---------- */}
      <div className="lpe-stage">
        <div className="lpe-devices" role="radiogroup" aria-label="Xem trước theo thiết bị">
          {DEVICES.map(d => (
            <button key={d.id} type="button" role="radio" aria-checked={device === d.id} className={device === d.id ? 'is-on' : ''} onClick={() => setDevice(d.id)} title={d.label}>
              <d.Icon size={15} /> <span>{d.label}</span>
            </button>
          ))}
          <small className="field-note">Bấm vào khối hoặc chữ trong bản xem trước để chỉnh.</small>
        </div>
        <div className="lpe-canvas">
          <iframe ref={frame} title="Xem trước landing page" src="/xem-truoc-landing/" style={{ width: DEVICES.find(d => d.id === device)!.width }} onLoad={render} />
        </div>
      </div>

      {/* ---------- Thuộc tính ---------- */}
      <aside className="lpe-props" aria-label="Thuộc tính khối" ref={propsRef}>
        {!current ? <p className="field-note">Chọn một khối để chỉnh.</p> : (
          <>
            <div className="lpe-props__head">
              <b>{blockDef(current.type)?.label}</b>
              <button type="button" className="adm-icon-btn" aria-label="Bỏ chọn" onClick={() => setSelected('')}><X size={15} /></button>
            </div>
            <div className="adm-tabs" role="tablist" aria-label="Thuộc tính">
              <button type="button" role="tab" aria-selected={panel === 'noi-dung'} className={panel === 'noi-dung' ? 'is-on' : ''} onClick={() => setPanel('noi-dung')}>Nội dung</button>
              <button type="button" role="tab" aria-selected={panel === 'hien-thi'} className={panel === 'hien-thi' ? 'is-on' : ''} onClick={() => setPanel('hien-thi')}>Hiển thị</button>
            </div>
            {panel === 'noi-dung'
              ? <div className="lpe-fields">{blockDef(current.type)!.fields.map(f => <FieldInput key={f.key} field={f} value={current.data[f.key]} services={services} onChange={v => setData(f.key, v)} />)}</div>
              : <StylePanel style={current.style || {}} onChange={setStyle} onReset={() => update(current.id, { style: undefined })} />}
          </>
        )}
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- Trường nội dung */
function FieldInput({ field: f, value, services, onChange }: { field: Field; value: unknown; services: Service[]; onChange: (v: unknown) => void }) {
  const str = typeof value === 'string' ? value : '';
  switch (f.kind) {
    case 'text':
      return <label data-key={f.key}>{f.label}<input value={str} maxLength={f.max} onChange={e => onChange(e.target.value)} />{f.hint && <small className="field-note">{f.hint}</small>}</label>;
    case 'textarea':
      return <label data-key={f.key}>{f.label}<textarea rows={4} value={str} maxLength={f.max} onChange={e => onChange(e.target.value)} />{f.hint && <small className="field-note">{f.hint}</small>}</label>;
    case 'image':
      return <div data-key={f.key}><MediaPicker label={f.label} value={str} onChange={onChange} /></div>;
    case 'link':
      return (
        <label data-key={f.key}>{f.label}
          <input value={str} maxLength={300} placeholder="/lien-he/ · #dang-ky · https://…" onChange={e => onChange(e.target.value.trim())} aria-invalid={!okLink(str) || undefined} />
          <small className={`field-note${okLink(str) ? '' : ' is-error'}`}>{okLink(str) ? f.hint : 'Đường dẫn không hợp lệ: dùng /trang-trong-website/, #dang-ky hoặc https://…'}</small>
        </label>
      );
    case 'select':
      return <label data-key={f.key}>{f.label}<select value={str} onChange={e => onChange(e.target.value)}>{f.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
    case 'product':
      return (
        <label data-key={f.key}>{f.label}
          <select value={str} onChange={e => onChange(e.target.value)}>
            <option value="">(chọn sản phẩm)</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.title}{s.published === false ? ' (đang ẩn)' : ''}</option>)}
          </select>
          <small className="field-note">Dữ liệu lấy từ hồ sơ sản phẩm đã xuất bản; sửa ở hồ sơ là cập nhật mọi nơi.</small>
        </label>
      );
    case 'boolean':
      return <label data-key={f.key} className="toggle-label"><input type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} />{f.label}</label>;
    case 'list': {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const set = (i: number, k: string, v: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
      const blank = Object.fromEntries((f.fields || []).map(sf => [sf.key, sf.kind === 'boolean' ? false : '']));
      return (
        <fieldset className="adm-fieldset" data-key={f.key}>
          <legend>{f.label} ({items.length}/{f.maxItems})</legend>
          {items.map((it, i) => (
            <div key={i} className="lpe-item">
              {(f.fields || []).map(sf => <FieldInput key={sf.key} field={sf} value={it[sf.key]} services={services} onChange={v => set(i, sf.key, v)} />)}
              <div className="row-actions">
                <button type="button" disabled={i === 0} aria-label="Đưa lên" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>↑</button>
                <button type="button" className="danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Xóa</button>
              </div>
            </div>
          ))}
          <button type="button" className="admin-secondary" disabled={items.length >= (f.maxItems || 20)} onClick={() => onChange([...items, blank])}>+ Thêm</button>
        </fieldset>
      );
    }
  }
}

/* ---------------------------------------------------------------- Hiển thị */
function Range({ label, value, min, max, step, unit, onChange }: { label: string; value: number | undefined; min: number; max: number; step: number; unit: string; onChange: (v: number | undefined) => void }) {
  return (
    <label className="lpe-range">
      <span>{label}<b>{value === undefined ? 'Mặc định' : `${value}${unit}`}</b></span>
      <input type="range" min={min} max={max} step={step} value={value ?? min} onChange={e => onChange(Number(e.target.value))} />
      {value !== undefined && <button type="button" className="text-link" onClick={() => onChange(undefined)}>Về mặc định</button>}
    </label>
  );
}

function StylePanel({ style, onChange, onReset }: { style: BlockStyle; onChange: (p: Partial<BlockStyle>) => void; onReset: () => void }) {
  const choose = <K extends 'align' | 'color' | 'bg' | 'width'>(key: K, label: string) => (
    <label>{label}
      <select value={(style[key] as string) || ''} onChange={e => onChange({ [key]: e.target.value || undefined } as Partial<BlockStyle>)}>
        <option value="">Mặc định</option>
        {STYLE_OPTIONS[key].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
  return (
    <div className="lpe-fields">
      {choose('align', 'Căn lề')}
      <Range label="Cỡ chữ" value={style.size} min={STYLE_LIMITS.size[0]} max={STYLE_LIMITS.size[1]} step={STYLE_STEP.size} unit="%" onChange={size => onChange({ size })} />
      {choose('color', 'Màu chữ')}
      {choose('bg', 'Nền')}
      {choose('width', 'Chiều rộng nội dung')}
      <Range label="Chiều cao tối thiểu" value={style.minHeight} min={STYLE_LIMITS.minHeight[0]} max={STYLE_LIMITS.minHeight[1]} step={STYLE_STEP.minHeight} unit="px" onChange={minHeight => onChange({ minHeight })} />
      <Range label="Khoảng cách phía trên" value={style.padTop} min={STYLE_LIMITS.padTop[0]} max={STYLE_LIMITS.padTop[1]} step={STYLE_STEP.padTop} unit="px" onChange={padTop => onChange({ padTop })} />
      <Range label="Khoảng cách phía dưới" value={style.padBottom} min={STYLE_LIMITS.padBottom[0]} max={STYLE_LIMITS.padBottom[1]} step={STYLE_STEP.padBottom} unit="px" onChange={padBottom => onChange({ padBottom })} />
      <p className="field-note">Giá trị bám lưới và có giới hạn để trang luôn hiển thị tốt trên điện thoại. Xem lại ở chế độ Điện thoại sau khi chỉnh.</p>
      <button type="button" className="admin-secondary" onClick={onReset}><RotateCcw size={14} /> Đặt lại hiển thị của khối</button>
    </div>
  );
}
