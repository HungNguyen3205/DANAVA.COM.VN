/** Tự dịch khi xuất bản (lib/i18n-auto.ts): chỉ câu vừa đổi, mọi ngôn ngữ, lỗi dịch không chặn xuất bản. Gemini được giả lập. */
import test from 'node:test';
import assert from 'node:assert/strict';

const { initial } = await import('../lib/content.ts');
const { normalizeContent } = await import('../lib/content-defaults.ts');
const { readCms, writeCms, writeTranslation } = await import('../lib/cms-paths.ts');
const { textHash } = await import('../lib/i18n.ts');
const { localizeSite } = await import('../lib/i18n-server.ts');
const { autoTranslateOnPublish } = await import('../lib/i18n-auto.ts');

const base = normalizeContent(structuredClone(initial));
const LEAD = 'rec.services.studio.heroLead';
const realFetch = globalThis.fetch;

/** Gemini giả: dịch mỗi câu thành "[en] câu" / "[ja] câu"; đếm số lần gọi. */
function fakeGemini(fail = false) {
  let calls = 0;
  globalThis.fetch = (async (url: string, init?: { body?: string }) => {
    calls++;
    if (fail) return new Response('{}', { status: 500 });
    const prompt = JSON.parse(init!.body!).contents[0].parts[0].text as string;
    const loc = /into 日本語/.test(prompt) ? 'ja' : 'en';
    const batch = JSON.parse(prompt.slice(prompt.lastIndexOf('\n{') + 1)) as Record<string, string>;
    const out = Object.fromEntries(Object.entries(batch).map(([k, v]) => [k, `[${loc}] ${v}`]));
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(out) }] } }] }), { status: 200 });
  }) as typeof fetch;
  return () => calls;
}

test.afterEach(() => { globalThis.fetch = realFetch; delete process.env.GEMINI_API_KEY; });

test('không đổi chữ tiếng Việt → không gọi dịch máy', async () => {
  process.env.GEMINI_API_KEY = 'test';
  const calls = fakeGemini();
  const r = await autoTranslateOnPublish(base, base);
  assert.equal(r.done, 0);
  assert.equal(calls(), 0);
});

test('đổi câu đã có bản dịch → dịch lại sang mọi ngôn ngữ, website hiện bản dịch mới', async () => {
  process.env.GEMINI_API_KEY = 'test';
  fakeGemini();
  const next = writeCms(base, LEAD, 'Câu dẫn mới cho DANAVA Studio.');
  const r = await autoTranslateOnPublish(base, next);
  assert.equal(r.failed, 0);
  assert.ok(r.done >= 2);
  assert.deepEqual(r.data.i18n?.en?.[LEAD], { t: '[en] Câu dẫn mới cho DANAVA Studio.', h: textHash('Câu dẫn mới cho DANAVA Studio.') });
  assert.equal(r.data.i18n?.ja?.[LEAD]?.t, '[ja] Câu dẫn mới cho DANAVA Studio.');
  assert.equal(readCms(localizeSite(r.data, 'en'), LEAD), '[en] Câu dẫn mới cho DANAVA Studio.');
});

test('chữ cố định vừa sửa (txt.*) cũng được dịch lại', async () => {
  process.env.GEMINI_API_KEY = 'test';
  fakeGemini();
  const next = writeCms(base, 'txt.home.why.title', 'Tiêu đề mới');
  const r = await autoTranslateOnPublish(base, next);
  assert.equal(r.data.i18n?.en?.['txt.home.why.title']?.t, '[en] Tiêu đề mới');
});

test('thiếu GEMINI_API_KEY hoặc dịch máy lỗi → vẫn xuất bản, câu đó tạm hiện tiếng Việt', async () => {
  const next = writeCms(base, LEAD, 'Một câu khác.');
  const noKey = await autoTranslateOnPublish(base, next);
  assert.equal(noKey.noKey, true);
  assert.ok(noKey.failed >= 2);
  assert.equal(readCms(localizeSite(noKey.data, 'en'), LEAD), 'Một câu khác.', 'không hiện bản dịch cũ sai nghĩa');
  process.env.GEMINI_API_KEY = 'test';
  fakeGemini(true);
  const broken = await autoTranslateOnPublish(base, next);
  assert.equal(broken.done, 0);
  assert.equal(readCms(localizeSite(broken.data, 'ja'), LEAD), 'Một câu khác.');
});

test('giữ bản dịch đang công khai mà bản gửi lên thiếu', async () => {
  const vi = readCms(base, 'rec.services.studio.title');
  const published = writeTranslation(base, 'en', 'rec.services.studio.title', 'Studio Suite', vi);
  const r = await autoTranslateOnPublish(published, base);
  assert.equal(r.data.i18n?.en?.['rec.services.studio.title']?.t, 'Studio Suite');
});

test('đổi tiêu đề / mô tả SEO của trang hoặc bài → bản /en/, /ja/ được dịch lại ngay khi xuất bản', async () => {
  process.env.GEMINI_API_KEY = 'test';
  fakeGemini();
  const { metaKey, fresh } = await import('../lib/i18n.ts');
  // Trang cố định (SEO từng trang)
  const next = { ...base, pageSeo: { '/du-an/': { title: 'Dự án tiêu biểu của DANAVA', description: 'Mô tả  mới\ncho trang dự án.' } } };
  const r = await autoTranslateOnPublish(base, next);
  assert.equal(r.data.i18n?.en?.[metaKey('/du-an/', 'title')]?.t, '[en] Dự án tiêu biểu của DANAVA');
  // Mô tả được chuẩn hoá khoảng trắng như seo() → mã băm khớp câu đang hiển thị
  assert.ok(fresh(r.data.i18n?.ja?.[metaKey('/du-an/', 'desc')], 'Mô tả mới cho trang dự án.'));
  // Bài viết: đổi tiêu đề SEO
  const post = base.posts.find(p => p.published)!;
  const next2 = { ...base, posts: base.posts.map(p => (p.id === post.id ? { ...p, seoTitle: 'Tiêu đề SEO mới cho bài' } : p)) };
  const r2 = await autoTranslateOnPublish(base, next2);
  assert.equal(r2.data.i18n?.en?.[metaKey(`/blogs/${post.slug}/`, 'title')]?.t, '[en] Tiêu đề SEO mới cho bài');
});
