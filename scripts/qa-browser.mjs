// Kiểm thử trình duyệt trên server production thật (cần `npm run build`): node scripts/qa-browser.mjs [thư-mục-kết-quả]
// Microsoft Edge headless (Chromium) qua DevTools Protocol. Mô phỏng điện thoại = Emulation (không phải Safari/điện thoại thật).
// Database SQLite tạm, khóa AI để trống (ANNA ở chế độ dự phòng) — không đụng dữ liệu thật.
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const OUT = resolve(process.argv[2] || 'docs/qa/evidence');
const SHOTS = join(OUT, 'screens');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', '/usr/bin/microsoft-edge', '/usr/bin/google-chrome'].find(existsSync);
const directory = await mkdtemp(join(tmpdir(), 'danava-qab-'));
const salt = randomBytes(16).toString('hex'), password = randomBytes(18).toString('hex');
const hash = salt + ':' + scryptSync(password, salt, 64).toString('hex');
const PORT = 4188, base = `http://localhost:${PORT}`;
const results = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let server, edge;

function record(module, scenario, expected, ok, actual, evidence = '') {
  results.push({ module, scenario, expected, actual: String(actual).slice(0, 500), status: ok ? 'PASS' : 'FAIL', evidence });
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${module}] ${scenario} — ${String(actual).slice(0, 180)}`);
}

async function startServer() {
  server = spawn(process.execPath, ['server.cjs'], { env: { ...process.env, DANAVA_DB_HOST: '', ANTHROPIC_API_KEY: '', GEMINI_API_KEY: '', DANAVA_DATA_DIR: directory, DANAVA_HOSTNAME: '127.0.0.1', PORT: String(PORT), DANAVA_ADMIN_PASSWORD_HASH: hash, SITE_URL: base }, stdio: 'ignore' });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/admin/session/', { signal: AbortSignal.timeout(1000) })).ok) return; } catch {} await sleep(250); }
  throw Error('server not ready');
}

/* ---------- CDP ---------- */
let ws, id = 0;
const waiting = new Map(), events = [];
async function startBrowser() {
  const port = 9400 + Math.floor(Math.random() * 400);
  edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'qab-edge-'))}`, 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {} await sleep(200); }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } else if (m.method) events.push(m); });
  for (const d of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable']) await send(d);
}
const send = (method, params = {}) => new Promise(r => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw Error(r.result.exceptionDetails.exception?.description?.slice(0, 200) || 'eval error'); return r.result?.result?.value; };
const size = (w, h = 900) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
async function go(url, settle = 1500) {
  events.length = 0;
  await send('Page.navigate', { url: url.startsWith('http') ? url : base + url });
  for (let i = 0; i < 120; i++) { await sleep(150); try { if (await ev('document.readyState') === 'complete') break; } catch {} }
  await sleep(settle);
}
async function shot(name, full = false) {
  await mkdir(SHOTS, { recursive: true });
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72, captureBeyondViewport: full });
  await writeFile(join(SHOTS, name + '.jpg'), Buffer.from(r.result.data, 'base64'));
  return `screens/${name}.jpg`;
}
/** Lỗi console / ngoại lệ / request lỗi kể từ lần go() gần nhất. */
function pageProblems() {
  const out = [];
  const failedIds = new Set();
  for (const m of events) {
    if (m.method === 'Runtime.exceptionThrown') out.push('JS: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') out.push('console: ' + m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 160));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) out.push('log: ' + m.params.entry.text.slice(0, 160) + ' ' + (m.params.entry.url || ''));
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && !/\/api\/analytics/.test(m.params.response.url)) out.push(`HTTP ${m.params.response.status} ${m.params.response.url.replace(base, '')}`);
    if (m.method === 'Network.loadingFailed' && !m.params.canceled && m.params.errorText !== 'net::ERR_ABORTED') failedIds.add(m.params.requestId + ' ' + m.params.errorText);
  }
  for (const f of failedIds) out.push('net: ' + f);
  return [...new Set(out)];
}

