import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {initial,validateContent,siteView,type SiteData} from './content.ts';
import {normalizeContent} from './content-defaults.ts';

/*
 * Lớp lưu trữ dùng chung cho hai môi trường:
 * - MySQL/MariaDB khi có đủ biến DANAVA_DB_HOST, DANAVA_DB_NAME, DANAVA_DB_USER (production cPanel).
 * - SQLite (node:sqlite) trong DANAVA_DATA_DIR khi không cấu hình MySQL (máy local, test).
 * Mọi câu SQL bên dưới viết theo cú pháp chung chạy được trên cả hai.
 */
type Row = Record<string, unknown>;
export type Sql = {
  kind: 'mysql' | 'sqlite';
  all<T = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T = Row>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<void>;
  /** Chạy fn trong một transaction có khóa ghi; fn nhận kết nối riêng của transaction. */
  tx<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
};

const usesMysql = () => !!(process.env.DANAVA_DB_HOST && process.env.DANAVA_DB_NAME && process.env.DANAVA_DB_USER);

const MYSQL_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS content (
    id INT PRIMARY KEY,
    json LONGTEXT NOT NULL,
    revision INT NOT NULL DEFAULT 1,
    published_revision INT NOT NULL DEFAULT 1,
    draft_json LONGTEXT NULL,
    draft_revision INT NOT NULL DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NULL,
    service VARCHAR(255) NULL,
    message TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    business_type VARCHAR(255) NULL,
    source VARCHAR(255) NULL,
    assigned_to VARCHAR(255) NULL,
    assigned_note TEXT NULL,
    INDEX leads_created (created_at),
    INDEX leads_phone (phone)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(128) PRIMARY KEY,
    csrf VARCHAR(64) NOT NULL,
    expires BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id VARCHAR(64) PRIMARY KEY,
    count INT NOT NULL,
    until BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(64) PRIMARY KEY,
    visitor VARCHAR(64) NOT NULL,
    session VARCHAR(64) NOT NULL,
    path VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    started BIGINT NOT NULL,
    last BIGINT NOT NULL,
    seconds INT NOT NULL DEFAULT 0,
    INDEX visits_started (started),
    INDEX visits_visitor (visitor, started)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

const SQLITE_SCHEMA = `PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, published_revision INTEGER NOT NULL DEFAULT 1, draft_json TEXT, draft_revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, service TEXT, message TEXT NOT NULL, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new');
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, session TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, started INTEGER NOT NULL, last INTEGER NOT NULL, seconds INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS visits_started ON visits(started);`;

/*
 * Migration có phiên bản (bảng schema_migrations). Mỗi bước chạy lại an toàn:
 *  - chỉ TẠO bảng/cột mới (IF NOT EXISTS; cột đã có thì bỏ qua lỗi trùng), không xóa, không đổi kiểu dữ liệu cũ;
 *  - bản build cũ vẫn chạy được trên database đã nâng cấp (bỏ qua bảng/cột mới).
 * Khôi phục: xem docs/NANG-CAP-ADMIN-2026-11.md (sao lưu trước khi triển khai; quay về bản cũ không cần đổi database).
 */
type Migration = { version: number; name: string; mysql: string[]; sqlite: string[]; data?: (sql: Sql) => Promise<void> };
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'phien-ban-noi-dung-tai-khoan-nhat-ky',
    mysql: [
      `CREATE TABLE IF NOT EXISTS content_revisions (
        id VARCHAR(64) PRIMARY KEY,
        revision INT NOT NULL,
        kind VARCHAR(16) NOT NULL,
        json LONGTEXT NOT NULL,
        created_at BIGINT NOT NULL,
        author_id VARCHAR(64) NULL,
        author_name VARCHAR(150) NULL,
        note VARCHAR(500) NULL,
        INDEX content_revisions_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(16) NOT NULL,
        password_hash VARCHAR(300) NOT NULL,
        active TINYINT NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        last_login BIGINT NULL,
        UNIQUE KEY users_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS audit_log (
        id VARCHAR(64) PRIMARY KEY,
        at BIGINT NOT NULL,
        actor_id VARCHAR(64) NULL,
        actor_name VARCHAR(150) NULL,
        action VARCHAR(64) NOT NULL,
        target VARCHAR(255) NULL,
        detail TEXT NULL,
        INDEX audit_log_at (at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      'ALTER TABLE sessions ADD COLUMN user_id VARCHAR(64) NULL',
      'ALTER TABLE sessions ADD COLUMN role VARCHAR(16) NULL',
      'ALTER TABLE sessions ADD COLUMN name VARCHAR(150) NULL',
      'ALTER TABLE content ADD COLUMN draft_updated_at BIGINT NULL',
      'ALTER TABLE content ADD COLUMN draft_author VARCHAR(150) NULL'
    ],
    sqlite: [
      'CREATE TABLE IF NOT EXISTS content_revisions (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, kind TEXT NOT NULL, json TEXT NOT NULL, created_at INTEGER NOT NULL, author_id TEXT, author_name TEXT, note TEXT)',
      'CREATE INDEX IF NOT EXISTS content_revisions_created ON content_revisions(created_at)',
      'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, last_login INTEGER)',
      'CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, at INTEGER NOT NULL, actor_id TEXT, actor_name TEXT, action TEXT NOT NULL, target TEXT, detail TEXT)',
      'CREATE INDEX IF NOT EXISTS audit_log_at ON audit_log(at)',
      'ALTER TABLE sessions ADD COLUMN user_id TEXT',
      'ALTER TABLE sessions ADD COLUMN role TEXT',
      'ALTER TABLE sessions ADD COLUMN name TEXT',
      'ALTER TABLE content ADD COLUMN draft_updated_at INTEGER',
      'ALTER TABLE content ADD COLUMN draft_author TEXT'
    ],
    // Dữ liệu đang công khai trở thành phiên bản published ban đầu; mã chỉnh sửa không nhỏ hơn revision công khai.
    data: async sql => {
      const row = await sql.get<{ json: string; revision: number }>('SELECT json, revision FROM content WHERE id=1');
      if (!row) return;
      await sql.run('UPDATE content SET draft_revision=revision WHERE id=1 AND draft_revision<revision');
      const has = await sql.get('SELECT id FROM content_revisions LIMIT 1');
      if (!has) {
        await sql.run('INSERT INTO content_revisions(id, revision, kind, json, created_at, author_id, author_name, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
          ['rev_baseline_' + Number(row.revision), Number(row.revision), 'baseline', row.json, Date.now(), 'system', 'Hệ thống', 'Phiên bản công khai tại thời điểm nâng cấp hệ quản trị']);
      }
    }
  }
];

const DUPLICATE = /duplicate column|already exists|ER_DUP_FIELDNAME|ER_TABLE_EXISTS/i;

async function migrate(sql: Sql) {
  if (sql.kind === 'mysql') {
    await sql.run(`CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, name VARCHAR(200) NOT NULL, applied_at BIGINT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } else {
    await sql.run('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at INTEGER NOT NULL)');
  }
  const done = new Set((await sql.all<{ version: number }>('SELECT version FROM schema_migrations')).map(r => Number(r.version)));
  for (const m of MIGRATIONS) {
    if (done.has(m.version)) continue;
    for (const statement of sql.kind === 'mysql' ? m.mysql : m.sqlite) {
      try { await sql.run(statement); } catch (e) { if (!DUPLICATE.test(String((e as Error)?.message || e))) throw e; }
    }
    if (m.data) await m.data(sql);
    try { await sql.run('INSERT INTO schema_migrations(version, name, applied_at) VALUES(?, ?, ?)', [m.version, m.name, Date.now()]); } catch {} // tiến trình khác vừa ghi
  }
}

