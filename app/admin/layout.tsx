import '../globals.css';
import './admin-studio.css';
import './admin-login.css';
import { siteFont } from '@/lib/site-font';

/** CMS: stylesheet cũ (globals.css) + lớp giao diện DriveAdmin (admin-studio.css). Website công khai không nạp các file này. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={siteFont.variable} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