try {
  if (!EDGE) throw Error('Không tìm thấy Microsoft Edge / Chrome để chạy kiểm thử trình duyệt');
  await startServer();
  await startBrowser();

  /* ===== 0. Mô hình 3D + Mã QR (chạy đầu tiên: trình duyệt không GPU hết ngữ cảnh WebGL sau ~100 lần tải trang) ===== */
  await size(1440);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await go('/', 2500);
  const qr = await ev(`(async()=>{let b;for(let i=0;i<40&&!(b=document.querySelector('.hb-office__qrbtn'));i++)await new Promise(r=>setTimeout(r,500));if(!b)return 'không có nút QR: '+document.querySelector('.hb-office').className;b.click();await new Promise(r=>setTimeout(r,2500));return document.querySelector('.hb-office').className})()`);
  record('Tương tác/3D', 'Mô hình 3D dựng xong và bấm "Mã QR Zalo" đổi sang bảng mã', 'Lớp is-ready + is-qr', /is-ready/.test(qr) && /is-qr/.test(qr), qr, await shot('home-3d-qr'));
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await go('/', 4000);
  const built = await ev(`(async()=>{const pin=document.querySelector('.hb-pin');const end=pin?pin.offsetTop+pin.offsetHeight-innerHeight:1200;for(let y=0;y<=end+200;y+=100){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}await new Promise(r=>setTimeout(r,1500));return document.querySelector('.hb-cover__3d').className+' | '+document.querySelector('.hb-office').className})()`);
  record('Tương tác/3D', 'Có chuyển động: cuộn qua vùng ghim dựng văn phòng 3D', 'Mô hình sẵn sàng (is-ready), không lỗi JS', /is-ready/.test(built) && !pageProblems().some(p => p.startsWith('JS')), built, await shot('home-3d-scroll-built'));

  /* ===== 1. Mọi URL công khai ở 390px và 1440px ===== */
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  const urls = [...new Set(['/', ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname), '/trang-khong-ton-tai-qa/'])];
  for (const w of [1440, 390]) {
    await size(w, w < 700 ? 844 : 900);
    const issues = [];
    for (const u of urls) {
      await go(u, 900);
      const probe = await ev(`(()=>{const sw=document.documentElement.scrollWidth;const broken=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getAttribute('src')&&!i.closest('[hidden]')&&getComputedStyle(i).display!=='none'&&i.loading!=='lazy').map(i=>i.getAttribute('src'));const css=[...document.styleSheets].map(s=>s.href||'').filter(Boolean);return {overflow:sw>innerWidth+1?sw-innerWidth:0,broken,editor:!!document.querySelector('[data-cms-ui]')||performance.getEntriesByType('resource').some(r=>/cms-editor/.test(r.name)),adminCss:[...document.querySelectorAll('.ax-scope')].length>0}})()`);
      const probs = pageProblems().filter(p => !(u === '/trang-khong-ton-tai-qa/' && /404/.test(p) && /trang-khong-ton-tai-qa/.test(p)));
      if (probe.overflow) probs.push(`tràn ngang ${probe.overflow}px`);
      if (probe.broken.length) probs.push('ảnh hỏng: ' + probe.broken.slice(0, 3).join(', '));
      if (probe.editor) probs.push('tải trình chỉnh trên trang công khai');
      if (probe.adminCss) probs.push('giao diện admin trên trang công khai');
      if (probs.length) issues.push(`${u}: ${probs.join('; ')}`);
    }
    await writeFile(join(OUT, `browser-public-${w}.txt`), (issues.join('\n') || 'Không có vấn đề') + '\n');
    record('Website công khai', `${urls.length} URL ở ${w}px: không lỗi JS/console, không request lỗi, không ảnh hỏng, không tràn ngang, không tải trình chỉnh/CSS admin`, 'Không có vấn đề', issues.length === 0, issues.length ? `${issues.length} trang có vấn đề: ` + issues.slice(0, 6).join(' | ') : 'OK', `browser-public-${w}.txt`);
  }

  /* ===== 2. Ảnh chụp trang đại diện ở 5 khổ ===== */
  const reps = ['/', '/giai-phap/', '/giai-phap/danava-studio/', '/dich-vu/', '/blogs/', '/du-an/', '/lien-he/', '/tuyen-dung/', '/he-sinh-thai/', '/trang-khong-ton-tai-qa/'];
  for (const w of [360, 390, 768, 1024, 1440]) {
    await size(w, w < 700 ? 800 : 900);
    for (const u of reps) { await go(u, 1200); await shot(`public-${w}-${u.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'home'}`); }
  }
  record('Website công khai/Responsive', `Chụp ${reps.length} trang đại diện ở 360/390/768/1024/1440px`, 'Có ảnh để rà soát', true, `${reps.length * 5} ảnh trong screens/public-*`, 'screens/');

  /* ===== 3. Bàn phím & giảm chuyển động ===== */
  await size(1440);
  await go('/', 1500);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await sleep(200);
  const skip = await ev(`(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();const cs=getComputedStyle(a);return {text:a.textContent.trim(),href:a.getAttribute('href'),visible:r.width>0&&r.top>=0&&r.top<innerHeight,outline:cs.outlineStyle!=='none'||cs.boxShadow!=='none'}})()`);
  const skipShot = await shot('keyboard-skip-link');
  record('Website/Bàn phím', 'Phím Tab đầu tiên tới liên kết "Đến nội dung chính", hiện rõ', 'Liên kết #main, hiển thị trên màn hình', skip.href === '#main' && skip.visible, JSON.stringify(skip), skipShot);
  const labels = await ev(`(async()=>{location.href='/lien-he/';await new Promise(r=>setTimeout(r,2500));return 'pending'})()`).catch(() => 'nav');
  await go('/lien-he/', 1500);
  const unlabeled = await ev(`[...document.querySelectorAll('main input:not([type=hidden]):not([tabindex="-1"]), main select, main textarea')].filter(i=>!(i.labels&&i.labels.length)&&!i.getAttribute('aria-label')&&!i.getAttribute('aria-labelledby')).map(i=>i.id||i.name)`);
  record('Website/Truy cập', 'Mọi ô nhập của biểu mẫu Liên hệ có nhãn', '0 ô thiếu nhãn', unlabeled.length === 0, unlabeled.length ? 'Thiếu nhãn: ' + unlabeled.join(', ') : 'OK (' + labels + ')');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await go('/', 2500);
  const reduced = await ev(`(()=>{const o=document.querySelector('.hb-office');return {office:o&&o.className,canvas:!!document.querySelector('.hb-office__canvas'),fallback:!!document.querySelector('.hb-office__fallback')}})()`);
  record('Tương tác/3D', 'Giảm chuyển động: mô hình 3D vẫn hiển thị (khung tĩnh), không lỗi', 'Có canvas hoặc ảnh dự phòng, không lỗi JS', (reduced.canvas || reduced.fallback) && !pageProblems().some(p => p.startsWith('JS')), JSON.stringify(reduced), await shot('home-reduced-motion'));

  /* ===== 4. ANNA khi dịch vụ AI chưa sẵn sàng (giao diện) ===== */
  const anna = await ev(`(async()=>{const r=await fetch('/api/anna/');return JSON.stringify(await r.json())})()`);
  record('Tương tác/ANNA', 'Không có khóa AI: API báo chưa sẵn sàng (giao diện dùng báo giá nhanh)', 'ready=false', /"ready":false/.test(anna), anna);

  /* ===== 5. Biểu mẫu Liên hệ: mạng chậm + bấm gửi 2 lần ===== */
  await size(390, 844);
  await go('/lien-he/', 1500);
  await send('Network.emulateNetworkConditions', { offline: false, latency: 1500, downloadThroughput: 50_000, uploadThroughput: 50_000 });
  const phone = '09' + String(Date.now()).slice(-8);
  await ev(`(()=>{const set=(id,v)=>{const el=document.getElementById(id);const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};set('contact-name','Phạm Thị Thu Hà');set('contact-phone','${phone}');set('contact-message','Cần tư vấn phần mềm cho phòng Pilates 200 hội viên — thử nghiệm QA');return 1})()`);
  await sleep(300);
  await ev(`(()=>{const b=document.querySelector('.c-submit');b.click();b.click();return b.disabled})()`);
  const sending = await ev(`document.querySelector('.c-submit').disabled`);
  const sendingShot = await shot('contact-sending-slow-network');
  await ev(`(async()=>{for(let i=0;i<100&&!/Cảm ơn/.test(document.body.innerText);i++)await new Promise(r=>setTimeout(r,250));return 1})()`);
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const feedback = await ev(`document.body.innerText.match(/Cảm ơn[^\\n]*/)?.[0]||''`);
  const doneShot = await shot('contact-sent');
  // Đếm số yêu cầu đã lưu bằng tài khoản chủ website
  const login = await fetch(base + '/api/admin/session/', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: base }, body: JSON.stringify({ password }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const leads = (await (await fetch(base + '/api/admin/leads/', { headers: { cookie } })).json()).leads.filter(l => l.phone === phone);
  record('Khách hàng/Biểu mẫu', 'Mạng chậm (1,5 s trễ): nút gửi bị khóa khi đang gửi; bấm 2 lần chỉ tạo 1 yêu cầu', 'Nút disabled, 1 bản ghi, có thông báo thành công', sending === true && leads.length === 1 && /Cảm ơn/.test(feedback), `disabled=${sending}, bản ghi=${leads.length}, phản hồi="${feedback.slice(0, 80)}"`, `${sendingShot}, ${doneShot}`);
  await go('/lien-he/', 1200);
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await ev(`(()=>{const set=(id,v)=>{const el=document.getElementById(id);const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};set('contact-name','Đỗ Minh Khoa');set('contact-phone','0912000999');set('contact-message','Mất mạng khi gửi — thử nghiệm QA');document.querySelector('.c-submit').click();return 1})()`);
  await sleep(1500);
  const offline = await ev(`({text:document.querySelector('main').innerText.match(/Không có kết nối[^\\n]*/)?.[0]||'',kept:document.getElementById('contact-message').value})`);
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  record('Khách hàng/Biểu mẫu', 'Mất mạng khi gửi: báo lỗi rõ, giữ nội dung đang nhập', 'Thông báo mất kết nối + nội dung còn nguyên', !!offline.text && offline.kept.includes('Mất mạng'), JSON.stringify(offline), await shot('contact-offline'));

  /* ===== 6. Admin: cảnh báo rời trang khi chưa lưu ===== */
  await size(1440);
  await go('/admin/', 800);
  await ev(`fetch('/api/admin/session/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'${password}'})}).then(r=>r.status)`);
  await go('/admin/cai-dat/', 2500);
  // Gõ thật (chuột + bàn phím) để trình duyệt ghi nhận thao tác người dùng — điều kiện để hiện hộp beforeunload
  const box = await ev(`(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.value.includes('@'));const r=i.getBoundingClientRect();return {x:r.left+r.width-8,y:r.top+r.height/2}})()`);
  for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await send('Input.insertText', { text: '.qa' });
  await sleep(400);
  const dirtyShot = await shot('admin-unsaved-bar');
  // Chuyển mục trong admin → hộp xác nhận
  await ev(`[...document.querySelectorAll('.ax-side a')].find(a=>a.textContent.includes('Tổng quan')).click()`);
  const confirmText = await ev(`(async()=>{for(let i=0;i<20;i++){const d=document.querySelector('.ax-dialog');if(d&&d.innerText.trim())return d.innerText;await new Promise(r=>setTimeout(r,150))}return ''})()`);
  await sleep(400);
  record('Hệ thống/Cảnh báo chưa lưu', 'Sửa Cài đặt rồi chuyển mục trong admin', 'Hộp xác nhận "Rời màn hình này?"', /Rời màn hình/.test(confirmText), confirmText.slice(0, 100), `${dirtyShot}, ${await shot('admin-leave-confirm')}`);
  await ev(`[...document.querySelectorAll('.ax-dialog button')].find(b=>/Ở lại|Hủy/.test(b.textContent))?.click()`);
  await sleep(400);
  // Tải lại trình duyệt → beforeunload
  events.length = 0;
  send('Page.navigate', { url: base + '/' });
  await sleep(1500);
  const dlg = events.find(e => e.method === 'Page.javascriptDialogOpening');
  if (dlg) await send('Page.handleJavaScriptDialog', { accept: false });
  record('Hệ thống/Cảnh báo chưa lưu', 'Rời trang (đổi địa chỉ) khi còn thay đổi chưa lưu', 'Trình duyệt hỏi beforeunload', !!dlg && dlg.params.type === 'beforeunload', dlg ? dlg.params.type : 'không có hộp thoại (headless có thể bỏ qua khi chưa có thao tác người dùng thật)');
} catch (e) {
  record('Khung kiểm thử', 'Chạy kiểm thử trình duyệt', 'Không lỗi', false, String(e?.stack || e));
} finally {
  try { ws?.close(); } catch {}
  edge?.kill();
  server?.kill();
  await sleep(500);
  await rm(directory, { recursive: true, force: true }).catch(() => {});
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, 'browser-results.json'), JSON.stringify(results, null, 1));
  const fail = results.filter(r => r.status !== 'PASS').length;
  console.log(`\nTỔNG: ${results.length} trường hợp, PASS ${results.length - fail}, FAIL ${fail}`);
  process.exit(fail ? 1 : 0);
}
