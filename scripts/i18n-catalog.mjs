// Lập danh mục chữ cần dịch (EN / JA) từ website đang chạy: mọi vùng có khóa data-cms trên các trang trong sitemap,
// cùng tiêu đề / mô tả SEO của từng trang. Dùng để tạo bản dịch máy ban đầu (lib/i18n-seed/*.json).
//   node scripts/i18n-catalog.mjs [url-gốc=http://127.0.0.1:4192] [file-ra=.i18n/catalog.json]
// Cần server đang chạy (bản build, dữ liệu mặc định) và Microsoft Edge.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4192';
const out = process.argv[3] || '.i18n/catalog.json';
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 9700 + Math.floor(Math.random() * 100);
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'i18n-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let target; for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const go = async url => { await send('Page.navigate', { url }); for (let i = 0; i < 80; i++) { await sleep(150); if (await ev('document.readyState') === 'complete') break; } await sleep(900); };
await send('Page.enable'); await send('Runtime.enable');
// Ghi lại cả chữ dùng txt() không có data-cms (lib/site-text.ts)
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__danavaTxt = {};' });
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

// Danh sách trang: sitemap (đọc trong trình duyệt)
await go(base + '/sitemap.xml');
const urls = (await ev(`[...document.querySelectorAll('loc')].map(l=>l.textContent)`)) || [];
const paths = [...new Set(['/', ...urls.map(u => new URL(u).pathname)])].filter(p => !/^\/(en|ja)\//.test(p));

// Giống cms-editor.ts → serialize: phần nhấn mạnh trong tiêu đề giữ dạng *chữ*
const PROBE = `(() => {
  const norm = s => s.replace(/\\u00a0/g, ' ').replace(/\\u200b/g, '');
  const ser = el => {
    const rich = el.hasAttribute('data-cms-rich'), ml = el.hasAttribute('data-cms-multiline');
    if (!rich) return norm(ml ? el.innerText : el.textContent || '').replace(/\\n{3,}/g, '\\n\\n').trim();
    let o = '';
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) { o += n.textContent; return; }
      if (!(n instanceof HTMLElement)) return;
      if (n.tagName === 'BR') { o += ml ? '\\n' : ' '; return; }
      const t = (n.textContent || '').replace(/\\*/g, '');
      o += t.trim() ? '*' + t + '*' : t;
    });
    return norm(o).replace(/\\*\\*/g, '').trim();
  };
  const keys = {};
  document.querySelectorAll('[data-cms]').forEach(el => {
    const k = el.dataset.cms; if (keys[k]) return;
    keys[k] = { text: ser(el), def: el.dataset.cmsDefault ?? null, rich: el.hasAttribute('data-cms-rich'), multiline: el.hasAttribute('data-cms-multiline'), label: el.dataset.cmsLabel || '' };
  });
  document.querySelectorAll('[data-cms-link]').forEach(a => {
    const k = a.dataset.cmsLink; if (keys[k]) return;
    const t = a.querySelector('[data-cms-link-text]') || a;
    keys[k] = { text: (t.textContent || '').trim(), def: null, rich: false, multiline: false, label: a.dataset.cmsLabel || 'Nút' };
  });
  return { keys, title: document.title, desc: document.querySelector('meta[name=description]')?.content || '' };
})()`;

const catalog = { keys: {}, meta: {} };
for (const p of paths) {
  await go(base + p);
  // Mở các phần chỉ hiện khi bấm (menu điện thoại, khung ANNA + báo giá, liên hệ nhanh) để ghi lại chữ của chúng
  if (p === '/') await ev(`(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const c = s => document.querySelector(s)?.click(); c('.s-burger'); await w(500); c('.s-burger--close'); c('.an-launch, [class*=an-launch] button, button[aria-haspopup][class*=an]'); await w(800); [...document.querySelectorAll('[role=tab]')].find(b => /báo giá/i.test(b.textContent))?.click(); await w(800); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 1; })()`);
  const r = await ev(PROBE);
  const bare = await ev('window.__danavaTxt || {}');
  for (const [k, def] of Object.entries(bare || {})) { const key = 'txt.' + k; if (!catalog.keys[key] && def) catalog.keys[key] = { text: def, def, rich: false, multiline: false, label: 'Chữ giao diện', pages: [p] }; }
  if (!r) { console.log('bỏ qua', p); continue; }
  catalog.meta[p] = { title: r.title, desc: r.desc };
  for (const [k, v] of Object.entries(r.keys)) {
    if (!v.text && !v.def && k.startsWith('txt.')) continue; // vùng gắn dữ liệu: câu gốc đọc từ nội dung (kể cả đang ẩn)
    const cur = catalog.keys[k];
    if (cur) { if (cur.pages.length < 5) cur.pages.push(p); continue; }
    catalog.keys[k] = { ...v, pages: [p] };
  }
  console.log(`${p.padEnd(48)} ${Object.keys(r.keys).length} vùng`);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(catalog, null, 1));
console.log(`\n${paths.length} trang · ${Object.keys(catalog.keys).length} khóa → ${out}`);
ws.close(); edge.kill(); process.exit(0);
