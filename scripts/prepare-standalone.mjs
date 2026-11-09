import{cp,mkdir}from'node:fs/promises';
await mkdir('.next/standalone/.next',{recursive:true});
await cp('public','.next/standalone/public',{recursive:true});
await cp('.next/static','.next/standalone/.next/static',{recursive:true});
try {
  await cp('node_modules/@img', '.next/standalone/node_modules/@img', { recursive: true });
} catch {}
console.log('Standalone server assets prepared.');
