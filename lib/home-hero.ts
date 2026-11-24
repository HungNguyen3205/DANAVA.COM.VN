/**
 * Màn mở đầu trang chủ (components/site/HomePage.tsx → .hb-cover).
 * Mặc định = đúng chữ đang hiển thị trên website; quản trị viên sửa ở Website → Trang → Trang chủ → Màn mở đầu
 * (lưu vào SiteData.homeHero). Trường để trống → dùng chữ mặc định.
 */
import { PROFILE_2026 } from './about-danava.ts';

export type HomeHero = {
  /** Nhãn nhỏ phía trên tiêu đề */
  kicker: string;
  /** Tiêu đề dòng 1 (navy) */
  line1: string;
  /** Tiêu đề dòng 2 (cam, nhấn mạnh) */
  line2: string;
  lead: string;
  primaryLabel: string; primaryHref: string;
  secondaryLabel: string; secondaryHref: string;
};

export const DEFAULT_HOME_HERO: HomeHero = {
  kicker: 'DANAVA Solutions',
  line1: 'Cùng bạn phát triển.',
  line2: 'Kiến tạo hệ sinh thái Wellness.',
  lead: `${PROFILE_2026.tagline}: phần mềm quản lý DANAVA Studio, website, truyền thông và sự kiện — một đầu mối cho doanh nghiệp của bạn.`,
  primaryLabel: 'Nhận tư vấn', primaryHref: '/lien-he/',
  secondaryLabel: 'Xem giải pháp', secondaryHref: '/giai-phap/'
};

export const HOME_HERO_LIMITS: Record<keyof HomeHero, number> = {
  kicker: 60, line1: 80, line2: 80, lead: 400, primaryLabel: 40, primaryHref: 300, secondaryLabel: 40, secondaryHref: 300
};

/** Màn mở đầu đang dùng: giá trị đã lưu, trường trống lấy mặc định. */
export function homeHero(data: { homeHero?: Partial<HomeHero> }): HomeHero {
  const saved = data.homeHero || {};
  const out = { ...DEFAULT_HOME_HERO };
  for (const k of Object.keys(DEFAULT_HOME_HERO) as (keyof HomeHero)[]) {
    const v = saved[k];
    if (typeof v === 'string' && v.trim()) out[k] = v;
  }
  return out;
}