/** Các bước migration đã chạy (hiển thị ở Nhật ký & sao lưu). */
export async function migrationStatus() {
  const sql = await db();
  const rows = await sql.all<{ version: number; name: string; applied_at: number }>('SELECT version, name, applied_at FROM schema_migrations ORDER BY version');
  return { latest: MIGRATIONS[MIGRATIONS.length - 1].version, applied: rows.map(r => ({ version: Number(r.version), name: r.name, appliedAt: Number(r.applied_at) })) };
}

const g = globalThis as typeof globalThis & { __danavaDb?: Promise<Sql>; __danavaClose?: () => Promise<void> };

async function openMysql(): Promise<Sql> {
  const mysql = await import('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DANAVA_DB_HOST,
    port: Number(process.env.DANAVA_DB_PORT || 3306),
    database: process.env.DANAVA_DB_NAME,
    user: process.env.DANAVA_DB_USER,
    password: process.env.DANAVA_DB_PASSWORD || '',
    charset: 'utf8mb4_unicode_ci',
    connectionLimit: 5,
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: false
  });
  // Ngày thống kê tính theo giờ Việt Nam.
  pool.on('connection', c => { c.query("SET time_zone='+07:00'"); });
  type Q = { query: (sql: string, params?: unknown[]) => Promise<[unknown, unknown]> };
  const wrap = (c: Q, tx: Sql['tx']): Sql => ({
    kind: 'mysql',
    all: async (sql, params = []) => (await c.query(sql, params))[0] as never,
    get: async (sql, params = []) => ((await c.query(sql, params))[0] as never[])[0],
    run: async (sql, params = []) => { await c.query(sql, params); },
    tx
  });
  const tx: Sql['tx'] = async fn => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const out = await fn(wrap(conn as unknown as Q, () => { throw Error('Nested transaction'); }));
      await conn.commit();
      return out;
    } catch (e) {
      try { await conn.rollback(); } catch {}
      throw e;
    } finally { conn.release(); }
  };
  const sql = wrap(pool as unknown as Q, tx);
  g.__danavaClose = () => pool.end();
  for (const statement of MYSQL_SCHEMA) await sql.run(statement);
  // Lần chạy đầu trên database trống: nhập sẵn toàn bộ nội dung mặc định (30 bài blog, dự án, dịch vụ...).
  if (!(await sql.get('SELECT id FROM content WHERE id=1'))) {
    try {
      await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_revision) VALUES(1, ?, 1, 1, 1)', [JSON.stringify(normalizeContent(initial)).normalize('NFC')]);
    } catch {} // tiến trình khác vừa nhập trước: bỏ qua
  }
  await migrate(sql);
  return sql;
}

