/*
 * Kênh liên hệ và mạng xã hội hiển thị trên website (nút nổi, menu, chân trang, trang Liên hệ).
 * Nguồn: Cài đặt (hotline) + Thông tin công ty (Facebook, YouTube, TikTok) + Kênh liên hệ (extras.contact).
 */
import type { SiteData } from './content.ts';
import { CONTACT } from './company.ts';
import { block } from './blocks.ts';

export type SocialKey = 'facebook' | 'tiktok' | 'youtube' | 'zalo' | 'linkedin' | 'x';
export const SOCIAL_NAMES: Record<SocialKey, string> = { facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', zalo: 'Zalo', linkedin: 'LinkedIn', x: 'X' };

const https = (url: string) => (/^https:\/\/[^\s"'<>]+$/.test(url.trim()) ? url.trim() : '');

/**
 * m.me dùng chung tên người dùng với Fanpage: facebook.com/ten-trang → m.me/ten-trang.
 * Dạng không có tên người dùng (profile.php, /p/…, /groups/…) thì không suy ra được.
 */
export function messengerFromPage(facebook: string) {
  const name = /^https:\/\/(?:www\.|m\.|web\.)?facebook\.com\/([A-Za-z0-9.]{5,50})\/?$/.exec(facebook.trim())?.[1];
  return !name || /\.php$|^(pages|groups|people|share|watch|reels?|events)$/i.test(name) ? '' : `https://m.me/${name}`;
}

export function contactChannels(data: Pick<SiteData, 'blocks' | 'staff' | 'phone' | 'extras'>) {
  const company = block(data, 'company');
  const custom = block(data, 'contact');
  const phone = data.phone || CONTACT.phone;
  const digits = phone.replace(/\D/g, '');
  const zalo = https(custom.zalo) || (digits ? `https://zalo.me/${digits}` : '');
  const links: Record<SocialKey, string> = {
    facebook: https(company.facebook),
    tiktok: https(company.tiktok),
    youtube: https(company.youtube),
    zalo,
    linkedin: https(custom.linkedin),
    x: https(custom.x)
  };
  return {
    phone,
    tel: digits ? `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}` : '',
    zalo,
    /** '' = chưa cấu hình và không suy ra được → không hiện nút */
    messenger: https(custom.messenger) || messengerFromPage(company.facebook),
    /** Chỉ các kênh có liên kết thật */
    socials: (Object.keys(links) as SocialKey[]).filter(key => links[key]).map(key => ({ key, name: SOCIAL_NAMES[key], href: links[key] }))
  };
}
