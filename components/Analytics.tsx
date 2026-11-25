'use client';
import{useEffect,useState}from'react';import{usePathname}from'next/navigation';import Link from'next/link';import{useSite}from'./SiteStore';import{ct}from'./site/cms';
export default function Analytics(){const{data}=useSite();const t=(k:string,d:string)=>ct(data,'consent.'+k,d,'Thanh đồng ý đo lường',{scope:'global'});const path=usePathname(),[consent,setConsent]=useState<string|null>('loading');useEffect(()=>{try{setConsent(localStorage.getItem('danava-analytics-consent'))}catch{setConsent('no')}},[]);useEffect(()=>{if(consent!=='yes'||path.startsWith('/admin')||navigator.doNotTrack==='1')return;let disposed=false,stop=()=>{};fetch('/api/admin/session/',{cache:'no-store'}).then(r=>r.json()).then(auth=>{if(disposed||auth.authenticated)return;let visitor=localStorage.getItem('danava-visitor'),sid=sessionStorage.getItem('danava-session');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('danava-visitor',visitor)}if(!sid){sid=crypto.randomUUID();sessionStorage.setItem('danava-session',sid)}const id=crypto.randomUUID();let started=false;let seconds=0,lastActivity=Date.now(),lastTick=Date.now(),lastSent=Date.now();const send=()=>{if(started&&seconds<1)return;started=true;const body=JSON.stringify({id,visitor,session:sid,path,source:document.referrer,seconds:Math.min(30,Math.floor(seconds))});if(navigator.sendBeacon('/api/analytics/',new Blob([body],{type:'application/json'}))){seconds=0;lastSent=Date.now()}};const activity=()=>{lastActivity=Date.now()};const visibility=()=>{if(document.hidden)send()};send();const timer=setInterval(()=>{const now=Date.now();if(!document.hidden&&document.hasFocus()&&now-lastActivity<60_000)seconds+=Math.min(2,(now-lastTick)/1000);lastTick=now;if(now-lastSent>=15_000)send()},1000);['pointerdown','keydown','scroll','mousemove'].forEach(e=>addEventListener(e,activity,{passive:true}));document.addEventListener('visibilitychange',visibility);addEventListener('pagehide',send);stop=()=>{clearInterval(timer);send();['pointerdown','keydown','scroll','mousemove'].forEach(e=>removeEventListener(e,activity));document.removeEventListener('visibilitychange',visibility);removeEventListener('pagehide',send)}}).catch(()=>{});return()=>{disposed=true;stop()}},[path,consent]);function choose(value:string){try{localStorage.setItem('danava-analytics-consent',value)}catch{}setConsent(value);try{dispatchEvent(new Event('danava-consent'))}catch{}}if(path.startsWith('/admin')||consent)return null;
  const h=t('title','Mời bạn một miếng cookie nhé?'),
    x=t('body','DANAVA dùng cookie để hiểu bạn thích xem gì và làm web tốt hơn. Không ghi nội dung bạn nhập.'),
    m=t('policy','Chính sách bảo mật'),
    n=t('essential','Chỉ cần thiết'),
    y=t('accept','Đồng ý');
  return (
    <aside className="consent-banner" aria-label="Tùy chọn cookie">
      {/* Bánh quy cắn dở ló ra khỏi mép thẻ, lắc lư và rơi vụn */}
      <span className="consent-banner__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <defs>
            <mask id="cb-bite"><rect width="48" height="48" fill="#fff"/><circle cx="42" cy="8" r="8" fill="#000"/><circle cx="46" cy="17" r="5" fill="#000"/></mask>
          </defs>
          <g mask="url(#cb-bite)">
            <circle cx="23" cy="25" r="20" fill="#f5b65a"/>
            <circle cx="23" cy="25" r="20" fill="none" stroke="#e0973a" strokeWidth="2"/>
          </g>
          <g fill="#6b3d16">
            <circle cx="14" cy="20" r="2.6"/><circle cx="25" cy="14" r="2.2"/><circle cx="20" cy="32" r="2.5"/>
            <circle cx="31" cy="27" r="2.8"/><circle cx="11" cy="29" r="1.6"/><circle cx="29" cy="37" r="1.7"/>
          </g>
          <circle className="consent-banner__crumb" cx="38" cy="20" r="1.7" fill="#e0973a"/>
          <circle className="consent-banner__crumb consent-banner__crumb--2" cx="41" cy="23" r="1.2" fill="#f5b65a"/>
        </svg>
      </span>
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
