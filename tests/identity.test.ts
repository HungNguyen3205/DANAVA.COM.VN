import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { showcaseFor, splitFeatured, showcaseCaseStudies, sortServices } from '../lib/site-queries.ts';
import { legacyRedirects } from '../lib/legacy-redirects.ts';
import { resolveValidService } from '../lib/contact-services.ts';

const norm = () => normalizeContent(structuredClone(initial));

test('dữ liệu production cũ (5 giải pháp, chưa có showcase) được bổ sung Sự kiện & Truyền thông và portfolio', () => {
  const legacy = structuredClone(initial);
  legacy.services = legacy.services.filter(s => s.id !== 'events');
  delete legacy.showcase;
  assert.equal(validateContent(legacy), true);
  const n = normalizeContent(legacy);
  assert.equal(validateContent(n), true);
  assert.ok(n.services.some(s => s.id === 'events' && s.slug === 'su-kien-truyen-thong'));
  assert.deepEqual(sortServices(n.services).map(s => s.id), ['studio', 'website', 'marketing', 'events', 'travel', 'community']);
  assert.ok((n.showcase || []).length > 10);
});

test('Vinhomes Hải Vân Bay là dự án website nổi bật đầu tiên và không lặp trong thư viện', () => {
  const n = norm();
  const { featured, rest } = splitFeatured(showcaseFor(n, 'website'));
  assert.equal(featured[0].id, 'web-vinhomes-hai-van-bay');
  assert.equal(featured[0].url, 'https://vinhomeshaivanbaydanang.vn');
  assert.ok(featured[0].caseStudy && featured[0].mobileImage && featured[0].motion);
  assert.ok(!rest.some(x => x.id === featured[0].id));
  assert.ok(showcaseCaseStudies(n).some(x => x.slug === 'vinhomes-hai-van-bay-website'));
  // Ảnh lấy từ sản phẩm thật, có ghi nguồn
  for (const src of [featured[0].image, featured[0].mobileImage, featured[0].motion, ...featured[0].gallery.map(g => g.src)]) {
    assert.ok(fs.existsSync('public' + src), src);
  }
  const sources = JSON.parse(fs.readFileSync('public/assets/portfolio/vinhomes/sources.json', 'utf8'));
  assert.equal(sources.source, 'https://vinhomeshaivanbaydanang.vn/');
  // Không tự nhận giải thưởng, số liệu hay quan hệ chủ đầu tư
  const text = JSON.stringify(featured[0]).toLowerCase();
  for (const bad of ['giải thưởng', 'chủ đầu tư chính thức', 'tăng trưởng', '% ']) assert.ok(!text.includes(bad), bad);
  assert.ok(featured[0].disclaimer.includes('không phải chủ đầu tư'));
});

test('admin đổi mục nổi bật và thứ tự thì trang hiển thị theo', () => {
  const n = norm();
  const list = n.showcase!;
  list.find(x => x.id === 'web-vinhomes-hai-van-bay')!.featured = false;
  list.find(x => x.id === 'web-glg')!.featured = true;
  const glg = list.findIndex(x => x.id === 'web-glg'), go = list.findIndex(x => x.id === 'web-danava-go');
  [list[glg], list[go]] = [list[go], list[glg]];
  assert.equal(validateContent(n), true);
  const { featured, rest } = splitFeatured(showcaseFor(n, 'website'));
  assert.equal(featured[0].id, 'web-glg');
  assert.equal(rest[0].id, 'web-vinhomes-hai-van-bay');
});

test('mục showcase: không công khai khi thiếu ảnh, case study cần nội dung, slug không trùng dự án', () => {
  const n = norm();
  const a = structuredClone(n); a.showcase![0] = { ...a.showcase![0], image: '' };
  assert.equal(validateContent(a), false);
  const b = structuredClone(n); b.showcase![1] = { ...b.showcase![1], caseStudy: true, intro: '' };
  assert.equal(validateContent(b), false);
  const c = structuredClone(n); c.showcase![1] = { ...c.showcase![1], slug: 'hariver-gym-danava-studio' };
  assert.equal(validateContent(c), false);
  assert.ok(n.showcase!.filter(x => x.published).every(x => x.image), 'không có khung giữ chỗ trên trang công khai');
});

test('chương trình sự kiện chỉ gắn phạm vi khi có dữ liệu; Digital Marketing không còn chứa chương trình sự kiện', () => {
  const n = norm();
  const ev = showcaseFor(n, 'events');
  assert.ok(ev.filter(x => x.scope.length).length >= 3);
  assert.ok(ev.some(x => !x.scope.length), 'chương trình chưa rõ phạm vi vẫn được giữ, chỉ hiện như hình ảnh');
  assert.equal(showcaseFor(n, 'marketing').length, 0);
  assert.ok(!fs.existsSync('components/site/MarketingStage.tsx'));
  const mk = fs.readFileSync('components/site/MarketingPage.tsx', 'utf8');
  for (const word of ['Chiến lược', 'Sản xuất nội dung', 'Vận hành kênh', 'Quảng cáo', 'Đo lường']) assert.ok(mk.includes(word), word);
});

test('URL truyền thông/media cũ chuyển tới trang Sự kiện & Truyền thông, không có chuỗi chuyển hướng', () => {
  const map = new Map(legacyRedirects.map(r => [r.source, r.destination]));
  assert.equal(map.get('/media/'), '/giai-phap/su-kien-truyen-thong/');
  assert.equal(map.get('/truyen-thong/'), '/giai-phap/su-kien-truyen-thong/');
  assert.equal(map.get('/digital-marketing/'), '/giai-phap/digital-marketing/');
  for (const d of map.values()) assert.ok(!map.has(d));
  assert.equal(resolveValidService('su-kien-truyen-thong'), 'Tổ chức sự kiện, thi công không gian & truyền thông sự kiện');
});

test('hiệu ứng mới có nhánh giảm chuyển động', () => {
  const css = fs.readFileSync('app/(site)/site-identity.css', 'utf8');
  assert.ok(css.includes('prefers-reduced-motion: no-preference'));
  assert.ok(!css.includes('scroll-snap-type: y'), 'không ép cuộn từng cảnh');
  const sc = fs.readFileSync('components/site/showcase.tsx', 'utf8');
  assert.ok(sc.includes('media="(prefers-reduced-motion: reduce)"'), 'ảnh động có ảnh tĩnh thay thế');
});
