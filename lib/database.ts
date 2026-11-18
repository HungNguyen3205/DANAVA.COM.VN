import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {initial,validateContent,type SiteData} from './content.ts';

let database:DatabaseSync|undefined;

export function db(){
  if(database)return database;
  const dir = process.env.VERCEL
    ? (process.env.DANAVA_DATA_DIR && process.env.DANAVA_DATA_DIR.startsWith('/tmp') ? process.env.DANAVA_DATA_DIR : '/tmp/.data')
    : resolve(/* turbopackIgnore: true */ process.env.DANAVA_DATA_DIR||'.data');
  mkdirSync(dir,{recursive:true,mode:0o700});
  database=new DatabaseSync(resolve(dir,'danava.sqlite'));
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY CHECK(id=1),
  json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  published_revision INTEGER NOT NULL DEFAULT 1,
  draft_json TEXT,
  draft_revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, session TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, started INTEGER NOT NULL, last INTEGER NOT NULL, seconds INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS visits_started ON visits(started);
`);
  try{database.exec('ALTER TABLE content ADD COLUMN published_revision INTEGER NOT NULL DEFAULT 1;');}catch{}
  try{database.exec('ALTER TABLE content ADD COLUMN draft_json TEXT;');}catch{}
  try{database.exec('ALTER TABLE content ADD COLUMN draft_revision INTEGER NOT NULL DEFAULT 1;');}catch{}
  try{database.exec('ALTER TABLE leads ADD COLUMN business_type TEXT;');}catch{}
  try{database.exec('ALTER TABLE leads ADD COLUMN source TEXT;');}catch{}
  try{database.exec('ALTER TABLE leads ADD COLUMN assigned_to TEXT;');}catch{}
  try{database.exec('ALTER TABLE leads ADD COLUMN assigned_note TEXT;');}catch{}
  return database;
}

export type ContentEnvelope = {
  data: SiteData;
  revision: number;
  publishedRevision?: number;
  draftRevision?: number;
  hasDraft?: boolean;
};

export function getContent(): ContentEnvelope {
  const row = db().prepare(
    'SELECT json, revision, published_revision, draft_json, draft_revision FROM content WHERE id=1'
  ).get() as {
    json: string;
    revision: number;
    published_revision?: number;
    draft_json?: string | null;
    draft_revision?: number;
  } | undefined;

  if(!row) return { data: initial, revision: 0, publishedRevision: 0, draftRevision: 0, hasDraft: false };
  const data: unknown = JSON.parse(row.json);
  if(!validateContent(data)) throw Error('Nội dung lưu trữ không hợp lệ');

  return {
    data,
    revision: row.revision,
    publishedRevision: row.published_revision || row.revision,
    draftRevision: row.draft_revision || row.revision,
    hasDraft: !!row.draft_json
  };
}

export function publicContent(data: SiteData): SiteData {
  return {
    ...data,
    staff: data.staff.filter(p => p.visible),
    posts: data.posts.filter(p => p.published),
    projects: (data.projects || []).filter(p => p.published)
  };
}

export function writeContent(
  data: SiteData,
  revision: number,
  options?: { draftOnly?: boolean; publish?: boolean }
): number | null {
  if(!validateContent(data)) throw Error('Invalid content');
  const conn = db();
  conn.exec('BEGIN IMMEDIATE');
  try {
    const current = getContent();
    if(current.revision !== revision) {
      conn.exec('ROLLBACK');
      return null;
    }

    if(options?.draftOnly) {
      const nextDraftRevision = (current.draftRevision || revision) + 1;
      conn.prepare(
        'INSERT INTO content(id, json, revision, draft_json, draft_revision) VALUES(1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET draft_json=excluded.draft_json, draft_revision=excluded.draft_revision'
      ).run(
        JSON.stringify(current.data).normalize('NFC'),
        current.revision,
        JSON.stringify(data).normalize('NFC'),
        nextDraftRevision
      );
      conn.exec('COMMIT');
      return nextDraftRevision;
    }

    const next = revision + 1;
    const nextPubRevision = (current.publishedRevision || revision) + 1;
    conn.prepare(
      'INSERT INTO content(id, json, revision, published_revision, draft_json, draft_revision) VALUES(1, ?, ?, ?, NULL, ?) ON CONFLICT(id) DO UPDATE SET json=excluded.json, revision=excluded.revision, published_revision=excluded.published_revision, draft_json=NULL, draft_revision=excluded.draft_revision'
    ).run(
      JSON.stringify(data).normalize('NFC'),
      next,
      nextPubRevision,
      next
    );
    conn.exec('COMMIT');
    return next;
  } catch (e) {
    try { conn.exec('ROLLBACK'); } catch {}
    throw e;
  }
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

export function checkRecentDuplicateLead(phone: string, windowMs = 45000): boolean {
  if (!phone || !phone.trim()) return false;
  const cutoff = Date.now() - windowMs;
  const row = db().prepare(
    'SELECT id FROM leads WHERE phone = ? AND created_at > ? LIMIT 1'
  ).get(phone.trim(), cutoff) as { id: string } | undefined;
  return !!row;
}

export function saveLead(lead: {
  name: string;
  email?: string;
  phone?: string;
  business_type?: string;
  service?: string;
  source?: string;
  message: string;
}): string {
  const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  db().prepare(
    'INSERT INTO leads (id, name, email, phone, business_type, service, source, message, created_at, status, assigned_to, assigned_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
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
  );
  return id;
}

export function updateLeadAssignment(id: string, update: {
  assigned_to?: string;
  status?: string;
  assigned_note?: string;
}): boolean {
  const current = db().prepare('SELECT id, status, assigned_to, assigned_note FROM leads WHERE id = ?').get(id) as { id: string; status: string; assigned_to?: string; assigned_note?: string } | undefined;
  if (!current) return false;
  const newAssignedTo = update.assigned_to !== undefined ? update.assigned_to : (current.assigned_to || '');
  const newStatus = update.status !== undefined ? update.status : (current.status || 'new');
  const newNote = update.assigned_note !== undefined ? update.assigned_note : (current.assigned_note || '');
  db().prepare(
    'UPDATE leads SET assigned_to = ?, status = ?, assigned_note = ? WHERE id = ?'
  ).run(newAssignedTo, newStatus, newNote, id);
  return true;
}

export function getLeads(limit = 50): LeadRecord[] {
  return db().prepare(
    'SELECT id, name, email, phone, business_type, service, source, message, created_at, status, assigned_to, assigned_note FROM leads ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as LeadRecord[];
}