async function openSqlite(): Promise<Sql> {
  const {DatabaseSync} = await import('node:sqlite');
  const dir = process.env.VERCEL
    ? (process.env.DANAVA_DATA_DIR && process.env.DANAVA_DATA_DIR.startsWith('/tmp') ? process.env.DANAVA_DATA_DIR : '/tmp/.data')
    : resolve(/* turbopackIgnore: true */ process.env.DANAVA_DATA_DIR||'.data');
  mkdirSync(dir,{recursive:true,mode:0o700});
  const d = new DatabaseSync(resolve(dir,'danava.sqlite'), { timeout: 5000 });
  d.exec(SQLITE_SCHEMA);
  for (const alter of [
    'ALTER TABLE content ADD COLUMN published_revision INTEGER NOT NULL DEFAULT 1',
    'ALTER TABLE content ADD COLUMN draft_json TEXT',
    'ALTER TABLE content ADD COLUMN draft_revision INTEGER NOT NULL DEFAULT 1',
    'ALTER TABLE leads ADD COLUMN business_type TEXT',
    'ALTER TABLE leads ADD COLUMN source TEXT',
    'ALTER TABLE leads ADD COLUMN assigned_to TEXT',
    'ALTER TABLE leads ADD COLUMN assigned_note TEXT'
  ]) { try { d.exec(alter); } catch {} }
  type P = Parameters<ReturnType<typeof d.prepare>['all']>;
  const sql: Sql = {
    kind: 'sqlite',
    all: async (s, params = []) => d.prepare(s).all(...(params as P)) as never,
    get: async (s, params = []) => d.prepare(s).get(...(params as P)) as never,
    run: async (s, params = []) => { d.prepare(s).run(...(params as P)); },
    tx: async fn => {
      d.exec('BEGIN IMMEDIATE');
      try { const out = await fn(sql); d.exec('COMMIT'); return out; }
      catch (e) { try { d.exec('ROLLBACK'); } catch {} throw e; }
    }
  };
  g.__danavaClose = async () => d.close();
  await migrate(sql);
  return sql;
}

export function db(): Promise<Sql> {
  if (!g.__danavaDb) {
    g.__danavaDb = (usesMysql() ? openMysql() : openSqlite()).catch(e => { g.__danavaDb = undefined; throw e; });
  }
  return g.__danavaDb;
}

