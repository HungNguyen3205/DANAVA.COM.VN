import '../fonts.css';
import '../globals.css';
import './admin-studio.css';
import './admin-login.css';
import './admin-ui.css';
import AdminGate from '@/components/AdminGate';

/**
 * CMS: stylesheet admin (website công khai không nạp các file này).
 * AdminGate đặt ở layout để giữ nguyên khi chuyển giữa các mục /admin/…: phiên chỉ kiểm tra và nội dung chỉ tải một lần,
 * không hiện lại màn đăng nhập mỗi lần chuyển trang.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
