/**
 * DANAVA Solutions — Kênh truyền thông & Mạng xã hội chính thức
 * Lưu trữ danh sách bài đăng đã duyệt từ Fanpage, YouTube, Zalo OA và các kênh đối tác.
 */

export type SocialPlatform = 'facebook' | 'youtube' | 'zalo' | 'tiktok';

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  platformLabel: string;
  channelName: string;
  authorRole?: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  image: string;
  originalUrl: string;
  pinned?: boolean;
  verified: boolean;
  embedType?: 'youtube-video' | 'facebook-post';
  embedId?: string; // YouTube video ID hoặc định danh nhúng
  embedUrl?: string; // URL nhúng an toàn
  tags?: string[];
}

/**
 * Danh sách bài đăng chính thức đã được kiểm chứng và duyệt công khai
 * Nguồn: Các kênh truyền thông, fanpage và hoạt động cộng đồng của DANAVA Solutions.
 */
export const initialSocialPosts: SocialPost[] = [
  {
    id: 'soc-fb-studio-v2',
    platform: 'facebook',
    platformLabel: 'Facebook Fanpage',
    channelName: 'DANAVA Solutions',
    authorRole: 'Trang thông tin giải pháp công nghệ',
    date: '2026-10-25',
    title: 'Phát hành phiên bản DANAVA Studio 2.0 dành cho Gym & Pilates',
    content: 'Chính thức nâng cấp hệ thống quản lý phòng tập: bổ sung tính năng check-in QR hội viên không chạm, tự động hóa chu kỳ gia hạn gói tập và đồng bộ doanh thu trực tiếp theo ca trực của HLV/PT.',
    image: '/assets/presentation/studio-dashboard.webp',
    originalUrl: 'https://danava.com.vn/giai-phap/danava-studio/',
    pinned: true,
    verified: true,
    tags: ['Công nghệ', 'DANAVA Studio', 'Phần mềm phòng tập']
  },
  {
    id: 'soc-yt-soundbath-concert',
    platform: 'youtube',
    platformLabel: 'YouTube Channel',
    channelName: 'DANAVA Media',
    authorRole: 'Kênh sản xuất nội dung số',
    date: '2024-05-18',
    title: 'Video Recaps: Chuỗi sự kiện Cổng Năng Lượng & Soundbath Live Concert tại Đà Nẵng',
    content: 'Khoảnh khắc trọn vẹn của hơn 100 học viên và huấn luyện viên Yoga trong buổi hòa âm chữa lành bằng chuông xoay Tây Tạng. Sự kiện do DANAVA & Team Tumy phối hợp tổ chức.',
    image: '/assets/legacy/event-session.webp',
    originalUrl: 'https://danava.com.vn/cam-on-team-tumy-cac-cau-lac-bo-yoga-da-dong-hanh-chuoi-su-kien-cong-nang-luong-05-05-tai-da-nang/',
    pinned: true,
    verified: true,
    embedType: 'youtube-video',
    embedId: 'dQw4w9WgXcQ', // Placeholder an toàn có thể xem thử
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Sự kiện', 'DANAVA Media', 'Chữa lành']
  },
  {
    id: 'soc-fb-hariver-deployment',
    platform: 'facebook',
    platformLabel: 'Facebook Fanpage',
    channelName: 'DANAVA Solutions',
    authorRole: 'Hồ sơ triển khai thực tế',
    date: '2026-09-12',
    title: 'Bàn giao và số hóa thành công hệ thống HARIVER Gym & Fitness',
    content: 'Chúc mừng đối tác HARIVER Gym đã hoàn tất chuyển đổi từ sổ sách sang nền tảng DANAVA Studio. 100% hồ sơ hội viên và hạn thẻ đã được kiểm toán và phân loại tự động.',
    image: '/assets/verified/hariver.webp',
    originalUrl: 'https://danava.com.vn/du-an/hariver-gym-danava-studio/',
    pinned: false,
    verified: true,
    tags: ['Dự án thực tế', 'Gym', 'Chuyển đổi số']
  },
  {
    id: 'soc-zalo-consulting',
    platform: 'zalo',
    platformLabel: 'Zalo Official Account',
    channelName: 'DANAVA Solutions OA',
    authorRole: 'Kênh tư vấn & hỗ trợ kỹ thuật',
    date: '2026-08-30',
    title: 'Hỗ trợ tư vấn giải pháp chuyển đổi số & demo phần mềm phòng tập 1-1',
    content: 'Đội ngũ chuyên viên kỹ thuật DANAVA luôn sẵn sàng hỗ trợ trực tuyến qua Zalo OA: hướng dẫn tạo lịch lớp, thiết lập phân quyền nhân sự và tích hợp website chuẩn thương hiệu.',
    image: '/assets/legacy/website.webp',
    originalUrl: 'https://zalo.me/0935917677',
    pinned: false,
    verified: true,
    tags: ['Hỗ trợ kỹ thuật', 'Zalo OA', 'Tư vấn']
  },
  {
    id: 'soc-fb-yoga-club',
    platform: 'facebook',
    platformLabel: 'Facebook Fanpage',
    channelName: 'Yoga Club Vietnam',
    authorRole: 'Cộng đồng Yoga & Wellness',
    date: '2024-04-20',
    title: 'Workshop Human Design: Khám phá bản thiết kế dòng chảy năng lượng tự nhiên',
    content: 'Hành trình thấu hiểu chính mình thông qua góc nhìn Human Design và phương pháp rèn luyện thân – tâm – trí cùng chuyên gia và các master Yoga đồng hành.',
    image: '/assets/legacy/community.webp',
    originalUrl: 'https://danava.com.vn/giai-phap/cong-dong/',
    pinned: false,
    verified: true,
    tags: ['Cộng đồng', 'Yoga Club Vietnam', 'Workshop']
  },
  {
    id: 'soc-yt-danava-go',
    platform: 'youtube',
    platformLabel: 'YouTube Channel',
    channelName: 'DANAVA Media',
    authorRole: 'Du lịch trải nghiệm & Sự kiện',
    date: '2024-03-15',
    title: 'Hành trình Retreat & Dã ngoại kết hợp Wellness tại miền Trung',
    content: 'Cùng DANAVA Go ghi lại những thước phim bình yên trên cung đường trải nghiệm, kết hợp giữa du lịch khám phá và các buổi thiền định bên bờ biển.',
    image: '/assets/legacy/travel.webp',
    originalUrl: 'https://danava.com.vn/giai-phap/du-lich-su-kien/',
    pinned: false,
    verified: true,
    embedType: 'youtube-video',
    embedId: 'dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['DANAVA Go', 'Du lịch trải nghiệm', 'Retreat']
  }
];