/** Đóng kết nối (dùng cho script và test). */
export async function closeDb() {
  const close = g.__danavaClose;
  g.__danavaDb = undefined; g.__danavaClose = undefined;
  if (close) await close();
}

export type ContentEnvelope = {
  data: SiteData;
  /**
   * Mã chỉnh sửa để chống ghi đè: gửi kèm khi lưu nháp/xuất bản; tăng sau MỖI lần ghi (nháp hoặc xuất bản).
   * Ai đó vừa lưu trước bạn → mã bạn đang giữ đã cũ → máy chủ trả 409.
   */
  revision: number;
  publishedRevision?: number;
  draftRevision?: number;
  hasDraft?: boolean;
  draftUpdatedAt?: number | null;
  draftAuthor?: string | null;
};

/** Người thực hiện thao tác (ghi vào lịch sử phiên bản và nhật ký). */
export type Actor = { id: string; name: string };
const SYSTEM: Actor = { id: 'system', name: 'Hệ thống' };

type ContentRow = { json: string; revision: number; published_revision?: number; draft_json?: string | null; draft_revision?: number; draft_updated_at?: number | null; draft_author?: string | null };

function parseContent(json: string): SiteData {
  const data: unknown = JSON.parse(json);
  if(!validateContent(data)) throw Error('Nội dung lưu trữ không hợp lệ');
  // Điền các trường mới cho dữ liệu lưu từ phiên bản trước. Chỉ ghi xuống database khi quản trị viên lưu.
  return normalizeContent(data);
}

async function readRow(sql: Sql, lock = false) {
  return sql.get<ContentRow>(
    'SELECT json, revision, published_revision, draft_json, draft_revision, draft_updated_at, draft_author FROM content WHERE id=1' + (lock && sql.kind === 'mysql' ? ' FOR UPDATE' : '')
  );
}

const tokenOf = (row: ContentRow) => Math.max(Number(row.revision), Number(row.draft_revision || 0));

/** Bản công khai (draft = false) hoặc bản đang soạn: nháp nếu có, không thì bản công khai (draft = true). */
async function readContent(sql: Sql, lock = false, draft = false): Promise<ContentEnvelope & { exists: boolean }> {
  const row = await readRow(sql, lock);
  if(!row) return { data: normalizeContent(initial), revision: 0, publishedRevision: 0, draftRevision: 0, hasDraft: false, exists: false };
  return {
    data: parseContent(draft && row.draft_json ? row.draft_json : row.json),
    revision: tokenOf(row),
    publishedRevision: Number(row.published_revision || row.revision),
    draftRevision: Number(row.draft_revision || row.revision),
    hasDraft: !!row.draft_json,
    draftUpdatedAt: row.draft_updated_at ? Number(row.draft_updated_at) : null,
    draftAuthor: row.draft_author || null,
    exists: true
  };
}

/** Nội dung ĐÃ XUẤT BẢN. Website công khai chỉ đọc hàm này, không bao giờ thấy bản nháp. */
export async function getContent(): Promise<ContentEnvelope> {
  const { exists: _exists, ...envelope } = await readContent(await db());
  return envelope;
}

/**
 * Nội dung cho WEBSITE CÔNG KHAI: bản đã xuất bản, bỏ thêm các hồ sơ đang ẩn
 * (sản phẩm chưa xuất bản và trang con của nó). Không dùng để đọc–sửa–ghi lại (sẽ mất bản ghi bị ẩn).
 */
export async function getSiteContent(): Promise<ContentEnvelope> {
  const envelope = await getContent();
  return { ...envelope, data: siteView(envelope.data) };
}

/** Bản đang soạn cho admin: bản nháp phía máy chủ nếu có, không thì bản công khai. */
export async function getWorkingContent(): Promise<ContentEnvelope> {
  const { exists: _exists, ...envelope } = await readContent(await db(), false, true);
  return envelope;
}

/** Dữ liệu công khai (đã loại bản nháp) — xem lib/site-queries.ts. */
export { publicContent } from './site-queries.ts';

/** Giữ tối đa chừng này phiên bản (cộng bản gốc khi nâng cấp) để database không phình. */
const KEEP_REVISIONS = 40;

