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
CREATE INDEX IF NOT EXISTS visits_started ON visits(started);`,h=[{version:1,name:"phien-ban-noi-dung-tai-khoan-nhat-ky",mysql:[`CREATE TABLE IF NOT EXISTS content_revisions (
        id VARCHAR(64) PRIMARY KEY,
        revision INT NOT NULL,
        kind VARCHAR(16) NOT NULL,
        json LONGTEXT NOT NULL,
        created_at BIGINT NOT NULL,
        author_id VARCHAR(64) NULL,
        author_name VARCHAR(150) NULL,
        note VARCHAR(500) NULL,
        INDEX content_revisions_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,`CREATE TABLE IF NOT EXISTS users (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,`CREATE TABLE IF NOT EXISTS audit_log (
        id VARCHAR(64) PRIMARY KEY,
        at BIGINT NOT NULL,
        actor_id VARCHAR(64) NULL,
        actor_name VARCHAR(150) NULL,
        action VARCHAR(64) NOT NULL,
        target VARCHAR(255) NULL,
        detail TEXT NULL,
        INDEX audit_log_at (at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,"ALTER TABLE sessions ADD COLUMN user_id VARCHAR(64) NULL","ALTER TABLE sessions ADD COLUMN role VARCHAR(16) NULL","ALTER TABLE sessions ADD COLUMN name VARCHAR(150) NULL","ALTER TABLE content ADD COLUMN draft_updated_at BIGINT NULL","ALTER TABLE content ADD COLUMN draft_author VARCHAR(150) NULL"],sqlite:["CREATE TABLE IF NOT EXISTS content_revisions (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, kind TEXT NOT NULL, json TEXT NOT NULL, created_at INTEGER NOT NULL, author_id TEXT, author_name TEXT, note TEXT)","CREATE INDEX IF NOT EXISTS content_revisions_created ON content_revisions(created_at)","CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, last_login INTEGER)","CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, at INTEGER NOT NULL, actor_id TEXT, actor_name TEXT, action TEXT NOT NULL, target TEXT, detail TEXT)","CREATE INDEX IF NOT EXISTS audit_log_at ON audit_log(at)","ALTER TABLE sessions ADD COLUMN user_id TEXT","ALTER TABLE sessions ADD COLUMN role TEXT","ALTER TABLE sessions ADD COLUMN name TEXT","ALTER TABLE content ADD COLUMN draft_updated_at INTEGER","ALTER TABLE content ADD COLUMN draft_author TEXT"],data:async a=>{let b=await a.get("SELECT json, revision FROM content WHERE id=1");!b||(await a.run("UPDATE content SET draft_revision=revision WHERE id=1 AND draft_revision<revision"),await a.get("SELECT id FROM content_revisions LIMIT 1")||await a.run("INSERT INTO content_revisions(id, revision, kind, json, created_at, author_id, author_name, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",["rev_baseline_"+Number(b.revision),Number(b.revision),"baseline",b.json,Date.now(),"system","Hệ thống","Phiên bản công khai tại thời điểm nâng cấp hệ quản trị"]))}},{version:2,name:"phuong-an-phong-tap",mysql:[`CREATE TABLE IF NOT EXISTS gym_designs (
        code VARCHAR(16) PRIMARY KEY,
        token_hash VARCHAR(64) NOT NULL,
        version INT NOT NULL,
        json LONGTEXT NOT NULL,
        preview MEDIUMTEXT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        INDEX gym_designs_updated (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`],sqlite:["CREATE TABLE IF NOT EXISTS gym_designs (code TEXT PRIMARY KEY, token_hash TEXT NOT NULL, version INTEGER NOT NULL, json TEXT NOT NULL, preview TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)","CREATE INDEX IF NOT EXISTS gym_designs_updated ON gym_designs(updated_at)"]}],i=/duplicate column|already exists|ER_DUP_FIELDNAME|ER_TABLE_EXISTS/i;async function j(a){"mysql"===a.kind?await a.run("CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, name VARCHAR(200) NOT NULL, applied_at BIGINT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"):await a.run("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at INTEGER NOT NULL)");let b=new Set((await a.all("SELECT version FROM schema_migrations")).map(a=>Number(a.version)));for(let c of h)if(!b.has(c.version)){for(let b of"mysql"===a.kind?c.mysql:c.sqlite)try{await a.run(b)}catch(a){if(!i.test(String(a?.message||a)))throw a}c.data&&await c.data(a);try{await a.run("INSERT INTO schema_migrations(version, name, applied_at) VALUES(?, ?, ?)",[c.version,c.name,Date.now()])}catch{}}}let k=globalThis;async function l(){let b=(await a.A(66549)).createPool({host:process.env.DANAVA_DB_HOST,port:Number(process.env.DANAVA_DB_PORT||3306),database:process.env.DANAVA_DB_NAME,user:process.env.DANAVA_DB_USER,password:process.env.DANAVA_DB_PASSWORD||"",charset:"utf8mb4_unicode_ci",connectionLimit:5,decimalNumbers:!0,supportBigNumbers:!0,bigNumberStrings:!1});b.on("connection",a=>{a.query("SET time_zone='+07:00'")});let c=(a,b)=>({kind:"mysql",all:async(b,c=[])=>(await a.query(b,c))[0],get:async(b,c=[])=>(await a.query(b,c))[0][0],run:async(b,c=[])=>{await a.query(b,c)},tx:b}),g=async a=>{let d=await b.getConnection();try{await d.beginTransaction();let b=await a(c(d,()=>{throw Error("Nested transaction")}));return await d.commit(),b}catch(a){try{await d.rollback()}catch{}throw a}finally{d.release()}},h=c(b,g);for(let a of(k.__danavaClose=()=>b.end(),f))await h.run(a);if(!await h.get("SELECT id FROM content WHERE id=1"))try{await h.run("INSERT INTO content(id, json, revision, published_revision, draft_revision) VALUES(1, ?, 1, 1, 1)",[JSON.stringify((0,e.g)(d.Q)).normalize("NFC")])}catch{}return await j(h),h}async function m(){let{DatabaseSync:d}=await Promise.resolve().then(()=>a.x("node:sqlite",()=>require("node:sqlite"),!0)),e=process.env.VERCEL?process.env.DANAVA_DATA_DIR&&process.env.DANAVA_DATA_DIR.startsWith("/tmp")?process.env.DANAVA_DATA_DIR:"/tmp/.data":(0,c.resolve)(process.env.DANAVA_DATA_DIR||".data");(0,b.mkdirSync)(e,{recursive:!0,mode:448});let f=new d((0,c.resolve)(e,"danava.sqlite"),{timeout:5e3});for(let a of(f.exec(g),["ALTER TABLE content ADD COLUMN published_revision INTEGER NOT NULL DEFAULT 1","ALTER TABLE content ADD COLUMN draft_json TEXT","ALTER TABLE content ADD COLUMN draft_revision INTEGER NOT NULL DEFAULT 1","ALTER TABLE leads ADD COLUMN business_type TEXT","ALTER TABLE leads ADD COLUMN source TEXT","ALTER TABLE leads ADD COLUMN assigned_to TEXT","ALTER TABLE leads ADD COLUMN assigned_note TEXT"]))try{f.exec(a)}catch{}let h={kind:"sqlite",all:async(a,b=[])=>f.prepare(a).all(...b),get:async(a,b=[])=>f.prepare(a).get(...b),run:async(a,b=[])=>{f.prepare(a).run(...b)},tx:async a=>{f.exec("BEGIN IMMEDIATE");try{let b=await a(h);return f.exec("COMMIT"),b}catch(a){try{f.exec("ROLLBACK")}catch{}throw a}}};return k.__danavaClose=async()=>f.close(),await j(h),h}function n(){return k.__danavaDb||(k.__danavaDb=(process.env.DANAVA_DB_HOST&&process.env.DANAVA_DB_NAME&&process.env.DANAVA_DB_USER?l():m()).catch(a=>{throw k.__danavaDb=void 0,a})),k.__danavaDb}async function o(a,b=!1){return a.get("SELECT json, revision, published_revision, draft_json, draft_revision, draft_updated_at, draft_author FROM content WHERE id=1"+(b&&"mysql"===a.kind?" FOR UPDATE":""))}async function p(a,b=!1,c=!1){let f=await o(a,b);return f?{data:function(a){let b=JSON.parse(a);if(!(0,d.F)(b))throw Error("Nội dung lưu trữ không hợp lệ");return(0,e.g)(b)}(c&&f.draft_json?f.draft_json:f.json),revision:Math.max(Number(f.revision),Number(f.draft_revision||0)),publishedRevision:Number(f.published_revision||f.revision),draftRevision:Number(f.draft_revision||f.revision),hasDraft:!!f.draft_json,draftUpdatedAt:f.draft_updated_at?Number(f.draft_updated_at):null,draftAuthor:f.draft_author||null,exists:!0}:{data:(0,e.g)(d.Q),revision:0,publishedRevision:0,draftRevision:0,hasDraft:!1,exists:!1}}async function q(){let{exists:a,...b}=await p(await n());return b}async function r(){let b=await t()?await u():await q(),c=await s(),e=(0,d.s)(b.data);if("vi"!==c){let{localizeSite:b}=await a.A(27712);e=b(e,c)}try{let{requestTexts:b}=await a.A(85909),c=b();c.texts=e.texts,c.view=e.localeView,c.phone=e.phone}catch{}return{...b,data:e}}async function s(){try{let{headers:b}=await a.A(23804),c=(await b()).get("x-danava-locale");return"en"===c||"ja"===c?c:"vi"}catch{return"vi"}}async function t(){try{let{headers:b}=await a.A(23804);if("1"!==(await b()).get("x-danava-cms"))return!1;let{canPreview:c}=await a.A(76958);return await c()}catch{return!1}}async function u(){let{exists:a,...b}=await p(await n(),!1,!0);return b}a.s(["r",0,n,"O",0,r,"h",0,u,"c",0,s])}];

//# sourceMappingURL=lib_database_ts_1vm8fwfqfivlt._.js.map