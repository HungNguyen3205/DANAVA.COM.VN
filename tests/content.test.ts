import test,{after} from'node:test';import{closeDb}from'../lib/database.ts';after(()=>closeDb());import assert from'node:assert/strict';import{initial,readSaved,validateContent}from'../lib/content.ts';
test('default content and round-trip backup stay valid',()=>{assert.equal(validateContent(initial),true);assert.deepEqual(readSaved(JSON.stringify(initial)),initial);});
test('malformed or incompatible backups do not destroy the fallback',()=>{for(const value of ['{','null','[]','{"version":2}',JSON.stringify({...initial,staff:[{name:'Wrong'}]})])assert.deepEqual(readSaved(value),initial);});
test('duplicate records and invalid dynamic article slugs are rejected',()=>{assert.equal(validateContent({...initial,staff:[initial.staff[0],initial.staff[0]]}),false);assert.equal(validateContent({...initial,posts:[{...initial.posts[0],slug:'../admin'}]}),false);assert.equal(validateContent({...initial,headline:'x'.repeat(151)}),false);});
test('a new draft and edited business metrics can be exported',()=>{const data=structuredClone(initial);data.posts.push({id:'new-post',slug:'new-post',title:'Bài viết thử',category:'Kiến thức',date:'',body:'Văn bản thuần',published:false});data.metrics[0]={...data.metrics[0],value:'12',visible:true};assert.equal(validateContent(data),true);});

test('staff photos accept existing local images and reject external or traversing paths',()=>{const data=structuredClone(initial);data.staff[0].image='/assets/legacy/founder.webp';assert.equal(validateContent(data),true);data.staff[0].image='javascript:alert(1)';assert.equal(validateContent(data),false);data.staff[0].image='/assets/../secret.png';assert.equal(validateContent(data),false);data.staff[0].image='';assert.equal(validateContent(data),true);});

test('projects import accepts the template and rejects duplicate slugs and unsafe images',()=>{const p={id:'p1',slug:'du-an-thu',title:'Dự án thử',category:'Website',client:'',summary:'',challenge:'',solution:'',result:'',image:'/assets/legacy/website.webp',published:false,featured:false};assert.equal(validateContent({...initial,projects:[p]}),true);assert.equal(validateContent({...initial,projects:[p,{...p,id:'p2'}]}),false);assert.equal(validateContent({...initial,projects:[{...p,image:'https://invalid.example/x.png'}]}),false);assert.equal(validateContent({...initial,projects:[{...p,slug:'../admin'}]}),false);});

test('published articles require real text and valid calendar dates',()=>{assert.equal(validateContent({...initial,posts:[{...initial.posts[0],date:'2026-02-30'}]}),false);assert.equal(validateContent({...initial,posts:[{...initial.posts[0],title:'  '}]}),false);assert.equal(validateContent({...initial,posts:[{...initial.posts[0],body:'',published:false}]}),true);});

test('presentation settings keep old imports compatible and validate ecosystem and image paths',()=>{const old=structuredClone(initial);delete old.presentation;assert.equal(validateContent(old),true);const data=structuredClone(initial);assert.equal(data.presentation?.ecosystem.length,5);assert.ok(!data.presentation?.ecosystem.some(i=>i.id==='digital'));data.presentation!.screenImage='/assets/uploads/12345678-1234-1234-1234-123456789abc.webp';assert.equal(validateContent(data),true);data.presentation!.ecosystem.push(data.presentation!.ecosystem[0]);assert.equal(validateContent(data),false);data.presentation!.ecosystem.pop();data.presentation!.screenImage='https://external.example/image.png';assert.equal(validateContent(data),false);});

test('source-backed catalogue has complete text, safe provenance and unique published routes',()=>{assert.equal(initial.posts.length,30);assert.equal(initial.projects?.length,2);assert.ok(initial.posts.every(p=>p.body.trim().length>0&&p.source?.startsWith('https://danava.com.vn/')));assert.ok(initial.projects?.every(p=>p.source?.startsWith('https://danava.vn/blog/')));const data=structuredClone(initial);data.projects![0].source='javascript:alert(1)';assert.equal(validateContent(data),false);});

test('lead storage and database published/draft revisions work correctly',async()=>{
  const {saveLead, getLeads, getContent, writeContent} = await import('../lib/database.ts');
  const leadId = await saveLead({
    name: 'Khách hàng thử nghiệm',
    email: 'khachhang@example.com',
    phone: '0905123456',
    service: 'DANAVA Studio',
    message: 'Cần tư vấn triển khai phần mềm cho phòng tập.'
  });
  assert.ok(leadId.startsWith('lead_'));
  const leads = await getLeads(10);
  assert.ok(leads.some(l => l.email === 'khachhang@example.com' && l.name === 'Khách hàng thử nghiệm'));

  const initialContent = await getContent();
  assert.ok(typeof initialContent.revision === 'number');
  assert.ok(typeof initialContent.publishedRevision === 'number');
  assert.ok(typeof initialContent.draftRevision === 'number');

  // Test draftOnly write
  const draftData = structuredClone(initialContent.data);
  draftData.headline = 'Tiêu đề bản nháp mới';
  const draftRev = await writeContent(draftData, initialContent.revision, { draftOnly: true });
  assert.ok(draftRev !== null);
  const updatedContent = await getContent();
  assert.equal(updatedContent.hasDraft, true);

  // Test publish write
  const pubRev = await writeContent(draftData, initialContent.revision);
  assert.ok(pubRev !== null);
  const finalContent = await getContent();
  assert.equal(finalContent.hasDraft, false);
  assert.equal(finalContent.data.headline, 'Tiêu đề bản nháp mới');

  // Restore initial headline to preserve clean state
  const resetRev = await writeContent(initialContent.data, finalContent.revision);
  assert.ok(resetRev !== null);
});
