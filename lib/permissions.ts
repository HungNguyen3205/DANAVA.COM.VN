/**
 * Vai trò và quyền trong trang quản trị. Dùng chung cho máy chủ (kiểm tra ở API) và giao diện (ẩn menu, nút).
 * Giao diện chỉ ẩn cho gọn; quyền thật luôn được kiểm tra lại ở API.
 */

export type Permission =
  | 'content.read'      // xem nội dung (kể cả bản nháp) trong admin
  | 'content.draft'     // lưu bản nháp
  | 'content.publish'   // xuất bản, khôi phục phiên bản, bỏ bản nháp
  | 'media.read'
  | 'media.write'
  | 'leads.read'
  | 'leads.write'
  | 'reports.read'
  | 'integrations.read' // trạng thái kết nối AI, khóa tích hợp (không bao giờ trả giá trị khóa)
  | 'users.manage'      // tài khoản & quyền
  | 'system.manage';    // sao lưu, nhập dữ liệu, khôi phục mặc định

export type Role = 'owner' | 'admin' | 'editor' | 'writer' | 'sales';

export const ROLES: Record<Role, { label: string; desc: string; perms: Permission[] }> = {
  owner: {
    label: 'Chủ website',
    desc: 'Đăng nhập bằng mật khẩu quản trị trên máy chủ. Toàn quyền, không xóa được.',
    perms: ['content.read', 'content.draft', 'content.publish', 'media.read', 'media.write', 'leads.read', 'leads.write', 'reports.read', 'integrations.read', 'users.manage', 'system.manage']
  },
  admin: {
    label: 'Quản trị',
    desc: 'Toàn quyền nội dung, khách hàng, báo cáo, tài khoản và hệ thống.',
    perms: ['content.read', 'content.draft', 'content.publish', 'media.read', 'media.write', 'leads.read', 'leads.write', 'reports.read', 'integrations.read', 'users.manage', 'system.manage']
  },
  editor: {
    label: 'Biên tập',
    desc: 'Soạn, xuất bản nội dung và quản lý thư viện. Không xem khách hàng, không quản lý tài khoản.',
    perms: ['content.read', 'content.draft', 'content.publish', 'media.read', 'media.write', 'reports.read']
  },
  writer: {
    label: 'Cộng tác viên',
    desc: 'Soạn và lưu bản nháp, tải ảnh. Không xuất bản được.',
    perms: ['content.read', 'content.draft', 'media.read', 'media.write']
  },
  sales: {
    label: 'Kinh doanh',
    desc: 'Xem và xử lý yêu cầu tư vấn, xem báo cáo. Không sửa nội dung website.',
    perms: ['leads.read', 'leads.write', 'reports.read']
  }
};

export const ASSIGNABLE_ROLES: Role[] = ['admin', 'editor', 'writer', 'sales'];

export const isRole = (v: unknown): v is Role => typeof v === 'string' && v in ROLES;

export function can(role: Role | null | undefined, perm: Permission) {
  return !!role && ROLES[role].perms.includes(perm);
}