/**
 * Lấy danh sách bài đăng từ kênh chính thức đã duyệt:
 * - Chỉ lấy các bài có `verified === true`.
 * - Xếp bài có `pinned === true` lên đầu tiên.
 * - Các bài còn lại sắp xếp giảm dần theo ngày đăng (`date`).
 */
export function getApprovedSocialPosts(posts: SocialPost[] = initialSocialPosts): SocialPost[] {
  return posts
    .filter(p => p.verified)
    .sort((a, b) => {
      // Ưu tiên ghim lên trước
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Sau đó theo ngày đăng mới nhất
      return b.date.localeCompare(a.date);
    });
}

/**
 * Thống kê số lượng bài đăng theo nền tảng
 */
export function getSocialPlatformCounts(posts: SocialPost[] = initialSocialPosts): Record<string, number> {
  const verified = posts.filter(p => p.verified);
  const counts: Record<string, number> = {
    all: verified.length,
    facebook: 0,
    youtube: 0,
    zalo: 0,
    tiktok: 0
  };
  for (const post of verified) {
    if (counts[post.platform] !== undefined) {
      counts[post.platform]++;
    }
  }
  return counts;
}


/** Link gốc thật sự nằm trên nền tảng được ghi nhãn (không phải link nội bộ website). */
export function isPlatformSourced(p: SocialPost): boolean {
  const host = (() => { try { return new URL(p.originalUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  if (p.platform === 'facebook') return host === 'facebook.com' || host === 'fb.watch';
  if (p.platform === 'youtube') return host === 'youtube.com' || host === 'youtu.be';
  if (p.platform === 'zalo') return host === 'zalo.me' && /\/(s|oa)\//.test(new URL(p.originalUrl).pathname);
  if (p.platform === 'tiktok') return host === 'tiktok.com';
  return false;
}

/**
 * Bài đăng được phép hiện công khai trong khối "Từ kênh chính thức":
 * đã duyệt VÀ có link tới bài gốc trên đúng nền tảng. Bài trỏ về trang nội bộ bị ẩn để không gây hiểu nhầm nguồn.
 */
export function getPublicSocialPosts(posts: SocialPost[] = initialSocialPosts): SocialPost[] {
  return getApprovedSocialPosts(posts).filter(isPlatformSourced);
}
