import { getSiteContent } from '@/lib/database';
import { textStylesCss } from '@/lib/text-styles';

/**
 * Màu / cỡ chữ riêng của từng phần chữ (admin → Chỉnh sửa website → Kiểu chữ), lấy từ bản đang hiển thị:
 * khách thấy bản đã xuất bản, trình biên tập thấy bản nháp. Trình biên tập cập nhật thẻ này khi đang chỉnh (cms-editor.ts).
 */
export async function CmsStyles() {
  const { data } = await getSiteContent();
  const css = textStylesCss(data.textStyles);
  return <style id="cms-text-styles" dangerouslySetInnerHTML={{ __html: css }} />;
}
