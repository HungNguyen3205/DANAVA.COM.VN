/**
 * Icon "dễ thương" dùng chung: nét mảnh trong ô bo góc nền nhạt (xanh navy hoặc cam), theo phong cách mega menu DANAVA.
 * Chọn icon theo đường dẫn để dữ liệu menu vẫn sửa được trong trang quản trị mà không cần lưu tên icon.
 */
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid, Bus, Tag, Laptop, Megaphone, Globe, CalendarDays, FolderKanban, Handshake, Users, Sparkles,
  Cpu, Layers, HeartHandshake, TrendingUp, Search, ChartNoAxesColumn, PenTool, Code, Rocket, GraduationCap, Settings2,
  Palette, Bot, MessageCircle, Sprout, Network, Plane
} from 'lucide-react';

export type Tone = 'blue' | 'orange';

const BY_HREF: [string, LucideIcon, Tone][] = [
  ['/giai-phap/danava-studio', LayoutGrid, 'blue'],
  ['/giai-phap/danava-go', Bus, 'orange'],
  ['/giai-phap/hello-danava', Tag, 'blue'],
  ['/giai-phap/danava-work', Laptop, 'orange'],
  ['/giai-phap/digital-marketing', Megaphone, 'orange'],
  ['/giai-phap/thiet-ke-website', Globe, 'blue'],
  ['/giai-phap/su-kien-truyen-thong', CalendarDays, 'blue'],
  ['/du-an', FolderKanban, 'orange'],
  ['/doi-tac', Handshake, 'blue'],
  ['/doi-ngu', Users, 'orange']
];

export function iconFor(href: string): [LucideIcon, Tone] {
  const hit = BY_HREF.find(([p]) => href.startsWith(p));
  return hit ? [hit[1], hit[2]] : [Sparkles, 'orange'];
}

export function IconBox({ icon: Icon, tone = 'blue', className = '' }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return <span className={`s-ico s-ico--${tone}${className ? ' ' + className : ''}`} aria-hidden="true"><Icon strokeWidth={1.7} /></span>;
}

export function HrefIcon({ href, className }: { href: string; className?: string }) {
  const [icon, tone] = iconFor(href);
  return <IconBox icon={icon} tone={tone} className={className} />;
}

/** Bộ icon cho các nhóm nội dung trang chủ */
export const WHY_ICONS: LucideIcon[] = [Cpu, Layers, HeartHandshake, TrendingUp];
export const PROCESS_ICONS: LucideIcon[] = [Search, ChartNoAxesColumn, PenTool, Code, Rocket, GraduationCap, Settings2];
export const SERVICE_ICONS: Record<string, LucideIcon> = { 'Marketing AI': Bot, 'DANAVA Branding': Palette };
export const NETWORK_ICONS: LucideIcon[] = [Globe, MessageCircle, Sprout, Bot, Network, Plane];
