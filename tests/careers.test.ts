import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, validateContent, type SiteData } from '../lib/content.ts';
import { normalizeContent } from '../lib/content-defaults.ts';
import { block, withBlock } from '../lib/blocks.ts';
import { publicContent } from '../lib/site-queries.ts';
import { buildKnowledge } from '../lib/anna-knowledge.ts';
import { CAREERS, CAREERS_SAMPLE, applicationLead, openJobs, parseApplication, positionsFor, type Job } from '../lib/careers.ts';

const job = (patch: Partial<Job> = {}): Job => ({ ...CAREERS_SAMPLE.jobs[0], id: 'j1', title: 'Vị trí thử', team: 'ky-thuat', tasks: ['Việc thử'], open: true, ...patch });
const withJobs = (...jobs: Job[]) => withBlock(normalizeContent(structuredClone(initial)), 'careers', { ...CAREERS, jobs });

test('tuyển dụng: mặc định không có vị trí nào (không tự bịa tin tuyển)', () => {
  assert.deepEqual(block(structuredClone(initial), 'careers').jobs, []);
});

test('tuyển dụng: lưu ở trường riêng, hợp lệ, giữ qua normalize', () => {
  const d = withJobs(job());
  assert.ok(d.careers);
  assert.ok(!('careers' in (d.extras || {})) && !('careers' in (d.blocks || {})));
  assert.equal(validateContent(d), true);
  assert.equal(validateContent(normalizeContent(d)), true);
});

test('tuyển dụng: chặn tin thiếu nội dung, sai ngày, sai mảng', () => {
  for (const bad of [job({ title: ' ' }), job({ tasks: [] }), job({ team: '' }), job({ team: 'khong-co' }), job({ deadline: '31/12/2026' }), job({ deadline: '2026-02-30' })]) {
    assert.equal(validateContent(withJobs(bad)), false);
  }
  assert.equal(validateContent(withJobs(job({ title: '', tasks: [], open: false }))), true, 'bản nháp được phép dở dang');
});

test('tuyển dụng: ẩn bản nháp và tin quá hạn, hết ngày hạn mới ẩn', () => {
  const list = { ...CAREERS, jobs: [job(), job({ id: 'draft', open: false }), job({ id: 'old', deadline: '2026-11-21' }), job({ id: 'today', deadline: '2026-11-22' })] };
  assert.deepEqual(openJobs(list, '2026-11-22').map(j => j.id), ['j1', 'today']);
});

test('tuyển dụng: bản nháp không gửi xuống trình duyệt và không vào dữ liệu ANNA', () => {
  const d = withJobs(job({ title: 'TIN_DANG_MO' }), job({ id: 'draft', title: 'TIN_NHAP_BI_MAT', open: false }));
  assert.ok(!JSON.stringify(publicContent(d)).includes('TIN_NHAP_BI_MAT'));
  const knowledge = buildKnowledge(d);
  assert.ok(knowledge.includes('TIN_DANG_MO') && !knowledge.includes('TIN_NHAP_BI_MAT'));
});

test('hồ sơ ứng tuyển: kiểm tra từng trường, không nhận vị trí đã đóng', () => {
  const positions = positionsFor([job()]);
  const good = { name: 'Nguyễn An', phone: '0905 123 456', email: 'an@example.com', position: 'job:j1', link: 'https://example.com/cv', intro: '', consent: true };
  assert.ok(parseApplication(good, positions).application);
  assert.ok(parseApplication({ ...good, link: '', intro: 'Mình có ba năm làm thiết kế sản phẩm.' }, positions).application, 'không CV vẫn gửi được khi có giới thiệu');
  for (const [field, value] of [['name', 'A'], ['phone', '123'], ['email', 'sai'], ['position', 'job:da-dong'], ['link', 'javascript:alert(1)'], ['link', ''], ['consent', false]] as const) {
    assert.equal(parseApplication({ ...good, [field]: value }, positions).field, field);
  }
});

test('hồ sơ ứng tuyển: nhận ra được trong danh sách quản trị', () => {
  const positions = positionsFor([]);
  const { application } = parseApplication({ name: 'An', phone: '0905123456', email: 'a@b.vn', position: 'team:van-hanh', link: 'https://example.com/cv', consent: true }, positions);
  const lead = applicationLead(application!);
  assert.match(lead.service, /^Ứng tuyển · Hồ sơ mở: Vận hành$/);
  assert.ok(lead.message.includes('https://example.com/cv'));
});

test('cấu hình bổ sung: khóa của bản build mới hơn không làm bản này lỗi', () => {
  const d = { ...structuredClone(initial), extras: { khoiMaiSau: { a: 1 } } } as unknown as SiteData;
  assert.equal(validateContent(d), true);
  assert.ok(!JSON.stringify(publicContent(normalizeContent(d))).includes('khoiMaiSau'), 'khóa lạ không gửi xuống trình duyệt');
});
