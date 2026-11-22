import {NextResponse} from 'next/server';
import {configured,session,sameOrigin,passwordMatches,newSession,logout,loginAllowed,clearLoginAttempts} from '@/lib/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const s=await session();return NextResponse.json({configured:configured(),authenticated:!!s,csrf:s?.csrf},{headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){if(!configured())return NextResponse.json({error:'Chưa cấu hình tài khoản quản trị trên máy chủ.'},{status:503});if(!sameOrigin(req))return new Response(null,{status:403});if(!await loginAllowed())return NextResponse.json({error:'Quá nhiều lần thử. Hãy thử lại sau 15 phút.'},{status:429});if(Number(req.headers.get('content-length')||0)>4096)return new Response(null,{status:413});try{const{password}=await req.json();if(typeof password!=='string'||password.length>256||!passwordMatches(password))return NextResponse.json({error:'Thông tin đăng nhập không đúng.'},{status:401});await clearLoginAttempts();const s=await newSession().catch(()=>null);if(!s)return NextResponse.json({error:'Chưa đăng nhập được vì máy chủ không ghi được phiên. Hãy thử lại sau ít phút.'},{status:503});const response=NextResponse.json({authenticated:true,csrf:s.csrf});response.cookies.set('danava_session',s.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:8*3600});return response;}catch{return new Response(null,{status:400})}}
export async function DELETE(req:Request){
  if(!sameOrigin(req))return new Response(null,{status:403});
  try{if(!await logout(req.headers.get('x-csrf-token')))return new Response(null,{status:403});}
  catch{return NextResponse.json({error:'Chưa đăng xuất được vì máy chủ không truy cập được dữ liệu.'},{status:503});}
  const r=NextResponse.json({ok:true});r.cookies.set('danava_session','',{maxAge:0,path:'/'});return r;
}