async function snapshot(sql: Sql, revision: number, kind: string, json: string, actor: Actor, note = '') {
  const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await sql.run('INSERT INTO content_revisions(id, revision, kind, json, created_at, author_id, author_name, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
    [id, revision, kind, json, Date.now(), actor.id, actor.name.slice(0, 150), note.slice(0, 500)]);
  const old = await sql.all<{ id: string }>("SELECT id FROM content_revisions WHERE kind<>'baseline' ORDER BY created_at DESC LIMIT 1000 OFFSET " + KEEP_REVISIONS);
  for (const r of old) await sql.run('DELETE FROM content_revisions WHERE id=?', [r.id]);
  return id;
}

/**
 * Ghi nội dung. Mặc định XUẤT BẢN (website cập nhật ngay) và lưu một phiên bản vào lịch sử;
 * `draftOnly` = chỉ lưu bản nháp phía máy chủ (website không đổi).
 * Trả về mã chỉnh sửa mới, hoặc null nếu `revision` đã cũ (người khác vừa lưu).
 */
export async function writeContent(
  data: SiteData,
  revision: number,
  options?: { draftOnly?: boolean; publish?: boolean; actor?: Actor; note?: string; kind?: 'publish' | 'restore' | 'import' }
): Promise<number | null> {
  if(!validateContent(data)) throw Error('Invalid content');
  const actor = options?.actor || SYSTEM;
  return (await db()).tx(async sql => {
    const row = await readRow(sql, true);
    const current = row ? tokenOf(row) : 0;
    if(current !== revision) return null;
    const next = current + 1;
    const json = JSON.stringify(data).normalize('NFC');

    if(options?.draftOnly) {
      if (row) await sql.run('UPDATE content SET draft_json=?, draft_revision=?, draft_updated_at=?, draft_author=? WHERE id=1', [json, next, Date.now(), actor.name.slice(0, 150)]);
      else await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_json, draft_revision, draft_updated_at, draft_author) VALUES(1, ?, ?, ?, ?, ?, ?, ?)',
        [JSON.stringify(normalizeContent(initial)).normalize('NFC'), 0, 0, json, next, Date.now(), actor.name.slice(0, 150)]);
      return next;
    }

    const published = Number(row?.published_revision || row?.revision || 0) + 1;
    if (row) await sql.run('UPDATE content SET json=?, revision=?, published_revision=?, draft_json=NULL, draft_revision=?, draft_updated_at=NULL, draft_author=NULL WHERE id=1', [json, next, published, next]);
    else await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_json, draft_revision) VALUES(1, ?, ?, ?, NULL, ?)', [json, next, published, next]);
    await snapshot(sql, next, options?.kind || 'publish', json, actor, options?.note || '');
    return next;
  });
}

/** Bỏ bản nháp, quay về bản đang công khai. */
export async function discardDraft(revision: number): Promise<number | null> {
  return (await db()).tx(async sql => {
    const row = await readRow(sql, true);
    if (!row || tokenOf(row) !== revision) return null;
    const next = tokenOf(row) + 1;
    await sql.run('UPDATE content SET draft_json=NULL, draft_revision=?, draft_updated_at=NULL, draft_author=NULL WHERE id=1', [next]);
    return next;
  });
}

export type RevisionInfo = { id: string; revision: number; kind: string; createdAt: number; authorName: string; note: string; size: number };

export async function listRevisions(limit = 50): Promise<RevisionInfo[]> {
  const rows = await (await db()).all<{ id: string; revision: number; kind: string; created_at: number; author_name: string | null; note: string | null; size: number }>(
    'SELECT id, revision, kind, created_at, author_name, note, LENGTH(json) size FROM content_revisions ORDER BY created_at DESC LIMIT ?', [Math.min(200, Math.max(1, limit))]
  );
  return rows.map(r => ({ id: r.id, revision: Number(r.revision), kind: r.kind, createdAt: Number(r.created_at), authorName: r.author_name || '', note: r.note || '', size: Number(r.size) }));
}

