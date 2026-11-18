import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {initial,validateContent,type SiteData} from './content.ts';

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
      await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_revision) VALUES(1, ?, 1, 1, 1)', [JSON.stringify(initial).normalize('NFC')]);
    } catch {} // tiến trình khác vừa nhập trước: bỏ qua
  }
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
  revision: number;
  publishedRevision?: number;
  draftRevision?: number;
  hasDraft?: boolean;
};

type ContentRow = { json: string; revision: number; published_revision?: number; draft_json?: string | null; draft_revision?: number };

async function readContent(sql: Sql, lock = false): Promise<ContentEnvelope & { exists: boolean }> {
  const row = await sql.get<ContentRow>(
    'SELECT json, revision, published_revision, draft_json, draft_revision FROM content WHERE id=1' + (lock && sql.kind === 'mysql' ? ' FOR UPDATE' : '')
  );
  if(!row) return { data: initial, revision: 0, publishedRevision: 0, draftRevision: 0, hasDraft: false, exists: false };
  const data: unknown = JSON.parse(row.json);
  if(!validateContent(data)) throw Error('Nội dung lưu trữ không hợp lệ');
  return {
    data,
    revision: Number(row.revision),
    publishedRevision: Number(row.published_revision || row.revision),
    draftRevision: Number(row.draft_revision || row.revision),
    hasDraft: !!row.draft_json,
    exists: true
  };
}

export async function getContent(): Promise<ContentEnvelope> {
  const { exists: _exists, ...envelope } = await readContent(await db());
  return envelope;
}

export function publicContent(data: SiteData): SiteData {
  return {
    ...data,
    staff: data.staff.filter(p => p.visible),
    posts: data.posts.filter(p => p.published),
    projects: (data.projects || []).filter(p => p.published)
  };
}

export async function writeContent(
  data: SiteData,
  revision: number,
  options?: { draftOnly?: boolean; publish?: boolean }
): Promise<number | null> {
  if(!validateContent(data)) throw Error('Invalid content');
  return (await db()).tx(async sql => {
    const current = await readContent(sql, true);
    if(current.revision !== revision) return null;
    const exists = current.exists;

    if(options?.draftOnly) {
      const nextDraftRevision = (current.draftRevision || revision) + 1;
      const draft = JSON.stringify(data).normalize('NFC');
      if (exists) await sql.run('UPDATE content SET draft_json=?, draft_revision=? WHERE id=1', [draft, nextDraftRevision]);
      else await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_json, draft_revision) VALUES(1, ?, ?, ?, ?, ?)', [JSON.stringify(current.data).normalize('NFC'), current.revision, current.revision, draft, nextDraftRevision]);
      return nextDraftRevision;
    }

    const next = revision + 1;
    const nextPubRevision = (current.publishedRevision || revision) + 1;
    const json = JSON.stringify(data).normalize('NFC');
    if (exists) await sql.run('UPDATE content SET json=?, revision=?, published_revision=?, draft_json=NULL, draft_revision=? WHERE id=1', [json, next, nextPubRevision, next]);
    else await sql.run('INSERT INTO content(id, json, revision, published_revision, draft_json, draft_revision) VALUES(1, ?, ?, ?, NULL, ?)', [json, next, nextPubRevision, next]);
    return next;
  });
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
