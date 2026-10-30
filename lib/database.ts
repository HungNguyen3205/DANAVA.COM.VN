import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {initial,validateContent,type SiteData} from './content';
let database:DatabaseSync|undefined;
export function db(){if(database)return database;const dir=resolve(/* turbopackIgnore: true */ process.env.DANAVA_DATA_DIR||'.data');mkdirSync(dir,{recursive:true,mode:0o700});database=new DatabaseSync(resolve(dir,'danava.sqlite'));database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, session TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, started INTEGER NOT NULL, last INTEGER NOT NULL, seconds INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS visits_started ON visits(started);
`);return database;}
export function getContent():{data:SiteData;revision:number}{const row=db().prepare('SELECT json,revision FROM content WHERE id=1').get() as {json:string;revision:number}|undefined;if(!row)return {data:initial,revision:0};const data:unknown=JSON.parse(row.json);if(!validateContent(data))throw Error('Nội dung lưu trữ không hợp lệ');return{data,revision:row.revision};}
export function publicContent(data:SiteData):SiteData{return {...data,staff:data.staff.filter(p=>p.visible),posts:data.posts.filter(p=>p.published),projects:(data.projects||[]).filter(p=>p.published)}}
export function writeContent(data:SiteData,revision:number){if(!validateContent(data))throw Error('Invalid content');const conn=db();conn.exec('BEGIN IMMEDIATE');try{const current=getContent();if(current.revision!==revision){conn.exec('ROLLBACK');return null;}const next=revision+1;conn.prepare('INSERT INTO content(id,json,revision) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json,revision=excluded.revision').run(JSON.stringify(data).normalize('NFC'),next);conn.exec('COMMIT');return next;}catch(e){try{conn.exec('ROLLBACK')}catch{}throw e;}}
