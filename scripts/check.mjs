import {readFile,access} from 'node:fs/promises';
const html=await readFile('index.html','utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw Error('Duplicate HTML IDs');
for(const [,id]of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(id))throw Error(`Missing anchor ${id}`);
for(const [,path]of html.matchAll(/(?:src|href)="((?:assets\/|styles|app)[^"]*)"/g))await access(path);
await access('assets/studio-scene.webp');
const content=JSON.parse(await readFile('content/site.json','utf8'));if(content.staff.length!==5)throw Error('Expected source website five staff profiles');
console.log(`Passed: ${ids.length} unique section anchors, local resources, brand asset and content.`);
