import{resolve,join}from'node:path';import{mkdir,readdir,stat}from'node:fs/promises';
export async function mediaDirectory(){const baseDir=process.env.VERCEL?(process.env.DANAVA_DATA_DIR&&process.env.DANAVA_DATA_DIR.startsWith('/tmp')?process.env.DANAVA_DATA_DIR:'/tmp/.data'):resolve(/* turbopackIgnore: true */ process.env.DANAVA_DATA_DIR||'.data');const root=resolve(baseDir,'media');await mkdir(root,{recursive:true,mode:0o700});return root}
export const validMediaName=(name:string)=>/^[a-f0-9-]{36}\.webp$/.test(name);
/** Mô hình 3D thiết bị phòng gym (glTF nhị phân) */
export const validModelName=(name:string)=>/^[a-f0-9-]{36}\.glb$/.test(name);
export async function listMedia(){const root=await mediaDirectory();const names=(await readdir(root)).filter(validMediaName);return(await Promise.all(names.map(async name=>{const info=await stat(join(root,name));return{name,url:`/assets/uploads/${name}`,bytes:info.size,created:info.mtime.toISOString()}}))).sort((a,b)=>b.created.localeCompare(a.created))}
