/**
 * Hiển thị landing page nội bộ từ danh sách khối (lib/page-blocks.ts).
 * Dùng cho trang công khai /lp/{slug}/ và bản xem trước trong trình chỉnh sửa (cùng một component → xem gì được nấy).
 * Mỗi khối có data-block-id, mỗi trường chữ/ảnh có data-field để trình chỉnh sửa bấm chọn.
 * Sản phẩm, bảng giá lấy từ hồ sơ sản phẩm (SiteData.services) — không chép dữ liệu.
 */
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import type { BlockStyle, PageBlock } from '@/lib/page-blocks';
import { PackageGrid } from './ProductPackages';
import { LandingForm } from './LandingForm';

const s = (v: unknown) => (typeof v === 'string' ? v : '');
type Item = Record<string, unknown>;
const list = (v: unknown): Item[] => (Array.isArray(v) ? (v as Item[]) : []);

function Btn({ label, href, primary, field }: { label: string; href: string; primary?: boolean; field: string }) {
  if (!label) return null;
  const cls = `s-btn ${primary ? 's-btn--primary' : 's-btn--secondary'} s-btn--lg`;
  const target = href || '#';
  if (target.startsWith('http')) return <a className={cls} href={target} target="_blank" rel="noopener" data-field={field}>{label}</a>;
  if (target.startsWith('#')) return <a className={cls} href={target} data-field={field}>{label}</a>;
  return <Link className={cls} href={target} data-field={field}>{label}</Link>;
}

/** Đoạn văn: dòng trống tách đoạn. */
function Paragraphs({ text, field }: { text: string; field: string }) {
  const parts = text.split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
  return <div className="lpb-body" data-field={field}>{parts.length ? parts.map((p, i) => <p key={i}>{p}</p>) : <p className="lpb-empty">&nbsp;</p>}</div>;
}

function styleOf(st: BlockStyle = {}): { className: string; style: CSSProperties } {
  const className = [`lpb--bg-${st.bg || 'none'}`, `lpb--w-${st.width || 'normal'}`, `lpb--a-${st.align || 'default'}`, st.color && st.color !== 'default' ? `lpb--c-${st.color}` : ''].filter(Boolean).join(' ');
  const style: CSSProperties & Record<string, string | number> = {};
  if (st.size) style['--lpb-scale'] = st.size / 100;
  if (st.minHeight) style.minHeight = st.minHeight;
  if (st.padTop !== undefined) style.paddingTop = st.padTop;
  if (st.padBottom !== undefined) style.paddingBottom = st.padBottom;
  return { className, style };
}

