'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSite } from './SiteStore';
import { postPhotos } from '@/lib/media';
import { PageHero, PageAnchor, ContactCTA } from './PublicPages';
import { getApprovedSocialPosts, type SocialPost, type SocialPlatform } from '@/lib/social-feed';

/**
 * Định dạng ngày theo chuẩn tiếng Việt
 */
function formatVietnameseDate(dateStr?: string): string {
  if (!dateStr) return 'Chờ cập nhật ngày đăng';
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
 * Nền tảng social badge styling helper
 */
function getPlatformBadge(platform: SocialPlatform) {
  switch (platform) {
    case 'facebook':
      return { label: 'Facebook Fanpage', icon: 'f', className: 'platform-fb' };
    case 'youtube':
      return { label: 'YouTube Media', icon: '▶', className: 'platform-yt' };
    case 'zalo':
      return { label: 'Zalo Official', icon: 'Z', className: 'platform-zalo' };
    case 'tiktok':
      return { label: 'TikTok Channel', icon: '♪', className: 'platform-tiktok' };
    default:
      return { label: 'Kênh chính thức', icon: '✦', className: 'platform-default' };
  }
}

export function NewsletterPage() {
  const { data } = useSite();

  // 1. Quản lý trạng thái bộ lọc Blog và đồng bộ trên URL
  const [category, setCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [socialPlatform, setSocialPlatform] = useState<string>('all');

  // Khởi tạo bộ lọc từ URL Query Parameters khi tải trang
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readParamsFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const qParam = params.get('q');

      if (catParam) {
        setCategory(decodeURIComponent(catParam));
      } else {
        setCategory('Tất cả');
      }

      if (qParam) {
        setSearchQuery(decodeURIComponent(qParam));
      }
    };

    readParamsFromURL();

    // Lắng nghe sự kiện popstate để hỗ trợ nút Back/Forward của trình duyệt
    const handlePopState = () => {
      readParamsFromURL();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cập nhật URL Query Parameter khi thay đổi category hoặc query
  const updateURLParams = useCallback((newCat: string, newQ: string) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    if (newCat && newCat !== 'Tất cả') {
      params.set('category', newCat);
    } else {
      params.delete('category');
    }

    if (newQ && newQ.trim().length > 0) {
      params.set('q', newQ.trim());
    } else {
      params.delete('q');
    }

    const newQueryString = params.toString();
    const newPath = window.location.pathname + (newQueryString ? `?${newQueryString}` : '');

    // Đẩy vào history mà không reload trang
    window.history.pushState(null, '', newPath);
  }, []);

  const handleSelectCategory = (newCat: string) => {
    setCategory(newCat);
    updateURLParams(newCat, searchQuery);
  };

  const handleSearchChange = (newQ: string) => {
    setSearchQuery(newQ);
    updateURLParams(category, newQ);
  };

  const handleResetFilters = () => {
    setCategory('Tất cả');
    setSearchQuery('');
    updateURLParams('Tất cả', '');
  };

  // 2. Lọc và chuẩn bị danh sách bài viết
  const publishedPosts = useMemo(() => {
    return (data.posts || [])
      .filter(p => p.published)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [data.posts]);

  // Danh mục chuyên mục duy nhất từ các bài viết đã xuất bản
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    publishedPosts.forEach(p => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return ['Tất cả', ...Array.from(set)];
  }, [publishedPosts]);

  // Chọn một bài viết nổi bật (Featured Post)
  const featuredPost = useMemo(() => {
    if (!publishedPosts.length) return null;
    // Ưu tiên bài sự kiện hoặc bài có ảnh thực tế tiêu biểu
    const priorityPost = publishedPosts.find(
      p =>
        p.slug.includes('cong-nang-luong') ||
        p.slug.includes('cam-on-team-tumy') ||
        p.image ||
        postPhotos[p.id]
    );
    return priorityPost || publishedPosts[0];
  }, [publishedPosts]);

  // Danh sách bài viết theo chuyên mục (nếu ở tab "Tất cả" thì loại trừ bài featured ra khỏi lưới để tránh lặp)
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return publishedPosts.filter(p => {
      const matchCat = category === 'Tất cả' || p.category === category;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);

      // Nếu đang xem tất cả và không tìm kiếm từ khóa, tách bài featured ra đầu trang
      if (category === 'Tất cả' && !q && featuredPost && p.id === featuredPost.id) {
        return false;
      }

      return matchCat && matchQ;
    });
  }, [publishedPosts, category, searchQuery, featuredPost]);

  // 3. Dữ liệu từ kênh chính thức (Social Feed)
  const officialSocialPosts = useMemo(() => {
    const list = getApprovedSocialPosts();
    if (socialPlatform === 'all') return list;
    return list.filter(p => p.platform === socialPlatform);
  }, [socialPlatform]);

  const toggleEmbed = (postId: string) => {
    setActiveEmbedId(prev => (prev === postId ? null : postId));
  };

  return (
    <main id="main" className="newsletter-page">
      {/* 1. HERO BẢN TIN */}
      <PageHero
        kicker="BẢN TIN DANAVA"
        title="Góc nhìn, tri thức & nhịp đập thực chiến."
        description="Tổng hợp bài viết chuyên sâu về công nghệ số hóa phòng tập, chiến lược truyền thông, du lịch wellness và những kết nối cộng đồng từ DANAVA Solutions."
        image="/assets/legacy/event-session.webp"
      />
      <PageAnchor />

      {/* 2. CHỈ SỐ NHANH BẢN TIN */}
      <section className="section newsletter-stats-bar" aria-label="Thống kê nội dung Bản tin">
        <div className="newsletter-stat-item">
          <span className="stat-num">{publishedPosts.length}+</span>
          <span className="stat-desc">Bài viết xuất bản</span>
        </div>
        <div className="newsletter-stat-item">
          <span className="stat-num">{availableCategories.length - 1}</span>
          <span className="stat-desc">Chuyên mục chuyên sâu</span>
        </div>
        <div className="newsletter-stat-item">
          <span className="stat-num">{officialSocialPosts.length}</span>
          <span className="stat-desc">Bản tin kênh chính thức</span>
        </div>
        <div className="newsletter-stat-item">
          <span className="stat-num">100%</span>
          <span className="stat-desc">Nội dung đối chiếu xác thực</span>
        </div>
      </section>

      {/* 3. BÀI VIẾT NỔI BẬT (FEATURED STORY) */}
      {featuredPost && category === 'Tất cả' && !searchQuery && (
        <section className="section newsletter-featured-section" aria-label="Bài viết tiêu điểm nổi bật">
          <div className="section-kicker">
            <span>TIÊU ĐIỂM BẢN TIN</span>
            <span>BÀI VIẾT ĐẶC SẮC NHẤT</span>
          </div>

          <article className="featured-story-card">
            <div className="featured-story-media">
              <Link href={`/blogs/${featuredPost.slug}/`} tabIndex={-1} aria-hidden="true">
                <img
                  src={featuredPost.image || postPhotos[featuredPost.id] || '/assets/legacy/event-session.webp'}
                  alt={featuredPost.title}
                  loading="eager"
                  className="featured-cover-img"
                />
              </Link>
              <span className="featured-badge">⭐ TIÊU ĐIỂM</span>
            </div>

            <div className="featured-story-content">
              <div className="featured-meta-row">
                <span className="category-pill">{featuredPost.category}</span>
                <time dateTime={featuredPost.date} className="publish-time">
                  {formatVietnameseDate(featuredPost.date)}
                </time>
                <span className="read-duration">· 3 phút đọc</span>
              </div>

              <h2 className="featured-title">
                <Link href={`/blogs/${featuredPost.slug}/`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="featured-excerpt">
                {featuredPost.excerpt ||
                  (featuredPost.body
                    ? featuredPost.body.replace(/\n+/g, ' ').slice(0, 240) + '…'
                    : 'Khám phá bài viết chuyên sâu cùng DANAVA Solutions với những giải pháp và góc nhìn thực chiến.')}
              </p>

              <div className="featured-actions">
                <Link href={`/blogs/${featuredPost.slug}/`} className="button amber">
                  Đọc toàn bộ bài viết <span aria-hidden="true">↗</span>
                </Link>
                {featuredPost.source && (
                  <a
                    href={featuredPost.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="featured-source-link"
                  >
                    Xem bài lưu trữ gốc ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        </section>
      )}

      {/* 4. DANH SÁCH BLOG THEO CHUYÊN MỤC & BỘ LỌC ĐỒNG BỘ TRÊN URL */}
      <section className="section newsletter-blog-section" aria-label="Danh sách bài viết theo chuyên mục">
        <div className="section-kicker">
          <span>DANH SÁCH BÀI VIẾT</span>
          <span>THEO CHUYÊN MỤC &amp; TỪ KHÓA</span>
        </div>

        {/* Thanh điều khiển: Tabs bộ lọc và Ô tìm kiếm */}
        <div className="newsletter-controls-box">
          <div className="category-tabs-wrapper" role="tablist" aria-label="Bộ lọc chuyên mục bản tin">
            {availableCategories.map(cat => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-pressed={isSelected}
                  className={`newsletter-cat-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectCategory(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="newsletter-search-wrapper">
            <input
              type="search"
              aria-label="Tìm kiếm bài viết trong bản tin"
              placeholder="Tìm theo tiêu đề, nội dung, chuyên mục…"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="newsletter-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => handleSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lưới bài viết */}
        {filteredPosts.length > 0 ? (
          <div className="newsletter-grid">
            {filteredPosts.map((post, idx) => {
              const coverImg = post.image || postPhotos[post.id];
              return (
                <article key={post.id} className="newsletter-card">
                  <Link href={`/blogs/${post.slug}/`} className="card-media-link" tabIndex={-1} aria-hidden="true">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={post.title}
                        loading="lazy"
                        className="card-thumbnail-img"
                      />
                    ) : (
                      <div className={`card-placeholder-art art-${idx % 5}`}>
                        <span>{post.category}</span>
                      </div>
                    )}
                  </Link>

                  <div className="card-body">
                    <div className="card-meta">
                      <span className="card-category-badge">{post.category}</span>
                      <time dateTime={post.date} className="card-date">
                        {formatVietnameseDate(post.date)}
                      </time>
                    </div>

                    <h3 className="card-title">
                      <Link href={`/blogs/${post.slug}/`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="card-excerpt">
                      {post.excerpt || (post.body ? post.body.replace(/\n+/g, ' ').slice(0, 130) + '…' : '')}
                    </p>

                    <div className="card-footer">
                      <Link href={`/blogs/${post.slug}/`} className="card-read-link">
                        Đọc bài viết <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* TRẠNG THÁI RỖNG (EMPTY STATE) */
          <div className="newsletter-empty-state" role="status" aria-live="polite">
            <div className="empty-state-icon" aria-hidden="true">📂</div>
            <h3>Không tìm thấy bài viết phù hợp</h3>
            <p>
              Không có bài viết nào khớp với chuyên mục <strong>"{category}"</strong>
              {searchQuery && <> cùng từ khóa <strong>"{searchQuery}"</strong></>}.
            </p>
            <button
              type="button"
              className="button secondary empty-reset-btn"
              onClick={handleResetFilters}
            >
              Quay lại xem tất cả bài viết ↗
            </button>
          </div>
        )}
      </section>

      {/* 5. MỤC "TỪ KÊNH CHÍNH THỨC" (SOCIAL CHANNELS FEED) */}
      <section className="section newsletter-social-section" aria-label="Tin tức từ các kênh chính thức">
        <div className="section-kicker">
          <span>KÊNH TRUYỀN THÔNG XÁC THỰC</span>
          <span>TỪ KÊNH CHÍNH THỨC DANAVA</span>
        </div>

        <div className="social-intro-heading">
          <div>
            <p className="eyebrow">KẾT NỐI ĐA NỀN TẢNG</p>
            <h2>Cập nhật thực tế<br /><em>từ các kênh chính thức.</em></h2>
          </div>
          <p>
            Theo dõi những bài đăng mới nhất, video sự kiện, câu chuyện vận hành phòng tập và hoạt động cộng đồng được chia sẻ trực tiếp trên Fanpage, YouTube và Zalo OA.
          </p>
        </div>

        {/* Nút lọc nền tảng */}
        <div className="social-platform-filter" role="tablist" aria-label="Lọc nền tảng kênh chính thức">
          {[
            { id: 'all', label: 'Tất cả kênh' },
            { id: 'facebook', label: 'Facebook' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'zalo', label: 'Zalo OA' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={socialPlatform === p.id}
              className={`social-filter-btn ${socialPlatform === p.id ? 'active' : ''}`}
              onClick={() => setSocialPlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Lưới bài đăng mạng xã hội */}
        <div className="social-feed-grid">
          {officialSocialPosts.map(item => {
            const badge = getPlatformBadge(item.platform);
            const isEmbedActive = activeEmbedId === item.id;

            return (
              <article
                key={item.id}
                className={`social-feed-card ${item.pinned ? 'card-pinned' : ''}`}
              >
                {/* Header Card */}
                <div className="social-card-header">
                  <div className="social-channel-info">
                    <span className={`social-platform-badge ${badge.className}`} aria-hidden="true">
                      {badge.icon}
                    </span>
                    <div>
                      <h4 className="channel-name">{item.channelName}</h4>
                      <span className="channel-role">{item.authorRole || badge.label}</span>
                    </div>
                  </div>

                  <div className="social-card-tags">
                    {item.pinned && (
                      <span className="pinned-badge" title="Bài đăng được ghim lên đầu">
                        📌 ĐÃ GHIM
                      </span>
                    )}
                    <time dateTime={item.date} className="social-date">
                      {formatVietnameseDate(item.date)}
                    </time>
                  </div>
                </div>

                {/* Tiêu đề & Nội dung */}
                <h3 className="social-title">{item.title}</h3>
                <p className="social-content-text">{item.content}</p>

                {/* Media Image / Interactive Embed */}
                <div className="social-media-container">
                  {isEmbedActive && item.embedUrl ? (
                    <div className="social-embed-frame">
                      <iframe
                        src={item.embedUrl}
                        title={item.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="embed-iframe"
                      />
                      <button
                        type="button"
                        className="collapse-embed-btn"
                        onClick={() => toggleEmbed(item.id)}
                        aria-label="Thu gọn bản nhúng"
                      >
                        ✕ Thu gọn bản nhúng
                      </button>
                    </div>
                  ) : (
                    <div className="social-thumbnail-box">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="social-thumb-img"
                      />
                      {item.embedUrl && (
                        <button
                          type="button"
                          className="load-embed-btn"
                          onClick={() => toggleEmbed(item.id)}
                          aria-label={`Xem bản nhúng tương tác cho ${item.title}`}
                        >
                          <span className="play-icon" aria-hidden="true">▶</span>
                          <span>Xem bản nhúng tương tác</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="social-tags-list">
                    {item.tags.map(t => (
                      <span key={t} className="social-tag">#{t}</span>
                    ))}
                  </div>
                )}

                {/* Footer với liên kết URL gốc */}
                <div className="social-card-footer">
                  <a
                    href={item.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-original-link"
                    title={`Mở bài viết gốc trên ${badge.label}`}
                  >
                    <span>Xem trên {item.channelName}</span>
                    <span className="arrow-icon" aria-hidden="true">↗</span>
                  </a>
                  {item.embedUrl && !isEmbedActive && (
                    <button
                      type="button"
                      className="interactive-embed-trigger"
                      onClick={() => toggleEmbed(item.id)}
                    >
                      Tải nhúng video ⛶
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION TIẾP NHẬN TRAO ĐỔI */}
      <ContactCTA />
    </main>
  );
}

export default NewsletterPage;

