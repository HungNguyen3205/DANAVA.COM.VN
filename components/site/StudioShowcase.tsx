import { QrCode, CalendarCheck, Users } from 'lucide-react';

/** Màn hình DANAVA Studio kèm 3 thẻ tính năng nổi — dùng ở trang chủ và /giai-phap/danava-studio/. */
export function StudioShowcase({ image = '/assets/presentation/studio-dashboard.webp', priority = false, className = '' }: {
  image?: string; priority?: boolean; className?: string;
}) {
  return (
    <div className={`s-home-hero__media s-studio-show ${className}`}>
      <div className="s-frame s-home-hero__frame">
        <img src={image} alt="Màn hình tổng quan phần mềm DANAVA Studio" {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
      </div>
      <div className="s-home-float s-home-float--1" aria-hidden="true">
        <span className="s-icon"><QrCode /></span>
        <span><strong>Check-in QR</strong><small>Không chạm, ngay tại quầy</small></span>
      </div>
      <div className="s-home-float s-home-float--2" aria-hidden="true">
        <span className="s-icon s-icon--orange"><CalendarCheck /></span>
        <span><strong>Lịch lớp & đặt chỗ</strong><small>Cập nhật theo thời gian thực</small></span>
      </div>
      <div className="s-home-float s-home-float--3" aria-hidden="true">
        <span className="s-icon s-icon--green"><Users /></span>
        <span><strong>Hội viên</strong><small>Gói tập, hạn thẻ, gia hạn</small></span>
      </div>
    </div>
  );
}
