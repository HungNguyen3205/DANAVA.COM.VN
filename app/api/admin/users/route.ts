import { NextResponse } from 'next/server';
import { requirePermission, actorOf } from '@/lib/auth';
import { logAction } from '@/lib/database';
import { checkNewUser, createUser, deleteUser, getUser, listUsers, updateUser } from '@/lib/users';
import { ROLES, type Role } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store' };
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function GET(req: Request) {
  const user = await requirePermission(req, 'users.manage');
  if (user instanceof Response) return user;
  return NextResponse.json({ users: await listUsers() }, { headers: noStore });
}

/** Tạo tài khoản: { username, name, role, password } */
export async function POST(req: Request) {
  const user = await requirePermission(req, 'users.manage', true);
  if (user instanceof Response) return user;
  let v: { username?: unknown; name?: unknown; role?: unknown; password?: unknown };
  try { v = await req.json(); } catch { return bad('Không đọc được dữ liệu gửi lên.'); }
  const problem = checkNewUser(v, true);
  if (problem) return bad(problem);
  const created = await createUser({ username: String(v.username), name: String(v.name), role: v.role as Role, password: String(v.password) });
  if (created === 'taken') return bad('Tên đăng nhập này đã có người dùng.', 409);
  await logAction(actorOf(user), 'tao-tai-khoan', created.username, ROLES[created.role].label);
  return NextResponse.json({ user: created }, { status: 201, headers: noStore });
}

/** Sửa tài khoản: { id, name?, role?, active?, password? } */
export async function PATCH(req: Request) {
  const user = await requirePermission(req, 'users.manage', true);
  if (user instanceof Response) return user;
  let v: { id?: unknown; name?: unknown; role?: unknown; active?: unknown; password?: unknown };
  try { v = await req.json(); } catch { return bad('Không đọc được dữ liệu gửi lên.'); }
  if (typeof v.id !== 'string') return bad('Thiếu tài khoản.');
  const problem = checkNewUser(v, false);
  if (problem) return bad(problem);
  if (v.active !== undefined && typeof v.active !== 'boolean') return bad('Trạng thái không hợp lệ.');
  // Không tự hạ quyền hoặc tự khóa chính mình (tránh mất quyền quản trị giữa chừng)
  if (v.id === user.id && ((v.role !== undefined && v.role !== user.role) || v.active === false)) return bad('Không thể tự đổi vai trò hoặc tự khóa tài khoản đang đăng nhập.');
  const updated = await updateUser(v.id, { name: v.name as string | undefined, role: v.role as Role | undefined, active: v.active as boolean | undefined, password: v.password as string | undefined });
  if (!updated) return bad('Không tìm thấy tài khoản.', 404);
  const what = [v.name !== undefined && 'họ tên', v.role !== undefined && `vai trò ${ROLES[updated.role].label}`, v.active !== undefined && (updated.active ? 'mở khóa' : 'khóa'), v.password && 'đặt lại mật khẩu'].filter(Boolean).join(', ');
  await logAction(actorOf(user), 'sua-tai-khoan', updated.username, what);
  return NextResponse.json({ user: updated }, { headers: noStore });
}

export async function DELETE(req: Request) {
  const user = await requirePermission(req, 'users.manage', true);
  if (user instanceof Response) return user;
  const id = new URL(req.url).searchParams.get('id') || '';
  if (id === user.id) return bad('Không thể xóa tài khoản đang đăng nhập.');
  const found = await getUser(id);
  if (!found) return bad('Không tìm thấy tài khoản.', 404);
  await deleteUser(id);
  await logAction(actorOf(user), 'xoa-tai-khoan', found.username);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
