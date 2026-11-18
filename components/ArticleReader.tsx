'use client';

import { useEffect, useState } from 'react';
import { useSite } from './SiteStore';
import { ArticleView, ArticleNotAvailable } from './site/ArticleView';

/** Đường dẫn đọc nhanh /kien-thuc/doc?id=... (không index). */
export default function ArticleReader() {
  const { data } = useSite();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get('id') || '');
  }, []);

  if (id === null) {
    return (
      <main id="main" className="s-section" aria-live="polite">
        <div className="s-container s-container--narrow s-article-missing">
          <p className="s-lead">Đang chuẩn bị nội dung bài viết…</p>
        </div>
      </main>
    );
  }

  if (!id) {
    return <ArticleNotAvailable title="Không tìm thấy mã bài viết" text="Đường dẫn đọc nhanh cần có mã bài viết, ví dụ /kien-thuc/doc?id=wp-13591." />;
  }

  const post = data.posts.find(p => p.id === id);
  if (!post || !post.published) {
    return <ArticleNotAvailable title="Bài viết chưa được xuất bản" text="Bài viết mang mã này chưa được phê duyệt công khai hoặc đã được lưu trữ nội bộ." />;
  }

  return <ArticleView post={post} />;
}
