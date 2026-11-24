import Form from 'next/form';
import { Search } from 'lucide-react';
import type { SiteData } from '@/lib/content';
import { QUERY_MAX, searchTopics, type BlogFilter } from '@/lib/blog-search';
import { ct } from './cms';

/** Ô tìm kiếm + chọn chủ đề. Là form GET nên kết quả có URL riêng, chia sẻ được. */
export function BlogSearch({ data, filter }: { data: SiteData; filter: BlogFilter }) {
  const topics = searchTopics(data);
  const go = ct(data, 'blog.search.submit', 'Tìm kiếm', 'Chữ nút tìm kiếm');
  return (
    // key: điền lại ô nhập khi URL đổi (xóa bộ lọc, bấm chủ đề khác, nút Back)
    <Form key={`${filter.q}|${filter.topic}`} action="/blogs/" className="bl-search" role="search" aria-label="Tìm bài viết">
      <label className="bl-search__q">
        <span className="s-sr">Từ khóa</span>
        <Search aria-hidden="true" />
        <input type="search" name="q" defaultValue={filter.q} maxLength={QUERY_MAX} placeholder="Tìm theo từ khóa…" autoComplete="off" enterKeyHint="search" />
      </label>
      {topics.length > 0 && (
        <label className="bl-search__topic">
          <span className="s-sr">Chủ đề</span>
          <select name="chu-de" defaultValue={filter.topic}>
            <option value="">Mọi chủ đề</option>
            {topics.map(t => <option key={t.id} value={t.slug}>{t.name} ({t.count})</option>)}
          </select>
        </label>
      )}
      <button type="submit" className="bl-search__go"><span {...go.a}>{go.v}</span></button>
    </Form>
  );
}
