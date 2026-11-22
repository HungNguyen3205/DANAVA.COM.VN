/*
 * Cấu hình bổ sung chỉnh trong CMS, lưu ở SiteData.extras (đọc bằng block(data, key) như các khối khác).
 *
 * Vì sao không nằm trong SiteData.blocks: bản build cũ từ chối khóa lạ trong `blocks`, nên khi quay lại
 * bản trước (docs/BAN-GIAO.md mục 3) cả website sẽ lỗi 500. Trường cấp cao nhất thì bản cũ bỏ qua và giữ nguyên.
 * Khối mới thêm sau này cũng nên đặt ở đây.
 */

/* ------------------------------------------------------------ Ảnh doanh nghiệp */
export const GALLERY = {
  visible: true,
  kicker: 'Hình ảnh DANAVA',
  title: 'Người thật, *việc thật.*',
  lead: 'Không gian làm việc và những buổi workshop, hoạt động cộng đồng DANAVA đã đồng hành.',
  /** Ảnh đầu tiên (đang hiển thị) là ảnh lớn. Nguồn: ảnh văn phòng và ảnh bìa các bài hoạt động trên danava.com.vn. */
  photos: [
    { image: '/assets/about/office.webp', caption: 'Văn phòng DANAVA tại Đà Nẵng', alt: 'Phòng họp tại văn phòng DANAVA Đà Nẵng', focus: '', visible: true },
    { image: '/assets/verified/post-13591.webp', caption: 'Soundbath Live Concert 2024', alt: 'Người tham gia chụp ảnh chung tại Soundbath Live Concert 2024', focus: '', visible: true },
    { image: '/assets/verified/post-13491.webp', caption: 'Yoga Workshop', alt: 'Người tham gia Yoga Workshop chụp ảnh chung', focus: '', visible: true },
    { image: '/assets/verified/post-13468.webp', caption: 'Workshop “Cột sống là cuộc sống”', alt: 'Người tham gia workshop Cột sống là cuộc sống chụp ảnh chung', focus: '', visible: true },
    { image: '/assets/verified/post-13493.webp', caption: 'Workshop “Thiền Trà”', alt: 'Không gian workshop Thiền Trà của DANAVA', focus: '', visible: true }
  ]
};

/** Vị trí cần giữ khi cắt ảnh (giá trị object-position). */
export const PHOTO_FOCUS = ['', 'top', 'bottom', 'left', 'right'];
export const PHOTO_MAX = 12;

/* ------------------------------------------------------------ Kiểm tra giá trị */
export type ExtraValues = { gallery: typeof GALLERY };

const IMAGE = /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g)$/;

/**
 * Kiểm tra giá trị (cấu trúc đã được kiểm tra ở lib/blocks.ts).
 * Trả về câu báo lỗi cho quản trị viên, '' khi hợp lệ.
 */
export function extraError(values: Partial<ExtraValues> | undefined): string {
  const gallery = values?.gallery;
  if (gallery) {
    if (!Array.isArray(gallery.photos)) return 'Ảnh doanh nghiệp: danh sách ảnh không hợp lệ.';
    if (gallery.photos.length > PHOTO_MAX) return `Ảnh doanh nghiệp: tối đa ${PHOTO_MAX} ảnh.`;
    for (const [i, photo] of gallery.photos.entries()) {
      if (photo.image && (!IMAGE.test(photo.image) || photo.image.includes('..'))) return `Ảnh doanh nghiệp, ảnh ${i + 1}: hãy tải ảnh lên hoặc dùng đường dẫn /assets/….`;
      if (!PHOTO_FOCUS.includes(photo.focus)) return `Ảnh doanh nghiệp, ảnh ${i + 1}: vị trí giữ khi cắt không hợp lệ.`;
    }
  }
  return '';
}
