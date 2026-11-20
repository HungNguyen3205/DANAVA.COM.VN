import '../fonts.css';
import '../globals.css';
import './admin-studio.css';
import './admin-login.css';

/** CMS: stylesheet cũ (globals.css) + lớp giao diện DriveAdmin (admin-studio.css). Website công khai không nạp các file này. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
