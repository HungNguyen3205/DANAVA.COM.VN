'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArticlePage } from './PublicPages';
import { useSite } from './SiteStore';

export default function ArticleReader() {
  const { data, ready } = useSite();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchId = new URLSearchParams(window.location.search).get('id') || '';
      setId(searchId);
    }
  }, []);

  // Trạng thái đang tải dữ liệu
  if (!ready || id === null) {
    return (
      <main id="main" className="article-loading-view" aria-live="polite">
        <div className="article-loading-spinner" aria-hidden="true" />
        <p>Đang chuẩn bị nội dung bài viết…</p>
      </main>
    );
  }

  // Nếu không truyền ID bài viết trên URL
  if (!id) {
    return (
      <main id="main" className="article-missing-view">
        <div className="missing-box">
          <div className="missing-symbol" aria-hidden="true">📑</div>
          <p className="eyebrow">DANAVA SOLUTIONS / BẢN TIN</p>
          <h1>Không tìm thấy mã bài viết</h1>
          <p className="missing-desc">
            Đường dẫn đọc nhanh cần có tham số mã bài viết (ví dụ: <code>/kien-thuc/doc?id=wp-13591</code>).
          </p>
          <div className="missing-actions">
            <Link href="/kien-thuc/" className="button amber">
              ← Khám phá Bản tin DANAVA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Tìm bài viết trong kho dữ liệu
  const post = data.posts.find(p => p.id === id);

  // Nếu bài viết không tồn tại hoặc là bản nháp chưa công bố
  if (!post || !post.published) {
    return (
      <main id="main" className="article-missing-view">
        <div className="missing-box">
          <div className="missing-symbol" aria-hidden="true">🔒</div>
          <p className="eyebrow">DANAVA SOLUTIONS / BẢN TIN</p>
          <h1>Bài viết chưa được xuất bản</h1>
          <p className="missing-desc">
            Bài viết mang mã này chưa được phê duyệt công khai hoặc đã được lưu trữ nội bộ.
          </p>
          <div className="missing-actions">
            <Link href="/kien-thuc/" className="button amber">
              ← Quay lại Bản tin DANAVA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <ArticlePage slug={post.slug} />;
}
