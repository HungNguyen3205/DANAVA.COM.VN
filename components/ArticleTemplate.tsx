'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSite } from './SiteStore';
import { postPhotos } from '@/lib/media';
import { archivedPosts } from '@/lib/archived-posts';
import { ContactCTA } from './PublicPages';
import { type Post } from '@/lib/content';

/**
 * Định dạng ngày đăng theo chuẩn tiếng Việt
 */
function formatVietnameseDate(dateStr?: string): string {
  if (!dateStr) return 'Đang cập nhật ngày đăng';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Cấu trúc mục lục bài viết
 */
interface TableOfContentItem {
  id: string;
  title: string;
  level: number;
}

/**
 * Cấu trúc khối nội dung được phân tích từ CMS
 */
interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'quote';
  id?: string;
  text?: string;
  items?: string[];
}

/**
 * Trích xuất mục lục và chuẩn hóa cấu trúc nội dung từ chuỗi văn bản CMS
 */
function parseArticleBody(rawBody: string): {
  blocks: ContentBlock[];
  toc: TableOfContentItem[];
  wordCount: number;
} {
  const lines = rawBody.split('\n');
  const blocks: ContentBlock[] = [];
  const toc: TableOfContentItem[] = [];
  let currentList: string[] = [];
  let wordCount = 0;
  let sectionIndex = 1;

  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: [...currentList] });
      currentList = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // Đếm từ
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    wordCount += words;

    // 1. Nhận diện danh sách gạch đầu dòng (bullet points)
    if (/^[-*+]\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[-*+]\s+/, ''));
      continue;
    }

    // 2. Nhận diện danh sách số lồng nhau
    if (/^\d+\.\d+\s+/.test(trimmed)) {
      currentList.push(trimmed);
      continue;
    }

    // 3. Nhận diện tiêu đề phân đoạn (Heading)
    // Các dạng: "1. Tiêu đề", "Bước 1: ...", "I. Tiêu đề", hoặc dòng in hoa ngắn
    const isNumberedHeading = /^(\d+|[I|V|X]+)[\.\)]\s+(.+)/.test(trimmed);
    const isStepHeading = /^Bước\s+\d+[:\-]\s+(.+)/i.test(trimmed);
    const isCapsHeading =
      trimmed.length >= 6 &&
      trimmed.length <= 85 &&
      trimmed === trimmed.toUpperCase() &&
      !trimmed.endsWith('.') &&
      !trimmed.includes(':') &&
      words >= 2;

    if (isNumberedHeading || isStepHeading || isCapsHeading) {
      flushList();
      const headingId = `section-${sectionIndex++}`;
      const headingTitle = trimmed;

      toc.push({
        id: headingId,
        title: headingTitle,
        level: isNumberedHeading || isStepHeading ? 2 : 3
      });

      blocks.push({
        type: 'heading',
        id: headingId,
        text: headingTitle
      });
      continue;
    }

    // 4. Nhận diện trích dẫn
    if (trimmed.startsWith('>') || trimmed.startsWith('“') && trimmed.endsWith('”')) {
      flushList();
      blocks.push({
        type: 'quote',
        text: trimmed.replace(/^>\s*/, '')
      });
      continue;
    }

    // 5. Đoạn văn thông thường
    flushList();
    blocks.push({
      type: 'paragraph',
      text: trimmed
    });
  }

  flushList();
  return { blocks, toc, wordCount };
}

