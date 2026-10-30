import type{Metadata}from'next';import{SiteStore}from'@/components/SiteStore';import{Header,Footer}from'@/components/Shell';import './globals.css';
export const metadata:Metadata={title:{default:'DANAVA Solutions — Cùng bạn phát triển',template:'%s | DANAVA Solutions'},description:'Kết nối công nghệ, truyền thông, trải nghiệm và cộng đồng cùng DANAVA Solutions.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body><SiteStore><a className="skip-link" href="#main">Đến nội dung chính</a><Header/>{children}<Footer/></SiteStore></body></html>}