function Block({ b, data, slug }: { b: PageBlock; data: SiteData; slug: string }) {
  const d = b.data;
  const product = (b.type === 'product' || b.type === 'pricing') ? data.services.find(x => x.id === s(d.productId)) : undefined;
  let body: ReactNode = null;
  switch (b.type) {
    case 'hero':
      body = (
        <div className={`lpb-hero${s(d.image) ? ' has-image' : ''}`}>
          <div className="lpb-hero__copy">
            {s(d.kicker) && <p className="lpb-kicker" data-field="kicker">{s(d.kicker)}</p>}
            <h1 className="lpb-h1" data-field="title">{s(d.title)}</h1>
            {s(d.lead) && <p className="lpb-lead" data-field="lead">{s(d.lead)}</p>}
            <div className="lpb-actions">
              <Btn label={s(d.primaryLabel)} href={s(d.primaryHref)} primary field="primaryLabel" />
              <Btn label={s(d.secondaryLabel)} href={s(d.secondaryHref)} field="secondaryLabel" />
            </div>
          </div>
          {s(d.image) && <img className="lpb-hero__img" src={s(d.image)} alt="" data-field="image" width={1200} height={900} />}
        </div>
      );
      break;
    case 'text':
      body = <div className="lpb-text">{s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}<Paragraphs text={s(d.body)} field="body" /></div>;
      break;
    case 'features':
      body = (
        <>
          {s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}
          {s(d.lead) && <p className="lpb-lead" data-field="lead">{s(d.lead)}</p>}
          <div className="lpb-grid" data-field="items">
            {list(d.items).map((it, i) => <article key={i} className="lpb-card"><h3>{s(it.title)}</h3><p>{s(it.text)}</p></article>)}
          </div>
        </>
      );
      break;
    case 'imageText':
      body = (
        <div className={`lpb-split${s(d.imageSide) === 'left' ? ' is-left' : ''}`}>
          <div>
            {s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}
            <Paragraphs text={s(d.body)} field="body" />
            <div className="lpb-actions"><Btn label={s(d.buttonLabel)} href={s(d.buttonHref)} primary field="buttonLabel" /></div>
          </div>
          {s(d.image) ? <img className="lpb-split__img" src={s(d.image)} alt="" data-field="image" loading="lazy" /> : <div className="lpb-split__img lpb-placeholder" data-field="image">Chọn ảnh</div>}
        </div>
      );
      break;
    case 'image':
      body = (
        <figure className="lpb-figure">
          {s(d.image) ? <img src={s(d.image)} alt={s(d.alt)} data-field="image" loading="lazy" /> : <div className="lpb-placeholder" data-field="image">Chọn ảnh</div>}
          {s(d.caption) && <figcaption data-field="caption">{s(d.caption)}</figcaption>}
        </figure>
      );
      break;
    case 'gallery':
      body = (
        <>
          {s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}
          <div className="lpb-gallery" data-field="images">
            {list(d.images).length ? list(d.images).map((it, i) => <figure key={i}><img src={s(it.src)} alt={s(it.caption)} loading="lazy" />{s(it.caption) && <figcaption>{s(it.caption)}</figcaption>}</figure>) : <div className="lpb-placeholder">Thêm ảnh vào bộ ảnh</div>}
          </div>
        </>
      );
      break;
    case 'product':
      body = product ? (
        <article className="lpb-product" data-field="productId">
          {product.image && <img src={product.image} alt="" loading="lazy" />}
          <div>
            <h2 className="lpb-h2">{product.title}</h2>
            <p className="lpb-lead">{product.heroLead || product.description}</p>
            {d.showFeatures === true && (product.features?.length ? product.features : product.items.map(t => ({ title: t, text: '' }))).slice(0, 6).length > 0 && (
              <ul className="lpb-checks">{(product.features?.length ? product.features.map(f => f.title) : product.items).slice(0, 6).map(t => <li key={t}><Check aria-hidden="true" />{t}</li>)}</ul>
            )}
            <div className="lpb-actions"><Btn label={s(d.buttonLabel)} href={`/giai-phap/${product.slug}/`} primary field="buttonLabel" /></div>
          </div>
        </article>
      ) : <div className="lpb-placeholder" data-field="productId">Chọn sản phẩm (chỉ sản phẩm đang hiển thị)</div>;
      break;
    case 'pricing':
      body = (
        <>
          {s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}
          {product?.packages?.length
            ? <div data-field="productId"><PackageGrid packages={product.packages} contactHref="#dang-ky" /></div>
            : <div className="lpb-placeholder" data-field="productId">{product ? `${product.title} chưa có gói & giá. Thêm ở hồ sơ sản phẩm.` : 'Chọn sản phẩm có gói & giá'}</div>}
          {product?.pricing && <p className="lpb-note">{product.pricing}</p>}
        </>
      );
      break;
    case 'faq':
      body = (
        <>
          {s(d.title) && <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>}
          <div className="lpb-faq" data-field="items">
            {list(d.items).map((it, i) => <details key={i}><summary>{s(it.q)}</summary><p>{s(it.a)}</p></details>)}
          </div>
        </>
      );
      break;
    case 'cta':
      body = (
        <div className="lpb-cta">
          <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>
          {s(d.lead) && <p className="lpb-lead" data-field="lead">{s(d.lead)}</p>}
          <div className="lpb-actions"><Btn label={s(d.buttonLabel)} href={s(d.buttonHref)} primary field="buttonLabel" /></div>
        </div>
      );
      break;
    case 'form':
      body = (
        <div className="lpb-form-wrap" id="dang-ky">
          <div>
            <h2 className="lpb-h2" data-field="title">{s(d.title)}</h2>
            {s(d.lead) && <p className="lpb-lead" data-field="lead">{s(d.lead)}</p>}
          </div>
          <LandingForm slug={slug} service={s(d.service)} buttonLabel={s(d.buttonLabel) || 'Gửi đăng ký'} />
        </div>
      );
      break;
  }
  const { className, style } = styleOf(b.style);
  return (
    <section className={`lpb lpb-${b.type} ${className}`} style={style} data-block-id={b.id} data-block-type={b.type}>
      <div className="lpb__inner">{body}</div>
    </section>
  );
}

export function LandingBlocks({ blocks, data, slug, showHidden = false }: { blocks: PageBlock[]; data: SiteData; slug: string; showHidden?: boolean }) {
  return (
    <div className="lpb-page">
      {blocks.filter(b => showHidden || !b.hidden).map(b => (
        <div key={b.id} className={b.hidden ? 'lpb-hidden' : undefined}><Block b={b} data={data} slug={slug} /></div>
      ))}
    </div>
  );
}