export function ArticleTemplate({ slug }: { slug: string }) {
  const { data } = useSite();
  const [tocOpen, setTocOpen] = useState(true);

  // 1. Tìm bài viết hợp lệ và đã xuất bản (Ẩn tuyệt đối các bản nháp khỏi public)
  const post = useMemo(() => {
    return (data.posts || []).find(p => p.slug === slug && p.published);
  }, [data.posts, slug]);

  // 2. Xử lý bài viết chưa xuất bản hoặc không tồn tại
  if (!post) {
    return (
      <main id="main" className="article-missing-view">
        <div className="missing-box">
          <div className="missing-symbol" aria-hidden="true">🔒</div>
          <p className="eyebrow">DANAVA SOLUTIONS / BẢN TIN</p>
          <h1>Bài viết chưa được xuất bản</h1>
          <p className="missing-desc">
            Nội dung này hiện đang trong trạng thái biên tập nội bộ, đã được ẩn hoặc chưa sẵn sàng công khai trên hệ thống.
          </p>
          <div className="missing-actions">
            <Link href="/blogs/" className="button amber">
              ← Quay lại Bản tin DANAVA
            </Link>
            <Link href="/" className="button secondary">
              Về Trang chủ ↗
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Phân tích nội dung và mục lục
  const { blocks, toc, wordCount } = useMemo(() => {
    return parseArticleBody(post.body || '');
  }, [post.body]);

  // Ước tính thời gian đọc (trung bình 220 từ/phút)
  const readDurationMinutes = Math.max(2, Math.ceil(wordCount / 220));

  // Ảnh bìa bài viết
  const coverPhoto = post.image || postPhotos[post.id];

  // Kiểm tra bài viết lưu trữ
  const archiveInfo = archivedPosts[post.id];

  // 4. Lấy danh sách bài viết liên quan (ưu tiên cùng chuyên mục, đã xuất bản)
  const relatedPosts = useMemo(() => {
    const others = (data.posts || []).filter(
      p => p.published && p.id !== post.id && p.slug !== post.slug
    );

    // Ưu tiên cùng chuyên mục
    const sameCat = others.filter(p => p.category === post.category);
    const diffCat = others.filter(p => p.category !== post.category);

    return [...sameCat, ...diffCat].slice(0, 3);
  }, [data.posts, post]);

  return (
    <main id="main" className="article-detail-page">
      {/* 1. BREADCRUMB & HEADER QUAY LẠI */}
      <section className="article-nav-bar">
        <div className="article-nav-container">
          <Link href="/blogs/" className="article-back-link">
            <span aria-hidden="true">←</span> Quay lại Bản tin DANAVA
          </Link>
          <nav aria-label="Breadcrumb" className="article-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="sep" aria-hidden="true">/</span>
            <Link href="/blogs/">Bản tin</Link>
            <span className="sep" aria-hidden="true">/</span>
            <span className="current" aria-current="page">{post.category}</span>
          </nav>
        </div>
      </section>

      {/* 2. HEADER BÀI VIẾT: TIÊU ĐỀ, TÁC GIẢ, NGÀY ĐĂNG, DURATION */}
      <header className="article-header-section">
        <div className="article-header-container">
          <div className="article-badge-row">
            <span className="article-cat-badge">{post.category}</span>
            {archiveInfo && (
              <span className="article-archive-badge">✓ KHO LƯU TRỮ XÁC MINH</span>
            )}
          </div>

          <h1 className="article-main-title">{post.title}</h1>

          {post.excerpt && (
            <p className="article-lead-excerpt">{post.excerpt}</p>
          )}

          {/* Metadata Tác giả, Ngày đăng và Thời lượng */}
          <div className="article-meta-card">
            <div className="author-info-block">
              <div className="author-avatar-circle" aria-hidden="true">
                <span>D</span>
              </div>
              <div className="author-text">
                <span className="author-label">TÁC GIẢ</span>
                <strong className="author-name">DANAVA Solutions</strong>
                <small className="author-team">Đội ngũ Biên tập &amp; Nghiên cứu</small>
              </div>
            </div>

            <div className="meta-stats-block">
              <div className="meta-stat-cell">
                <span className="cell-label">NGÀY ĐĂNG</span>
                <time dateTime={post.date} className="cell-value">
                  {formatVietnameseDate(post.date)}
                </time>
              </div>

              <div className="meta-stat-cell">
                <span className="cell-label">THỜI GIAN ĐỌC</span>
                <span className="cell-value">~ {readDurationMinutes} phút đọc</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. ẢNH BÌA BÀI VIẾT (HOẶC FALLBACK NGHỆ THUẬT KHI THIẾU ẢNH) */}
      <section className="article-cover-section">
        <div className="article-cover-container">
          {coverPhoto ? (
            <div className="article-cover-frame">
              <img
                src={coverPhoto}
                alt={post.title}
                className="article-hero-img"
                loading="eager"
              />
              <div className="cover-glass-caption">
                <span>Ảnh tư liệu: {post.category} · DANAVA Solutions</span>
              </div>
            </div>
          ) : (
            /* Xử lý an toàn khi bài viết thiếu ảnh bìa */
            <div className="article-cover-art-fallback" aria-hidden="true">
              <div className="fallback-art-inner">
                <span className="fallback-symbol">✦</span>
                <span className="fallback-cat">{post.category}</span>
                <p className="fallback-title">{post.title}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. CỘT ĐỌC NỘI DUNG & MỤC LỤC BÀI VIẾT */}
      <article className="article-reading-section">
        <div className="article-reading-container">
          {/* MỤC LỤC CHO BÀI ĐỦ DÀI (Khi có từ 2 tiêu đề trở lên) */}
          {toc.length >= 2 && (
            <div className="article-toc-box">
              <div className="toc-header">
                <div className="toc-title-wrap">
                  <span className="toc-icon" aria-hidden="true">📑</span>
                  <h2 className="toc-title">Mục lục nội dung</h2>
                  <span className="toc-count">({toc.length} phần)</span>
                </div>
                <button
                  type="button"
                  className="toc-toggle-btn"
                  onClick={() => setTocOpen(!tocOpen)}
                  aria-expanded={tocOpen}
                  aria-label={tocOpen ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
                >
                  {tocOpen ? 'Thu gọn ▲' : 'Mở rộng ▼'}
                </button>
              </div>

              {tocOpen && (
                <ol className="toc-list">
                  {toc.map(item => (
                    <li key={item.id} className={`toc-item level-${item.level}`}>
                      <a href={`#${item.id}`} className="toc-link">
                        <span className="toc-arrow" aria-hidden="true">↳</span>
                        <span className="toc-text">{item.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* NỘI DUNG VĂN BẢN ĐÃ CHUẨN HÓA VÀ AN TOÀN */}
          <div className="article-prose-body">
            {blocks.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={idx} id={block.id} className="article-heading-anchor">
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'list' && block.items) {
                return (
                  <ul key={idx} className="article-bullet-list">
                    {block.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === 'quote') {
                return (
                  <blockquote key={idx} className="article-quote-block">
                    <p>{block.text}</p>
                  </blockquote>
                );
              }

              return (
                <p key={idx} className="article-paragraph">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* HỘP ĐỐI CHIẾU LƯU TRỮ VÀ XÁC MINH NGUỒN GỐC */}
          <div className="article-provenance-box">
            <div className="provenance-header">
              <span className="provenance-badge">XÁC MINH BẢN QUYỀN &amp; LƯU TRỮ</span>
            </div>
            <p className="provenance-text">
              {archiveInfo
                ? 'Nội dung bài viết được đối chiếu nguyên bản từ kho lưu trữ website chính thức của DANAVA Solutions.'
                : 'Ấn phẩm được biên tập và xuất bản chính thức bởi DANAVA Solutions.'}
            </p>
            {archiveInfo?.source && (
              <a
                href={archiveInfo.source}
                target="_blank"
                rel="noopener noreferrer"
                className="provenance-external-link"
              >
                <span>Đối chiếu bài viết gốc trên kho lưu trữ</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          {/* CHIA SẺ & ĐIỀU HƯỚNG CUỐI BÀI */}
          <div className="article-bottom-nav">
            <Link href="/blogs/" className="back-bottom-btn">
              ← Trở về danh sách Bản tin DANAVA
            </Link>
          </div>
        </div>
      </article>

      {/* 5. KHỐI BÀI VIẾT LIÊN QUAN */}
      {relatedPosts.length > 0 && (
        <section className="section article-related-section" aria-label="Bài viết liên quan">
          <div className="section-kicker">
            <span>BÀI VIẾT LIÊN QUAN</span>
            <span>CHUYÊN MỤC {post.category.toUpperCase()}</span>
          </div>

          <div className="related-heading-row">
            <div>
              <p className="eyebrow">KHÁM PHÁ THÊM</p>
              <h2>Có thể bạn quan tâm.</h2>
            </div>
            <Link href="/blogs/" className="view-all-link">
              Xem toàn bộ Bản tin ↗
            </Link>
          </div>

          <div className="related-cards-grid">
            {relatedPosts.map(rel => {
              const relImg = rel.image || postPhotos[rel.id];
              return (
                <article key={rel.id} className="related-post-card">
                  <Link href={`/blogs/${rel.slug}/`} className="related-media-link" tabIndex={-1} aria-hidden="true">
                    {relImg ? (
                      <img src={relImg} alt={rel.title} loading="lazy" className="related-thumb-img" />
                    ) : (
                      <div className="related-placeholder-thumb">
                        <span>{rel.category}</span>
                      </div>
                    )}
                  </Link>
                  <div className="related-card-body">
                    <div className="related-meta">
                      <span className="related-cat-pill">{rel.category}</span>
                      <time dateTime={rel.date} className="related-date">
                        {formatVietnameseDate(rel.date)}
                      </time>
                    </div>
                    <h3 className="related-title">
                      <Link href={`/blogs/${rel.slug}/`}>
                        {rel.title}
                      </Link>
                    </h3>
                    <Link href={`/blogs/${rel.slug}/`} className="related-read-more">
                      Đọc bài viết <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION LIÊN HỆ */}
      <ContactCTA />
    </main>
  );
}

export default ArticleTemplate;

