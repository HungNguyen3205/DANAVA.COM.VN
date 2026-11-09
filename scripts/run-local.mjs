// Chạy website DANAVA trên máy cá nhân chỉ với một lệnh:
//   node scripts/run-local.mjs            → chế độ phát triển (sửa code thấy ngay)
//   node scripts/run-local.mjs --prod     → build và chạy bản hoàn thiện (giống server thật)
//   thêm --port 4000 để đổi cổng, --no-open để không tự mở trình duyệt.
// Lần đầu: tự cài thư viện, tự tạo .env và hỏi mật khẩu quản trị (gõ ẩn, chỉ lưu bản băm).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { createInterface } from 'node:readline';
import { randomBytes, scryptSync } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const args = process.argv.slice(2);
const prod = args.includes('--prod');
const openBrowser = !args.includes('--no-open');
const portArg = args.indexOf('--port');
const preferredPort = Number(portArg >= 0 ? args[portArg + 1] : prod ? 3100 : 3123);

const say = msg => console.log(`\x1b[36m[DANAVA]\x1b[0m ${msg}`);
const fail = msg => { console.error(`\x1b[31m[DANAVA] ${msg}\x1b[0m`); process.exit(1); };

/* 1. Phiên bản Node */
const major = Number(process.versions.node.split('.')[0]);
if (major < 24) fail(`Cần Node.js 24 trở lên (máy đang có ${process.version}). Tải tại https://nodejs.org/`);

/* 2. Thư viện */
function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit', shell: process.platform === 'win32', ...options });
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${command} ${commandArgs.join(' ')} thoát với mã ${code}`))));
  });
}
if (!existsSync('node_modules/next/package.json')) {
  say('Đang cài thư viện lần đầu (npm ci), mất khoảng 1 phút...');
  await run('npm', ['ci', '--no-audit', '--no-fund']);
}

/* 3. File .env */
async function readEnv() {
  if (!existsSync('.env')) return {};
  const env = {};
  for (const line of (await readFile('.env', 'utf8')).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function askHidden(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = text => { if (!muted) rl.output.write(text); else if (text.includes('\n')) rl.output.write('\n'); };
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
    muted = true;
  });
}

async function setupAdminPassword() {
  if (!process.stdin.isTTY) {
    say('Chưa có mật khẩu quản trị. Chạy lại trong cửa sổ terminal để đặt mật khẩu, hoặc dùng scripts/admin-password.mjs.');
    return '';
  }
  console.log('');
  say('Đặt mật khẩu cho trang quản trị /admin/ (tối thiểu 12 ký tự, gõ sẽ không hiện ra).');
  for (;;) {
    const first = await askHidden('  Mật khẩu: ');
    if (first.length < 12) { console.log('  → Cần ít nhất 12 ký tự, thử lại.'); continue; }
    const second = await askHidden('  Nhập lại: ');
    if (first !== second) { console.log('  → Hai lần nhập không khớp, thử lại.'); continue; }
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(first, salt, 64).toString('hex')}`;
  }
}

const env = await readEnv();
let envChanged = false;
if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.DANAVA_ADMIN_PASSWORD_HASH || '')) {
  const hash = await setupAdminPassword();
  if (hash) { env.DANAVA_ADMIN_PASSWORD_HASH = hash; envChanged = true; }
}
if (!env.DANAVA_DATA_DIR || env.DANAVA_DATA_DIR.startsWith('/absolute/')) { env.DANAVA_DATA_DIR = '.data'; envChanged = true; }
if (envChanged) {
  const body = [
    '# Cấu hình chạy trên máy cá nhân — file này KHÔNG được commit (.gitignore).',
    '# Đổi mật khẩu quản trị: xóa dòng DANAVA_ADMIN_PASSWORD_HASH rồi chạy lại file chạy.',
    ...Object.entries(env).filter(([k]) => k !== 'SITE_URL' && k !== 'PORT').map(([k, v]) => `${k}=${v}`),
    ''
  ].join('\n');
  await writeFile('.env', body, { mode: 0o600 });
  say('Đã lưu cấu hình vào .env');
}

/* 4. Cổng trống */
const portFree = port => new Promise(resolve => {
  const s = createServer().once('error', () => resolve(false)).once('listening', () => s.close(() => resolve(true)));
  s.listen(port, '0.0.0.0');
});
const openUrl = target => {
  const opener = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', target]] : process.platform === 'darwin' ? ['open', [target]] : ['xdg-open', [target]];
  spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref();
};

// Next.js chỉ cho một dev server mỗi thư mục: nếu website đã chạy sẵn thì mở luôn thay vì báo lỗi.
if (!prod && !(await portFree(preferredPort))) {
  const running = `http://localhost:${preferredPort}`;
  const html = await fetch(running, { headers: { connection: 'close' }, signal: AbortSignal.timeout(15000) })
    .then(r => r.text())
    .catch(() => '');
  if (html.includes('DANAVA')) {
    say(`Website đã đang chạy tại ${running} — mở trình duyệt.`);
    say(`Quản trị:    ${running}/admin/`);
    if (openBrowser) openUrl(running);
    // Chờ kết nối mạng đóng hẳn trước khi thoát (tránh lỗi libuv trên Windows).
    await new Promise(r => setTimeout(r, 300));
    process.exit(0);
  }
}

let port = preferredPort;
while (!(await portFree(port))) port++;
if (port !== preferredPort) say(`Cổng ${preferredPort} đang bận, dùng cổng ${port}.`);
const url = `http://localhost:${port}`;

// Trang quản trị kiểm tra cùng nguồn gốc theo SITE_URL → khi chạy ở máy phải là localhost.
// Thư mục dữ liệu phải là đường dẫn tuyệt đối: server bản hoàn thiện tự chuyển vào .next/standalone,
// đường dẫn tương đối sẽ khiến dữ liệu nằm trong thư mục build và bị xóa ở lần build sau.
const childEnv = {
  ...process.env,
  ...env,
  DANAVA_DATA_DIR: resolve(root, env.DANAVA_DATA_DIR),
  PORT: String(port),
  SITE_URL: url,
  DANAVA_HOSTNAME: '0.0.0.0'
};

/* 5. Build bản hoàn thiện nếu cần */
const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
if (prod) {
  say('Đang build bản hoàn thiện (khoảng 1–2 phút)...');
  try {
    await run(process.execPath, [nextBin, 'build'], { env: childEnv, shell: false });
    await run(process.execPath, ['scripts/prepare-standalone.mjs'], { env: childEnv, shell: false });
  } catch (error) {
    fail(`Build thất bại: ${error.message}\n` +
      'Nếu thấy lỗi EBUSY ở .next/standalone: đang có một server cũ (server.cjs) chạy bản build trước — hãy tắt nó rồi chạy lại.');
  }
}

/* 6. Khởi động và mở trình duyệt */
const child = prod
  ? spawn(process.execPath, ['server.cjs'], { env: childEnv, stdio: 'inherit' })
  : spawn(process.execPath, [nextBin, 'dev', '--hostname', '0.0.0.0', '--port', String(port)], { env: childEnv, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 0));

for (let i = 0; i < 120; i++) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status < 500) break;
  } catch {}
  await new Promise(r => setTimeout(r, 1000));
}
console.log('');
say(`Website:     ${url}`);
say(`Quản trị:    ${url}/admin/`);
say(`Chế độ:      ${prod ? 'bản hoàn thiện (production)' : 'phát triển (sửa code thấy ngay)'}`);
say('Nhấn Ctrl + C để tắt.');
if (openBrowser) openUrl(url);
