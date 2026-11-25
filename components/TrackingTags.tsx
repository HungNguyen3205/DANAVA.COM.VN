'use client';
/**
 * Mã theo dõi bên ngoài (Quản trị → Cài đặt website → Theo dõi): Google Analytics 4, Google Tag Manager, Meta Pixel.
 * Chỉ nạp khi khách đã bấm "Đồng ý" ở bảng cookie (localStorage danava-analytics-consent = yes) và không nạp trong /admin.
 * Analytics.tsx phát sự kiện "danava-consent" khi khách chọn → nạp ngay, không cần tải lại trang.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSite } from './SiteStore';
import { TRACKING_RULES } from '@/lib/content';

const readConsent = () => { try { return localStorage.getItem('danava-analytics-consent') === 'yes'; } catch { return false; } };

function addScript(id: string, attrs: { src?: string; text?: string }) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  if (attrs.src) s.src = attrs.src;
  if (attrs.text) s.text = attrs.text;
  document.head.appendChild(s);
}

export default function TrackingTags() {
  const { data } = useSite();
  const path = usePathname();
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    setConsent(readConsent());
    const on = () => setConsent(readConsent());
    addEventListener('danava-consent', on);
    addEventListener('storage', on);
    return () => { removeEventListener('danava-consent', on); removeEventListener('storage', on); };
  }, []);

  const t = data.tracking || {};
  // Kiểm tra lại định dạng trước khi chèn vào script (phòng dữ liệu sai lọt qua)
  const ga4 = t.ga4 && TRACKING_RULES.ga4.test(t.ga4) ? t.ga4 : '';
  const gtm = t.gtm && TRACKING_RULES.gtm.test(t.gtm) ? t.gtm : '';
  const pixel = t.metaPixel && TRACKING_RULES.metaPixel.test(t.metaPixel) ? t.metaPixel : '';

  useEffect(() => {
    if (!consent || path.startsWith('/admin') || navigator.doNotTrack === '1') return;
    if (ga4) {
      addScript('danava-ga4-lib', { src: `https://www.googletagmanager.com/gtag/js?id=${ga4}` });
      addScript('danava-ga4', { text: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}',{anonymize_ip:true});` });
    }
    if (gtm) addScript('danava-gtm', { text: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');` });
    if (pixel) addScript('danava-pixel', { text: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');` });
  }, [consent, path, ga4, gtm, pixel]);

  // Chuyển trang trong website (không tải lại): báo lượt xem trang cho GA4 / Pixel
  useEffect(() => {
    if (!consent || path.startsWith('/admin')) return;
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
    if (ga4 && w.gtag) w.gtag('event', 'page_view', { page_path: path });
    if (pixel && w.fbq) w.fbq('track', 'PageView');
  }, [path, consent, ga4, pixel]);

  return null;
}
