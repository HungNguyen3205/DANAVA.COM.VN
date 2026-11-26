// Chụp ảnh toàn trang của các mẫu demo (/demo/<slug>/) làm ảnh thẻ trong kho mẫu → public/assets/mau/<slug>.webp
//   node scripts/mau-thumbs.mjs [url-gốc=http://localhost:3000] [slug ...]
// Cần server đang chạy và Microsoft Edge hoặc Google Chrome. Ảnh rộng 720px (chụp ở khổ 1440, tỉ lệ 0,5), WebP chất lượng 78.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const base = process.argv[2] || 'http://localhost:3000';
const src = readFileSync('lib/web-templates.ts', 'utf8');
// Mẫu demo có trong mã (lib/web-templates.ts → DEMO_IDS)
const all = JSON.parse(src.match(/DEMO_IDS = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
const slugs = process.argv.slice(3).length ? process.argv.slice(3) : all;
const BROWSER = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 9800 + Math.floor(Math.random() * 100);
const br = spawn(BROWSER, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mau-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let target; for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
mkdirSync('public/assets/mau', { recursive: true });
for (const slug of slugs) {
  await send('Page.navigate', { url: `${base}/demo/${slug}/` });
  for (let i = 0; i < 80; i++) { await sleep(200); if (await ev('document.readyState') === 'complete') break; }
  await sleep(2500);
  // Hiện mọi khối (bỏ hiệu ứng chờ cuộn), số liệu về giá trị cuối, ẩn chỉ báo của chế độ phát triển
  await ev(`(async () => { document.querySelectorAll('[data-rv]').forEach(e => e.classList.add('is-in')); document.querySelectorAll('[data-count]').forEach(e => e.textContent = Number(e.dataset.count).toLocaleString('vi-VN')); document.querySelector('nextjs-portal')?.remove(); const s = document.createElement('style'); s.textContent = '*{transition:none!important}'; document.head.append(s); for (let y = 0; y < document.body.scrollHeight; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 800)); return 1; })()`);
  const h = await ev('document.documentElement.scrollHeight');
  // Chụp vượt khung nhìn nhưng giữ khung 1440×900: các phần cao 100vh không bị phình theo chiều cao cả trang
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: h, scale: 1 } });
  const out = `public/assets/mau/${slug}.webp`;
  await sharp(Buffer.from(shot.result.data, 'base64')).resize({ width: 720 }).webp({ quality: 78 }).toFile(out);
  console.log(`${slug.padEnd(22)} ${h}px → ${out}`);
}
ws.close(); br.kill(); process.exit(0);
