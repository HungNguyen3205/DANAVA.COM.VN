import{legacyCatalog}from'./legacy-catalog.ts';
export const archivedPosts:Record<string,{body:string;date:string;source:string}>=Object.fromEntries(legacyCatalog.map(p=>[p.id,{body:p.body,date:p.date,source:p.source}]));
