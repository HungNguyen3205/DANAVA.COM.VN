import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','app.js','scroll.js','assets','content'])await cp(file,`dist/${file}`,{recursive:true});
console.log('Built static site in dist/ — ready for cPanel.');
