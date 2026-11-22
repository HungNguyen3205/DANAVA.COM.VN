'use client';
/** Quản trị → Kênh liên hệ & mạng xã hội: gom hotline, kênh chat và mạng xã hội vào một màn hình. */
import type { SiteData } from '@/lib/content';
import { block, withBlock } from '@/lib/blocks';
import { contactChannels, messengerFromPage } from '@/lib/contact-channels';
import { Text } from './AdminContentEditors';

export function ChannelsEditor({ draft, setDraft }: { draft: SiteData; setDraft: (d: SiteData) => void }) {
  const company = block(draft, 'company');
  const custom = block(draft, 'contact');
  const setCompany = (patch: Partial<typeof company>) => setDraft(withBlock(draft, 'company', { ...company, ...patch }));
  const setCustom = (patch: Partial<typeof custom>) => setDraft(withBlock(draft, 'contact', { ...custom, ...patch }));
  const result = contactChannels(draft);
  const derived = messengerFromPage(company.facebook);
  const digits = (draft.phone || result.phone).replace(/\D/g, '');

  return (
    <div className="admin-two">
      <section className="admin-panel">
        <h2>Nút liên hệ</h2>
        <p className="field-note">Máy tính: ba nút nổi bên trái. Điện thoại: nằm trong nút “Tư vấn” ở thanh dưới.</p>
        <Text label="Hotline" type="tel" value={draft.phone} max={50} onChange={phone => setDraft({ ...draft, phone })} />
        <Text label="Link Zalo (trống = dùng số Hotline)" value={custom.zalo} max={300} placeholder={`https://zalo.me/${digits}`} onChange={v => setCustom({ zalo: v.trim() })} />
        <Text label="Link Messenger (trống = lấy theo tên Fanpage)" value={custom.messenger} max={300} placeholder={derived || 'https://m.me/ten-fanpage'} onChange={v => setCustom({ messenger: v.trim() })} />
        {!result.messenger && <p className="field-note" role="status">Chưa có link Messenger nên nút này đang ẩn. Fanpage không có tên người dùng thì cần dán link m.me.</p>}

        <h2 className="subheading">Mạng xã hội ở chân trang</h2>
        <p className="field-note">Để trống kênh nào thì biểu tượng kênh đó không hiện. Zalo dùng chung link ở trên.</p>
        <Text label="Facebook (https://…)" value={company.facebook} max={300} onChange={v => setCompany({ facebook: v.trim() })} />
        <Text label="TikTok (https://…)" value={company.tiktok} max={300} onChange={v => setCompany({ tiktok: v.trim() })} />
        <Text label="YouTube (https://…)" value={company.youtube} max={300} onChange={v => setCompany({ youtube: v.trim() })} />
        <Text label="LinkedIn (https://…)" value={custom.linkedin} max={300} onChange={v => setCustom({ linkedin: v.trim() })} />
        <Text label="X (https://x.com/…)" value={custom.x} max={300} onChange={v => setCustom({ x: v.trim() })} />
      </section>

      <section className="admin-panel">
        <h2>Liên kết sẽ hiển thị</h2>
        <p className="field-note">Bấm từng liên kết để chắc chắn mở đúng tài khoản DANAVA trước khi lưu.</p>
        <p><b>Hotline</b><br />{result.tel || 'Đang ẩn'}</p>
        <p><b>Messenger</b><br />{result.messenger ? <a className="text-link" href={result.messenger} target="_blank" rel="noopener noreferrer">{result.messenger}</a> : 'Đang ẩn'}</p>
        {result.socials.map(s => (
          <p key={s.key}><b>{s.name}</b><br /><a className="text-link" href={s.href} target="_blank" rel="noopener noreferrer">{s.href}</a></p>
        ))}
      </section>
    </div>
  );
}
