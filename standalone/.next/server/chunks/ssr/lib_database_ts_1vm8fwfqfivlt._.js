module.exports=[43155,a=>{"use strict";var b=a.i(2157),c=a.i(50227),d=a.i(76573),e=a.i(27003);a.i(54938);let f=[`CREATE TABLE IF NOT EXISTS content (
    id INT PRIMARY KEY,
    json LONGTEXT NOT NULL,
    revision INT NOT NULL DEFAULT 1,
    published_revision INT NOT NULL DEFAULT 1,
    draft_json LONGTEXT NULL,
    draft_revision INT NOT NULL DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,`CREATE TABLE IF NOT EXISTS leads (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,`CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(128) PRIMARY KEY,
    csrf VARCHAR(64) NOT NULL,
    expires BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,`CREATE TABLE IF NOT EXISTS attempts (
    id VARCHAR(64) PRIMARY KEY,
    count INT NOT NULL,
    until BIGINT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,`CREATE TABLE IF NOT EXISTS visits (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`],g=`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, published_revision INTEGER NOT NULL DEFAULT 1, draft_json TEXT, draft_revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, service TEXT, message TEXT NOT NULL, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new');
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, visitor TEXT NOT NULL, session TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, started INTEGER NOT NULL, last INTEGER NOT NULL, seconds INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS visits_started ON visits(started);`,h=globalThis;async function i(){let b=(await a.A(66549)).createPool({host:process.env.DANAVA_DB_HOST,port:Number(process.env.DANAVA_DB_PORT||3306),database:process.env.DANAVA_DB_NAME,user:process.env.DANAVA_DB_USER,password:process.env.DANAVA_DB_PASSWORD||"",charset:"utf8mb4_unicode_ci",connectionLimit:5,decimalNumbers:!0,supportBigNumbers:!0,bigNumberStrings:!1});b.on("connection",a=>{a.query("SET time_zone='+07:00'")});let c=(a,b)=>({kind:"mysql",all:async(b,c=[])=>(await a.query(b,c))[0],get:async(b,c=[])=>(await a.query(b,c))[0][0],run:async(b,c=[])=>{await a.query(b,c)},tx:b}),g=async a=>{let d=await b.getConnection();try{await d.beginTransaction();let b=await a(c(d,()=>{throw Error("Nested transaction")}));return await d.commit(),b}catch(a){try{await d.rollback()}catch{}throw a}finally{d.release()}},i=c(b,g);for(let a of(h.__danavaClose=()=>b.end(),f))await i.run(a);if(!await i.get("SELECT id FROM content WHERE id=1"))try{await i.run("INSERT INTO content(id, json, revision, published_revision, draft_revision) VALUES(1, ?, 1, 1, 1)",[JSON.stringify((0,e.g)(d.Q)).normalize("NFC")])}catch{}return i}async function j(){let{DatabaseSync:d}=await Promise.resolve().then(()=>a.x("node:sqlite",()=>require("node:sqlite"),!0)),e=process.env.VERCEL?process.env.DANAVA_DATA_DIR&&process.env.DANAVA_DATA_DIR.startsWith("/tmp")?process.env.DANAVA_DATA_DIR:"/tmp/.data":(0,c.resolve)(process.env.DANAVA_DATA_DIR||".data");(0,b.mkdirSync)(e,{recursive:!0,mode:448});let f=new d((0,c.resolve)(e,"danava.sqlite"),{timeout:5e3});for(let a of(f.exec(g),["ALTER TABLE content ADD COLUMN published_revision INTEGER NOT NULL DEFAULT 1","ALTER TABLE content ADD COLUMN draft_json TEXT","ALTER TABLE content ADD COLUMN draft_revision INTEGER NOT NULL DEFAULT 1","ALTER TABLE leads ADD COLUMN business_type TEXT","ALTER TABLE leads ADD COLUMN source TEXT","ALTER TABLE leads ADD COLUMN assigned_to TEXT","ALTER TABLE leads ADD COLUMN assigned_note TEXT"]))try{f.exec(a)}catch{}let i={kind:"sqlite",all:async(a,b=[])=>f.prepare(a).all(...b),get:async(a,b=[])=>f.prepare(a).get(...b),run:async(a,b=[])=>{f.prepare(a).run(...b)},tx:async a=>{f.exec("BEGIN IMMEDIATE");try{let b=await a(i);return f.exec("COMMIT"),b}catch(a){try{f.exec("ROLLBACK")}catch{}throw a}}};return h.__danavaClose=async()=>f.close(),i}function k(){return h.__danavaDb||(h.__danavaDb=(process.env.DANAVA_DB_HOST&&process.env.DANAVA_DB_NAME&&process.env.DANAVA_DB_USER?i():j()).catch(a=>{throw h.__danavaDb=void 0,a})),h.__danavaDb}async function l(a,b=!1){let c=await a.get("SELECT json, revision, published_revision, draft_json, draft_revision FROM content WHERE id=1"+(b&&"mysql"===a.kind?" FOR UPDATE":""));if(!c)return{data:(0,e.g)(d.Q),revision:0,publishedRevision:0,draftRevision:0,hasDraft:!1,exists:!1};let f=JSON.parse(c.json);if(!(0,d.F)(f))throw Error("Nội dung lưu trữ không hợp lệ");return{data:(0,e.g)(f),revision:Number(c.revision),publishedRevision:Number(c.published_revision||c.revision),draftRevision:Number(c.draft_revision||c.revision),hasDraft:!!c.draft_json,exists:!0}}async function m(){let{exists:a,...b}=await l(await k());return b}a.s(["r",0,k,"p",0,m])}];

//# sourceMappingURL=lib_database_ts_1vm8fwfqfivlt._.js.map