/** Nội dung của một phiên bản (đã chuẩn hóa), hoặc null. */
export async function getRevision(id: string): Promise<{ info: RevisionInfo; data: SiteData } | null> {
  const r = await (await db()).get<{ id: string; revision: number; kind: string; created_at: number; author_name: string | null; note: string | null; json: string }>(
    'SELECT id, revision, kind, created_at, author_name, note, json FROM content_revisions WHERE id=?', [id]
  );
  if (!r) return null;
  return {
    info: { id: r.id, revision: Number(r.revision), kind: r.kind, createdAt: Number(r.created_at), authorName: r.author_name || '', note: r.note || '', size: r.json.length },
    data: parseContent(r.json)
  };
}

/* ------------------------------------------------------------ Nhật ký thao tác */
export type AuditEntry = { id: string; at: number; actorName: string; action: string; target: string; detail: string };

/** Ghi nhật ký. Không làm hỏng thao tác chính nếu ghi nhật ký lỗi. */
export async function logAction(actor: Actor, action: string, target = '', detail = '') {
  try {
    await (await db()).run('INSERT INTO audit_log(id, at, actor_id, actor_name, action, target, detail) VALUES(?, ?, ?, ?, ?, ?, ?)',
      [`log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, Date.now(), actor.id, actor.name.slice(0, 150), action.slice(0, 64), target.slice(0, 255), detail.slice(0, 2000)]);
  } catch {}
}

export async function listAudit(limit = 100): Promise<AuditEntry[]> {
  const rows = await (await db()).all<{ id: string; at: number; actor_name: string | null; action: string; target: string | null; detail: string | null }>(
    'SELECT id, at, actor_name, action, target, detail FROM audit_log ORDER BY at DESC LIMIT ?', [Math.min(500, Math.max(1, limit))]
  );
  return rows.map(r => ({ id: r.id, at: Number(r.at), actorName: r.actor_name || '', action: r.action, target: r.target || '', detail: r.detail || '' }));
}

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_type?: string;
  service?: string;
  source?: string;
  message: string;
  created_at: number;
  status: string;
  assigned_to?: string;
  assigned_note?: string;
};

export async function checkRecentDuplicateLead(phone: string, windowMs = 45000): Promise<boolean> {
  if (!phone || !phone.trim()) return false;
  const cutoff = Date.now() - windowMs;
  const row = await (await db()).get<{ id: string }>(
    'SELECT id FROM leads WHERE phone = ? AND created_at > ? LIMIT 1', [phone.trim(), cutoff]
  );
  return !!row;
}

export async function saveLead(lead: {
  name: string;
  email?: string;
  phone?: string;
  business_type?: string;
  service?: string;
  source?: string;
  message: string;
}): Promise<string> {
  const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  await (await db()).run(
    'INSERT INTO leads (id, name, email, phone, business_type, service, source, message, created_at, status, assigned_to, assigned_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      lead.name.trim(),
      (lead.email || '').trim().toLowerCase(),
      lead.phone ? lead.phone.trim() : '',
      lead.business_type ? lead.business_type.trim() : '',
      lead.service ? lead.service.trim() : '',
      lead.source ? lead.source.trim() : '',
      lead.message.trim(),
      Date.now(),
      'new',
      '',
      ''
    ]
  );
  return id;
}

export async function updateLeadAssignment(id: string, update: {
  assigned_to?: string;
  status?: string;
  assigned_note?: string;
}): Promise<boolean> {
  const sql = await db();
  const current = await sql.get<{ id: string; status: string; assigned_to?: string; assigned_note?: string }>(
    'SELECT id, status, assigned_to, assigned_note FROM leads WHERE id = ?', [id]
  );
  if (!current) return false;
  const newAssignedTo = update.assigned_to !== undefined ? update.assigned_to : (current.assigned_to || '');
  const newStatus = update.status !== undefined ? update.status : (current.status || 'new');
  const newNote = update.assigned_note !== undefined ? update.assigned_note : (current.assigned_note || '');
  await sql.run('UPDATE leads SET assigned_to = ?, status = ?, assigned_note = ? WHERE id = ?', [newAssignedTo, newStatus, newNote, id]);
  return true;
}

export async function getLeads(limit = 50): Promise<LeadRecord[]> {
  const rows = await (await db()).all<LeadRecord>(
    'SELECT id, name, email, phone, business_type, service, source, message, created_at, status, assigned_to, assigned_note FROM leads ORDER BY created_at DESC LIMIT ?', [limit]
  );
  return rows.map(r => ({ ...r, created_at: Number(r.created_at) }));
}
