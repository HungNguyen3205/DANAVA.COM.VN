import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { breadcrumbLD, seo, notFoundMeta } from '@/lib/seo';
import { getSiteContent } from '@/lib/database';
import { JsonLd } from '@/components/site/blocks';
import { Crumbs } from '@/components/site/ui';
import { ct } from '@/components/site/cms';
import { TemplatePreview } from '@/components/site/TemplatePreview';
import { TemplateCard } from '@/components/site/TemplateGallery';
import { publishedTemplates, templateById, templateHref, type WebTemplate } from '@/lib/web-templates';
import { cmsText } from '@/components/site/cms';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { data } = await getSiteContent();
  const t = templateById(data, (await params).slug);
  if (!t || t.kind !== 'demo' || !t.published) return notFoundMeta;
  return seo(`${t.name} — ${t.brand}`, `${t.desc} Phong cách ${t.style}, phù hợp: ${t.fit}.`, `/mau-website/${t.id}/`, t.thumb || undefined);
}

/** /mau-website/<slug>/ — xem trước trực tiếp một mẫu + thông tin thiết kế + mẫu khác. Dự án thật → trang case study. */
export default async function Page({ params }: Params) {
  const { slug } = await params;
  const { data } = await getSiteContent();
  const found = templateById(data, slug);
  if (!found || !found.published) notFound();
  if (found.kind === 'live') { const h = templateHref(found); permanentRedirect(h.startsWith('/') ? h : '/mau-website/'); }
  const t: WebTemplate = found;
  const T = (k: string, def: string, label: string) => { const x = ct(data, `mau.${k}`, def, label, { scope: 'global' }); return <span {...x.a}>{x.v}</span>; };
  // Chữ của mẫu: hồ sơ rec.webTemplates.<id>.<trường> (sửa tại chỗ + dịch)
  const R = (f: string, v: string, label: string) => <span {...cmsText(`rec.webTemplates.${t.id}.${f}`, label, { scope: 'record', scopeLabel: `Mẫu ${t.brand || t.name}` })}>{v}</span>;
  const others = publishedTemplates(data).filter(x => x.id !== t.id).slice(0, 3);
  return (
    <main id="main" className="mau mau-one">
      <JsonLd value={breadcrumbLD([{ label: 'Trang chủ', href: '/' }, { label: 'Kho mẫu website', href: '/mau-website/' }, { label: t.name, href: `/mau-website/${t.id}/` }])} />
      <section className="mau-one__head">
        <div className="s-container">
          <Crumbs data={data} items={[{ href: '/', label: 'Trang chủ' }, { href: '/mau-website/', label: 'Kho mẫu' }, { label: t.name }]} />
          <div className="mau-one__title">
            <h1>{R('name', t.name, 'Tên mẫu')} <small>{t.brand}</small></h1>
            <p>{R('desc', t.desc, 'Mô tả mẫu')}</p>
          </div>
        </div>
      </section>
      <section className="mau-one__pv" aria-label="Xem trước trực tiếp">
        <div className="s-container"><TemplatePreview t={t} /></div>
      </section>
      <section className="s-section mau-one__info">
        <div className="s-container mau-one__grid">
          <div>
            <h2>{T('one.sections', 'Các khối trong mẫu', 'Trang mẫu: tiêu đề danh sách khối')}</h2>
            <ol className="mau-one__secs">{t.sections.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, '0')}</span>{R(`sections.${i}`, s, 'Tên khối')}</li>)}</ol>
          </div>
          <dl className="mau-one__spec">
            <div><dt>{T('one.style', 'Phong cách', 'Trang mẫu: nhãn phong cách')}</dt><dd>{R('style', t.style, 'Phong cách mẫu')}</dd></div>
            <div><dt>{T('one.palette', 'Bảng màu', 'Trang mẫu: nhãn bảng màu')}</dt><dd className="mau-one__pal">{t.palette.map(c => <span key={c}><i style={{ background: c }} />{c}</span>)}</dd></div>
            <div><dt>{T('one.fonts', 'Cặp chữ', 'Trang mẫu: nhãn font')}</dt><dd>{t.fonts}</dd></div>
            <div><dt>{T('one.fit', 'Phù hợp', 'Trang mẫu: nhãn phù hợp')}</dt><dd>{R('fit', t.fit, 'Mẫu phù hợp với')}</dd></div>
            <div className="mau-one__cta"><Link className="s-btn s-btn--primary" href={`/bao-gia-web/?mau=${t.id}`}>{T('pv.use', 'Dùng mẫu này', 'Xem trước: nút dùng mẫu')}</Link><Link className="s-btn s-btn--ghost" href="/lien-he/#dang-ky-tu-van">{T('one.talk', 'Trao đổi với DANAVA', 'Trang mẫu: nút tư vấn')}</Link></div>
          </dl>
        </div>
      </section>
      <section className="s-section mau-one__more">
        <div className="s-container">
          <h2>{T('one.more', 'Mẫu khác', 'Trang mẫu: tiêu đề mẫu khác')}</h2>
          <div className="mau-grid">{others.map(o => <TemplateCard key={o.id} t={o} />)}</div>
        </div>
      </section>
    </main>
  );
}
