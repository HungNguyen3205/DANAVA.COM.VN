import type{Metadata}from'next';
export const siteURL=(process.env.SITE_URL||'https://danava.com.vn').replace(/\/$/,'');
export function seo(title:string,description:string,path:string,image='/assets/danava-logo.png'):Metadata{return{title,description,alternates:{canonical:siteURL+path},openGraph:{type:'website',locale:'vi_VN',siteName:'DANAVA Solutions',title,description,url:siteURL+path,images:[{url:siteURL+image,alt:title}]},twitter:{card:'summary_large_image',title,description,images:[siteURL+image]}}}
export function jsonLD(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c')}
