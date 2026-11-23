import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { initial, validateContent } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { HUDI_WEBSITE_SHOWCASE } from '../lib/showcase-seeds.ts';
import { showcaseFor, splitFeatured, showcaseCaseStudies, sortServices } from '../lib/site-queries.ts';
import { legacyRedirects } from '../lib/legacy-redirects.ts';
import { resolveValidService } from '../lib/contact-services.ts';

const norm = () => normalizeContent(structuredClone(initial));

test('dữ liệu production cũ được bổ sung Tổ chức sự kiện, portfolio và tên Marketing mới', () => {
  const legacy = structuredClone(initial);
  legacy.services = legacy.services.filter(s => s.id !== 'events');
  const oldMarketing = legacy.services.find(s => s.id === 'marketing')!;
  oldMarketing.title = 'Digital Marketing';
  oldMarketing.seoTitle = 'Digital Marketing cho doanh nghiệp dịch vụ';
  delete legacy.showcase;
  assert.equal(validateContent(legacy), true);
  const n = normalizeContent(legacy);
  assert.equal(validateContent(n), true);
  assert.equal(n.services.find(s => s.slug === 'su-kien-truyen-thong')?.title, 'Tổ chức sự kiện');
  const marketing = n.services.find(s => s.slug === 'digital-marketing');
  assert.equal(marketing?.title, 'Marketing & Truyền thông');
  assert.equal(marketing?.seoTitle, 'Marketing & Truyền thông cho doanh nghiệp dịch vụ');
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

test('thư viện đã lưu nhận dự án HUDI và giữ chỉnh sửa của quản trị viên', () => {
  const legacy = norm();
  legacy.showcase = legacy.showcase!.filter(item => item.id !== HUDI_WEBSITE_SHOWCASE.id);

  const updated = normalizeContent(legacy);
  const hudi = splitFeatured(showcaseFor(updated, 'website')).rest.find(item => item.slug === 'hudi-sofa-website');
  assert.equal(hudi?.url, 'https://hudisofa.com/');
  assert.ok(fs.existsSync('public' + hudi.image), hudi.image);

  hudi.published = false;
  assert.equal(normalizeContent(updated).showcase!.find(item => item.id === hudi.id)?.published, false);
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

test('chương trình sự kiện chỉ gắn phạm vi khi có dữ liệu; Digital Marketing có trang riêng', () => {
  const n = norm();
  const ev = showcaseFor(n, 'events');
  assert.ok(ev.filter(x => x.scope.length).length >= 3);
  assert.ok(ev.some(x => !x.scope.length), 'chương trình chưa rõ phạm vi vẫn được giữ, chỉ hiện như hình ảnh');
  assert.equal(showcaseFor(n, 'marketing').length, 0);
  assert.ok(!fs.existsSync('components/site/MarketingStage.tsx'));
  assert.ok(fs.existsSync('components/site/MarketingPage.tsx'), 'Trang Digital Marketing được khôi phục (20/11/2026)');
});

test('URL truyền thông/media cũ chuyển tới trang Sự kiện & Truyền thông, không có chuỗi chuyển hướng', () => {
  const map = new Map(legacyRedirects.map(r => [r.source, r.destination]));
  assert.equal(map.get('/media/'), '/giai-phap/su-kien-truyen-thong/');
  assert.equal(map.get('/truyen-thong/'), '/giai-phap/su-kien-truyen-thong/');
  assert.equal(map.get('/digital-marketing/'), '/giai-phap/digital-marketing/', 'URL marketing cũ về trang Digital Marketing');
  for (const d of map.values()) assert.ok(!map.has(d));
  assert.equal(resolveValidService('su-kien-truyen-thong'), 'Tổ chức sự kiện');
});

test('hiệu ứng mới có nhánh giảm chuyển động', () => {
  const css = fs.readFileSync('app/(site)/site-identity.css', 'utf8');
  assert.ok(css.includes('prefers-reduced-motion: no-preference'));
  assert.ok(!css.includes('scroll-snap-type: y'), 'không ép cuộn từng cảnh');
  const sc = fs.readFileSync('components/site/showcase.tsx', 'utf8');
  assert.ok(sc.includes('media="(prefers-reduced-motion: reduce)"'), 'ảnh động có ảnh tĩnh thay thế');
});

test('4 dự án đã gỡ không hiện kể cả khi database đã lưu chúng', async () => {
  const { REMOVED_SHOWCASE_IDS } = await import('../lib/content-defaults.ts');
  const saved = structuredClone(initial);
  saved.showcase = [
    ...normalizeContent(structuredClone(initial)).showcase!,
    { ...normalizeContent(structuredClone(initial)).showcase![1], id: 'web-omachi', slug: 'omachi', name: 'Omachi' }
  ];
  const n = normalizeContent(saved);
  assert.ok(!n.showcase!.some(x => REMOVED_SHOWCASE_IDS.includes(x.id)));
  const names = showcaseFor(norm(), 'website').map(x => x.name);
  for (const bad of ['Bước Chạy Nhịp Sống', 'Omachi', 'AURUM', 'DriveRent']) assert.ok(!names.includes(bad), bad);
});

test('Digital Marketing khôi phục: giải pháp và trang riêng; chủ đề và bài viết marketing cũ vẫn gỡ', () => {
  const saved = structuredClone(initial) as typeof initial;
  saved.posts[0].topicId = 'marketing';
  assert.equal(validateContent(saved), true);
  const n = normalizeContent(saved);
  const mk = n.services.find(s => s.id === 'marketing');
  assert.ok(mk && mk.slug === 'digital-marketing' && (mk.faqs || []).length > 0, 'giải pháp có nội dung mặc định');
  assert.ok(!(n.topics || []).some(t => t.id === 'marketing'));
  assert.equal(n.posts[0].topicId, 'luu-tru');
  assert.ok(!/marketing/i.test(n.heroTitle || ''));
  const config = fs.readFileSync('next.config.ts', 'utf8');
  assert.ok(!config.includes("source: '/giai-phap/digital-marketing/"), 'không còn chuyển hướng trang giải pháp');
});

test('bài viết digital marketing cũ vẫn gỡ, URL cũ chuyển về /blogs/', () => {
  const n = norm();
  assert.equal(validateContent(n), true);
  for (const id of ['marketing', 'wp-13086', 'wp-12101', 'wp-11869', 'wp-11219']) assert.ok(!n.posts.some(p => p.id === id), id);
  const saved = structuredClone(initial);
  saved.presentation = { ...saved.presentation!, ecosystem: [...saved.presentation!.ecosystem, { id: 'digital', name: 'DANAVA DIGITAL', description: 'Marketing tổng thể cho doanh nghiệp', features: '', visible: true }] };
  const n2 = normalizeContent(saved);
  assert.ok(!n2.presentation!.ecosystem.some(x => x.id === 'digital'));
  const legacy = legacyRedirects.find(r => r.source === '/digital-marketing-la-gi-tim-hieu-tat-ca-cac-hinh-thuc/');
  assert.equal(legacy?.destination, '/blogs/');
  const config = fs.readFileSync('next.config.ts', 'utf8');
  for (const slug of ['digital-marketing', 'digital-marketing-la-gi-tim-hieu-tat-ca-cac-hinh-thuc', 'top-10-website-tai-anh-chat-luong-cao-mien-phi']) assert.ok(config.includes(`'${slug}'`), slug);
});
