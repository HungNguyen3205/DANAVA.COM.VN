import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {db} from './database';
export const configured=()=>!!process.env.DANAVA_ADMIN_PASSWORD_HASH;
const digest=(s:string)=>createHash('sha256').update(s+String(process.env.DANAVA_ADMIN_PASSWORD_HASH||'')).digest('hex');
export function passwordMatches(password:string){const [salt,hash]=String(process.env.DANAVA_ADMIN_PASSWORD_HASH||'').split(':');if(!salt||!hash||! /^[a-f0-9]{128}$/.test(hash))return false;const actual=scryptSync(password,salt,64);return timingSafeEqual(actual,Buffer.from(hash,'hex'));}
export async function session(){const token=(await cookies()).get('danava_session')?.value;if(!token)return null;return db().prepare('SELECT csrf,expires FROM sessions WHERE token=? AND expires>?').get(digest(token),Date.now()) as {csrf:string;expires:number}|undefined;}
export function newSession(){const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex'),expires=Date.now()+8*3600_000;db().prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db().prepare('INSERT INTO sessions(token,csrf,expires) VALUES(?,?,?)').run(digest(token),csrf,expires);return{token,csrf,expires};}
export async function logout(){const token=(await cookies()).get('danava_session')?.value;if(token)db().prepare('DELETE FROM sessions WHERE token=?').run(digest(token));}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');const expected=new URL(process.env.SITE_URL||req.url).origin;return origin===expected;}
export async function authorizedMutation(req:Request){const s=await session();return !!s&&sameOrigin(req)&&req.headers.get('x-csrf-token')===s.csrf;}
export function loginAllowed(){const now=Date.now();db().prepare('DELETE FROM attempts WHERE until<?').run(now);const key='admin-login';const row=db().prepare('SELECT count FROM attempts WHERE id=?').get(key) as {count:number}|undefined;if(row&&row.count>=10)return false;db().prepare('INSERT INTO attempts(id,count,until) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1').run(key,now+15*60_000);return true;}
