'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Briefcase, MessageSquare } from 'lucide-react';

/**
 * Mobile Bottom Navigation Bar (Bottom Nav)
 * Cố định ở đáy màn hình trên thiết bị di động (<= 768px)
 * Giúp người dùng dễ dàng thao tác bằng ngón tay cái (Thumb reach)
 * Chuẩn nhận diện công nghệ sang trọng DANAVA (#0B132B / #1C2541 / #5BC0DE / #F4D6B0)
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  // Ẩn thanh điều hướng dưới đáy khi ở trong màn hình Quản trị Admin
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: 'Trang chủ',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/giai-phap/',
      label: 'Giải pháp',
      icon: Layers,
      isActive: pathname.startsWith('/giai-phap')
    },
    {
      href: '/du-an/',
      label: 'Dự án',
      icon: Briefcase,
      isActive: pathname.startsWith('/du-an')
    },
    {
      href: '/lien-he/',
      label: 'Liên hệ',
      icon: MessageSquare,
      isActive: pathname.startsWith('/lien-he')
    }
  ];

  return (
    <aside
      className="mobile-bottom-nav"
      aria-label="Thanh điều hướng nhanh ngón tay cái trên điện thoại"
    >
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-tab ${item.isActive ? 'is-active' : ''}`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div className="bottom-nav-icon-box">
                <IconComp
                  className="bottom-nav-svg"
                  size={21}
                  strokeWidth={item.isActive ? 2.3 : 1.8}
                />
                {item.isActive && <span className="bottom-nav-dot" aria-hidden="true" />}
              </div>
              <span className="bottom-nav-text">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

