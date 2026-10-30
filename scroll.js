export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export function progressFor(scrollTop,start,height,viewport){return clamp((scrollTop-start)/Math.max(1,height-viewport));}
// Brief crossfades between long readable holds. Adjacent weights always sum to one.
export function chapterOpacity(p,index){const boundaries=[.12,.355,.59,.825],width=.035;const incoming=index===0?1:clamp((p-boundaries[index-1]+width)/(2*width));const outgoing=index===4?1:1-clamp((p-boundaries[index]+width)/(2*width));return Math.min(incoming,outgoing);}
export function activeChapter(p){let best=0;for(let i=1;i<5;i++)if(chapterOpacity(p,i)>chapterOpacity(p,best))best=i;return best;}
