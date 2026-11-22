import type { SiteData } from '@/lib/content';
import { block } from '@/lib/blocks';
import { rich } from './rich';

/** Ảnh thật của DANAVA dạng lưới bất đối xứng. Sửa trong Quản trị → Ảnh doanh nghiệp. */
export function CompanyGallery({ data }: { data: SiteData }) {
  const gallery = block(data, 'gallery');
  const photos = gallery.photos.filter(p => p.visible && p.image);
  if (!gallery.visible || !photos.length) return null;

  return (
    <section className="hb-sec hb-gallery" id="hinh-anh" aria-labelledby="t-gallery">
      <div className="s-container">
        <div className="hb-gallery__head">
          <p className="hb-eyebrow">{gallery.kicker}</p>
          <h2 className="hb-h2" id="t-gallery">{rich(gallery.title)}</h2>
          {gallery.lead && <p className="hb-text">{gallery.lead}</p>}
        </div>
        <ul className="hb-photos" data-count={Math.min(photos.length, 6)}>
          {photos.map((photo, i) => (
            <li key={`${photo.image}-${i}`} data-reveal>
              <figure>
                <img src={photo.image} alt={photo.alt || photo.caption} style={photo.focus ? { objectPosition: photo.focus } : undefined} loading="lazy" decoding="async" />
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
