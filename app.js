import {clamp,progressFor,chapterOpacity,activeChapter} from './scroll.js';
const $=s=>document.querySelector(s),journey=$('.journey'),stage=$('.stage'),chapters=[...document.querySelectorAll('.chapter')],world=$('.world'),logo=$('.hero-logo'),screen=$('.screen-wrap'),founder=$('.founder-placeholder'),ecosystem=$('.ecosystem'),header=$('.header');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let current=0,target=0,frame=0,start=0,height=1,viewport=1;
const labels=['KHỞI ĐẦU / DANAVA','01 / CÔNG NGHỆ','02 / CON NGƯỜI','03 / HỆ SINH THÁI','CÙNG BẠN PHÁT TRIỂN'];
function measure(){start=journey.getBoundingClientRect().top+window.scrollY;height=journey.offsetHeight;viewport=innerHeight;update();}
function paint(p){stage.style.setProperty('--progress',p);const active=activeChapter(p);chapters.forEach((el,i)=>{const opacity=chapterOpacity(p,i);el.style.opacity=opacity;el.style.transform=`translateY(calc(-43% + ${(1-opacity)*28}px))`;el.style.pointerEvents=opacity>.5?'auto':'none';el.setAttribute('aria-hidden',String(active!==i));el.querySelectorAll('a').forEach(a=>a.tabIndex=active===i?0:-1);});
world.style.transform=`scale(${1.37-p*.37}) translate3d(${(p-.5)*-20}px,${p*-10}px,0)`;
logo.style.opacity=clamp(1-p*5);logo.style.transform=`perspective(1000px) translate3d(${p*400}px,${-p*300}px,0) rotateY(${-20+p*80}deg) rotateZ(${-7+p*10}deg) scale(${1-p*1.6})`;
const s=chapterOpacity(p,1);screen.style.opacity=s;screen.style.transform=`perspective(1200px) translate3d(${(1-s)*150}px,${(1-s)*65}px,0) rotateY(${-15+(1-s)*30}deg) rotateZ(-2deg) scale(${.86+s*.14})`;
const f=chapterOpacity(p,2);founder.style.opacity=f;founder.style.transform=`translate3d(${(1-f)*100}px,${(1-f)*35}px,0) scale(${.9+f*.1})`;
const e=chapterOpacity(p,3);ecosystem.style.opacity=e;ecosystem.style.transform=`translate(-50%,-50%) scale(${.7+e*.3}) rotate(${(1-e)*-10}deg)`;
$('.progress-number').textContent=`${String(Math.round(p*100)).padStart(2,'0')}%`;$('.chapter-label').textContent=labels[active];}
function tick(){current+=(target-current)*.12;if(Math.abs(current-target)<.0001)current=target;paint(current);if(current!==target)frame=requestAnimationFrame(tick);else frame=0;}
function update(){header.classList.toggle('scrolled',scrollY>40);if(reduced.matches){if(frame)cancelAnimationFrame(frame);frame=0;return;}target=progressFor(scrollY,start,height,viewport);if(!frame)frame=requestAnimationFrame(tick);}
addEventListener('scroll',update,{passive:true});addEventListener('resize',measure);reduced.addEventListener('change',()=>{measure();if(!reduced.matches)paint(target);});
const menu=$('.menu-button'),nav=$('#main-nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Đóng menu':'Mở menu');nav.classList.toggle('open',open);});
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Mở menu');nav.classList.remove('open');}nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const people=[{name:'Lê Tấn Thành',role:'Founder & CEO'},{name:'Phạm Trang',role:'Trưởng phòng CSKH'},{name:'Trần Văn Nam',role:'Marketing Director'},{name:'Avinash Saini',role:'Creative Director'},{name:'Đặng Ngọc Thông',role:'Manager'}];
function renderTeam(staff){const list=$('#team-list');list.replaceChildren();staff.forEach(person=>{const card=document.createElement('article');card.className='team-person';const monogram=document.createElement('div');monogram.className='team-initials';monogram.setAttribute('aria-hidden','true');monogram.textContent=person.name.split(' ').map(x=>x[0]).slice(-2).join('');const name=document.createElement('h3');name.textContent=person.name;const role=document.createElement('p');role.textContent=person.role;card.append(monogram,name,role);list.append(card);});}
renderTeam(people);fetch('content/site.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json();}).then(data=>{if(Array.isArray(data.staff))renderTeam(data.staff);}).catch(()=>{/* Keep the complete built-in content if offline. */});
$('#year').textContent=new Date().getFullYear();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.intro-heading,.service-list,.studio-layout,.human-layout,.team-heading,.team-list').forEach(el=>{el.classList.add('reveal');observer.observe(el);});}
measure();paint(0);
