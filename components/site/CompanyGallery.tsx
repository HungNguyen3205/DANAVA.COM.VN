import type { SiteData } from '@/lib/content';
import { block } from '@/lib/blocks';
import { rich } from './rich';
import { cmsBlock, cmsImage, cmsText } from './cms';

/** Ảnh thật của DANAVA dạng lưới bất đối xứng. Sửa trong Quản trị → Ảnh doanh nghiệp. */
export function CompanyGallery({ data }: { data: SiteData }) {
  const gallery = block(data, 'gallery');
  // Giữ vị trí gốc trong danh sách để vùng chỉnh trực tiếp trỏ đúng ảnh (block.gallery.photos.<i>)
  const photos = gallery.photos.map((p, at) => ({ ...p, at })).filter(p => p.visible && p.image);
  if (!gallery.visible || !photos.length) return null;

  return (
    <section className="hb-sec hb-gallery" id="hinh-anh" aria-labelledby="t-gallery" {...cmsBlock('Ảnh doanh nghiệp', 'gallery', { panel: 'page:anh' })}>
      <div className="s-container">
        <div className="hb-gallery__head">
          <p className="hb-eyebrow" {...cmsText('block.gallery.kicker', 'Nhãn nhỏ')}>{gallery.kicker}</p>
          <h2 className="hb-h2" id="t-gallery" {...cmsText('block.gallery.title', 'Tiêu đề', { rich: true })}>{rich(gallery.title)}</h2>
          {gallery.lead && <p className="hb-text" {...cmsText('block.gallery.lead', 'Câu dẫn', { multiline: true })}>{gallery.lead}</p>}
        </div>
        <ul className="hb-photos" data-count={Math.min(photos.length, 6)}>
          {photos.map((photo, i) => (
            <li key={`${photo.image}-${i}`} data-reveal>
              <figure>
                <img {...cmsImage(`block.gallery.photos.${photo.at}`, `Ảnh ${photo.at + 1}`, { meta: true })} src={photo.image} alt={photo.alt || photo.caption} style={photo.focus ? { objectPosition: photo.focus } : undefined} loading="lazy" decoding="async" />
                {photo.caption && <figcaption {...cmsText(`block.gallery.photos.${photo.at}.caption`, `Chú thích ảnh ${photo.at + 1}`)}>{photo.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
