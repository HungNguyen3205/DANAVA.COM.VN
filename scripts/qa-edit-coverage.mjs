// Đếm chữ đang hiển thị trên website mà CHƯA chỉnh được trong trình biên tập (chưa có data-cms…).
//   node scripts/qa-edit-coverage.mjs [url-gốc=http://127.0.0.1:4190] [trang,trang…]
// Cần server đang chạy (bản build) và Microsoft Edge. Kết quả: docs/qa/evidence/edit-coverage.json
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4190';
const pages = (process.argv[3] || '/,/ve-danava/,/giai-phap/,/giai-phap/danava-studio/,/giai-phap/thiet-ke-website/,/dich-vu/,/dich-vu/truyen-thong/,/he-sinh-thai/,/du-an/,/blogs/,/blogs/cong-nang-luong/,/lien-he/,/doi-ngu/,/doi-tac/,/tuyen-dung/,/chinh-sach-rieng-tu/,/chinh-sach-dich-vu/').split(',');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 9800 + Math.floor(Math.random() * 100);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cov-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let target; for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

// Chữ "chưa chỉnh được": nút chữ hiển thị, không nằm trong vùng có khóa, không thuộc phần trang trí/ẩn/3D/biểu mẫu nhập
const PROBE = `(() => {
  const covered = '[data-cms],[data-cms-link],[data-cms-skip],[aria-hidden="true"],.s-sr,script,style,noscript,svg,select,option,textarea,input,label,[role=dialog],.an-dock,.an-launch,.s-mobilebar,.s-dock,.consent-banner,.s-mega';
  const out = [];
  const w = document.createTreeWalker(document.querySelector('main') ? document.body : document.body, NodeFilter.SHOW_TEXT);
  let n; let total = 0;
  while ((n = w.nextNode())) {
    const t = n.textContent.replace(/\\s+/g, ' ').trim();
    if (t.length < 2 || /^[\\d\\s.,:%+·–—/|()-]+$/.test(t)) continue;
    const el = n.parentElement;
    if (!el || el.closest(covered)) { if (el && el.closest('[data-cms],[data-cms-link]')) total++; continue; }
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    total++;
    out.push((el.closest('section,header,footer,nav,main')?.className || el.tagName).toString().split(' ')[0] + ' › ' + t.slice(0, 70));
  }
  return { total, missing: out.length, samples: out };
})()`;
const report = {};
for (const p of pages) {
  await send('Page.navigate', { url: base + p });
  for (let i = 0; i < 80; i++) { await sleep(150); if (await ev('document.readyState') === 'complete') break; }
  await sleep(1200);
  const r = await ev(PROBE);
  report[p] = r;
  console.log(`${p.padEnd(32)} ${String(r.total - r.missing).padStart(4)}/${String(r.total).padEnd(4)} chỉnh được · còn ${r.missing}${r.missing ? ' — ' + r.samples.slice(0, 4).join(' | ') : ''}`);
}
mkdirSync('docs/qa/evidence', { recursive: true });
writeFileSync('docs/qa/evidence/edit-coverage.json', JSON.stringify(report, null, 1));
ws.close(); edge.kill(); process.exit(0);
