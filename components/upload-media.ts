'use client';
/** Tải một ảnh lên thư viện (≤ 6 MB). Trả về đường dẫn ảnh; lỗi thì ném Error có câu báo tiếng Việt. */
export async function uploadMedia(file: File): Promise<string> {
  if (file.size > 6 * 1024 * 1024) throw Error('Ảnh tối đa 6 MB.');
  const auth = await fetch('/api/admin/session/').then((r) => r.json());
  const r = await fetch('/api/admin/media/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'x-csrf-token': auth.csrf },
    body: file,
  });
  const v = await r.json();
  if (!r.ok) throw Error(v.error || 'Không thể tải ảnh.');
  return v.url;
}
