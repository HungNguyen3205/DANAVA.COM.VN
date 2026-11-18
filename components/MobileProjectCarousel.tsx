'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useSite } from './SiteStore';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * MobileProjectCarousel: Băng chuyền dự án lướt ngang mượt mà cho điện thoại
 * Khắc phục tình trạng cuộn dọc bất tận trên màn hình nhỏ.
 * Tích hợp CSS scroll-snap và nút vuốt tiện lợi.
 */
export default function MobileProjectCarousel() {
  const { data } = useSite();
  const projects = (data.projects || []).filter(p => p.published && p.featured);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!projects.length) return null;

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: idx * width,
      behavior: 'smooth'
    });
    setActiveIndex(idx);
  };

  return (
    <div className="mobile-carousel-wrap">
      <div className="carousel-control-header">
        <span className="carousel-counter">
          Dự án <strong>0{activeIndex + 1}</strong> / 0{projects.length}
        </span>
        <div className="carousel-nav-arrows">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Dự án trước"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scrollToIndex(Math.min(projects.length - 1, activeIndex + 1))}
            disabled={activeIndex === projects.length - 1}
            aria-label="Dự án tiếp theo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="carousel-track"
        onScroll={handleScroll}
      >
        {projects.map((p, i) => (
          <div key={p.id} className="carousel-slide">
            <Link href={`/du-an/${p.slug}/`} className="carousel-project-card">
              <div className="carousel-media-frame">
                <img
                  src={p.image}
                  alt={p.client || p.title}
                  loading="lazy"
                  className="carousel-img"
                />
                <span className="carousel-badge">{p.category}</span>
                <span className="carousel-action-icon">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="carousel-card-body">
                <div className="carousel-card-meta">
                  <span>0{i + 1} / {p.client}</span>
                  <small>TRIỂN KHAI THẬT</small>
                </div>
                <h4>{p.title}</h4>
                <p>{p.summary}</p>
                <div className="carousel-readmore">
                  <span>Xem hồ sơ dự án</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="carousel-dots-row" aria-hidden="true">
        {projects.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            className={`carousel-dot ${dotIdx === activeIndex ? 'is-active' : ''}`}
            onClick={() => scrollToIndex(dotIdx)}
            aria-label={`Chuyển tới dự án ${dotIdx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

