import{initial}from'@/lib/content';import{ArticlePage}from'@/components/PublicPages';export function generateStaticParams(){return initial.posts.map(p=>({slug:p.slug}));}export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <ArticlePage slug={slug}/>;}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return {title:initial.posts.find(item=>item.slug===slug)?.title||'DANAVA'};}
