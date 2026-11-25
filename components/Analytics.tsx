'use client';
import{useEffect,useState}from'react';import{usePathname}from'next/navigation';import Link from'next/link';import{Cookie}from'lucide-react';import{useSite}from'./SiteStore';import{ct}from'./site/cms';
export default function Analytics(){const{data}=useSite();const t=(k:string,d:string)=>ct(data,'consent.'+k,d,'Thanh đồng ý đo lường',{scope:'global'});const path=usePathname(),[consent,setConsent]=useState<string|null>('loading');useEffect(()=>{try{setConsent(localStorage.getItem('danava-analytics-consent'))}catch{setConsent('no')}},[]);useEffect(()=>{if(consent!=='yes'||path.startsWith('/admin')||navigator.doNotTrack==='1')return;let disposed=false,stop=()=>{};fetch('/api/admin/session/',{cache:'no-store'}).then(r=>r.json()).then(auth=>{if(disposed||auth.authenticated)return;let visitor=localStorage.getItem('danava-visitor'),sid=sessionStorage.getItem('danava-session');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('danava-visitor',visitor)}if(!sid){sid=crypto.randomUUID();sessionStorage.setItem('danava-session',sid)}const id=crypto.randomUUID();let started=false;let seconds=0,lastActivity=Date.now(),lastTick=Date.now(),lastSent=Date.now();const send=()=>{if(started&&seconds<1)return;started=true;const body=JSON.stringify({id,visitor,session:sid,path,source:document.referrer,seconds:Math.min(30,Math.floor(seconds))});if(navigator.sendBeacon('/api/analytics/',new Blob([body],{type:'application/json'}))){seconds=0;lastSent=Date.now()}};const activity=()=>{lastActivity=Date.now()};const visibility=()=>{if(document.hidden)send()};send();const timer=setInterval(()=>{const now=Date.now();if(!document.hidden&&document.hasFocus()&&now-lastActivity<60_000)seconds+=Math.min(2,(now-lastTick)/1000);lastTick=now;if(now-lastSent>=15_000)send()},1000);['pointerdown','keydown','scroll','mousemove'].forEach(e=>addEventListener(e,activity,{passive:true}));document.addEventListener('visibilitychange',visibility);addEventListener('pagehide',send);stop=()=>{clearInterval(timer);send();['pointerdown','keydown','scroll','mousemove'].forEach(e=>removeEventListener(e,activity));document.removeEventListener('visibilitychange',visibility);removeEventListener('pagehide',send)}}).catch(()=>{});return()=>{disposed=true;stop()}},[path,consent]);function choose(value:string){try{localStorage.setItem('danava-analytics-consent',value)}catch{}setConsent(value)}if(path.startsWith('/admin')||consent)return null;
  const h=t('title','Chúng tôi quan tâm đến sự riêng tư của bạn'),
    x=t('body','Chúng tôi dùng cookie để cải thiện trải nghiệm và phân tích lưu lượng truy cập. Không ghi nội dung biểu mẫu bạn nhập.'),
    m=t('policy','Chính sách bảo mật'),
    n=t('essential','Chỉ cần thiết'),
    y=t('accept','Đồng ý tất cả');
  return (
    <aside className="consent-banner" aria-label="Tùy chọn cookie">
      <span className="consent-banner__icon" aria-hidden="true"><Cookie/></span>
      <div className="consent-banner__body">
        <p className="consent-banner__title"><span {...h.a}>{h.v}</span></p>
        <p className="consent-banner__text"><span {...x.a}>{x.v}</span> <Link href="/chinh-sach-rieng-tu/"><span {...m.a}>{m.v}</span></Link></p>
      </div>
      <div className="consent-banner__actions">
        <button type="button" className="consent-banner__btn consent-banner__btn--ghost" onClick={()=>choose('no')}><span {...n.a}>{n.v}</span></button>
        <button type="button" className="consent-banner__btn consent-banner__btn--accept" onClick={()=>choose('yes')}><span {...y.a}>{y.v}</span></button>
      </div>
    </aside>
  );
}
