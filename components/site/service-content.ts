/**
 * Khối trình bày cho từng trang giải pháp (/giai-phap/[slug]/).
 * Nội dung quản trị được (mô tả, đối tượng, vấn đề, quy trình, FAQ, chi phí, SEO) nằm trong CMS
 * (data.services; giá trị mặc định ở lib/content-defaults.ts). File này chỉ giữ các khối tính năng. Chỉ dùng thông tin đã có trên website cũ,
 * không thêm số liệu chưa được ban lãnh đạo xác nhận.
 */
export type Feature = { title: string; text: string };
export type Block = { id: string; eyebrow: string; title: string; lead?: string; features: Feature[] };

export type ServiceDetail = {
  blocks: Block[];
  promises?: Feature[];
  contactService: string;
  primaryCta: string;
  relatedEcosystem: string[];
};

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  studio: {
    blocks: [{
      id: 'tinh-nang',
      eyebrow: 'Tính năng',
      title: 'Mọi nghiệp vụ của phòng tập, gọn trong một màn hình',
      features: [
        { title: 'Hồ sơ hội viên tập trung', text: 'Số điện thoại, ngày tham gia, gói đang kích hoạt, số buổi còn lại và ghi chú thể trạng của từng hội viên.' },
        { title: 'Gói tập & nhắc gia hạn', text: 'Thẻ theo tháng, theo số buổi, gói kèm PT 1:1 hoặc thẻ bơi theo mùa. Hệ thống tự nhắc khi gói sắp hết hạn.' },
        { title: 'Lịch lớp & đặt chỗ', text: 'Xếp lịch theo sức chứa thực tế của phòng, thảm hoặc máy. Lớp tự khóa khi đủ học viên, có danh sách chờ.' },
        { title: 'Check-in bằng mã QR', text: 'Hội viên quét mã trên điện thoại tại quầy. Không cần thẻ nhựa, hạn chế mượn thẻ và giảm thời gian chờ.' },
        { title: 'Báo cáo doanh thu & HLV', text: 'Doanh thu theo ngày, tháng, tỷ lệ tái tục, khung giờ cao điểm và hiệu suất huấn luyện viên.' },
        { title: 'App hội viên mang thương hiệu riêng', text: 'Ứng dụng iOS & Android mang tên cơ sở của bạn để hội viên xem lịch, đặt lớp và theo dõi gói tập.' }
      ]
    }],
    contactService: 'danava-studio',
    primaryCta: 'Đăng ký demo miễn phí',
    relatedEcosystem: ['studio', 'website', 'digital']
  },

  website: {
    blocks: [
      {
        id: 'loai-website',
        eyebrow: 'Loại hình',
        title: 'Cấu trúc website phù hợp với từng giai đoạn',
        lead: 'Tùy mục tiêu và khách hàng của bạn, DANAVA tư vấn cấu trúc phù hợp nhất.',
        features: [
          { title: 'Website doanh nghiệp', text: 'Giới thiệu thương hiệu, dịch vụ, đội ngũ và câu chuyện của doanh nghiệp hoặc trung tâm wellness.' },
          { title: 'Landing page chiến dịch', text: 'Một trang tập trung cho một ưu đãi hoặc dịch vụ, tối ưu để thu thông tin khách hàng tiềm năng.' },
          { title: 'Thời khóa biểu & đặt lớp', text: 'Hiển thị lịch lớp, huấn luyện viên và cho phép khách hàng đăng ký trực tuyến.' },
          { title: 'Bán gói dịch vụ & sản phẩm', text: 'Trình bày bảng giá, gói thành viên và sản phẩm với luồng liên hệ, đặt mua rõ ràng.' }
        ]
      },
      {
        id: 'tieu-chuan',
        eyebrow: 'Tiêu chuẩn bàn giao',
        title: 'Mỗi website được nghiệm thu theo danh sách kỹ thuật rõ ràng',
        features: [
          { title: 'Thiết kế riêng', text: 'Giao diện theo màu sắc và cá tính thương hiệu, không dùng theme dựng sẵn.' },
          { title: 'Ưu tiên di động', text: 'Hiển thị sắc nét, nút bấm vừa tay trên mọi điện thoại và máy tính bảng.' },
          { title: 'Nhanh & bảo mật', text: 'Mã nguồn hiện đại, ảnh nén WebP, chứng chỉ SSL HTTPS.' },
          { title: 'Chuẩn SEO', text: 'Thẻ meta, OpenGraph, dữ liệu cấu trúc JSON-LD và sitemap để Google hiểu website.' },
          { title: 'Tự quản trị nội dung', text: 'Trang quản trị tiếng Việt để cập nhật bài viết, bảng giá, hình ảnh mà không cần biết code.' },
          { title: 'Bàn giao đầy đủ', text: 'Tên miền, tài khoản quản trị và tài liệu hướng dẫn thuộc quyền sở hữu của bạn.' }
        ]
      }
    ],
    contactService: 'thiet-ke-website',
    primaryCta: 'Nhận báo giá website',
    relatedEcosystem: ['website', 'digital', 'studio']
  },

  marketing: {
    blocks: [{
      id: 'dich-vu-media',
      eyebrow: 'Dịch vụ',
      title: 'Ba trụ cột cho truyền thông hiệu quả',
      features: [
        { title: 'Nhận diện & sản xuất nội dung', text: 'Quay phim, chụp ảnh trực tiếp tại cơ sở, thiết kế ấn phẩm và hình ảnh thương hiệu nhất quán. Bàn giao file gốc.' },
        { title: 'Vận hành kênh & cộng đồng', text: 'Chăm sóc Fanpage, Zalo OA theo lịch biên tập, phản hồi tin nhắn và giữ nhịp tương tác đều đặn.' },
        { title: 'Quảng cáo & thu khách hàng tiềm năng', text: 'Chiến dịch Meta/Google cho khu vực của bạn, kết nối với form và hệ thống quản lý để không bỏ sót khách hàng.' }
      ]
    }],
    promises: [
      { title: 'Bạn nắm tài khoản quảng cáo', text: 'Doanh nghiệp đứng tên và thanh toán trực tiếp cho Meta/Google, toàn quyền kiểm soát chi tiêu.' },
      { title: 'Hình ảnh thật', text: 'Nội dung được sản xuất tại chính cơ sở của bạn để khách hàng có cảm nhận chân thực.' },
      { title: 'Tài sản thuộc về bạn', text: 'Fanpage, Zalo OA, kho ảnh/video gốc và tệp khách hàng thuộc quyền sở hữu của doanh nghiệp.' }
    ],
    contactService: 'digital-marketing',
    primaryCta: 'Nhận tư vấn marketing',
    relatedEcosystem: ['digital', 'media', 'website']
  },

  travel: {
    blocks: [
      {
        id: 'du-lich',
        eyebrow: 'Du lịch trải nghiệm',
        title: 'Hành trình được thiết kế theo nhóm của bạn',
        features: [
          { title: 'Tour yoga & retreat', text: 'Lịch trình kết hợp tập luyện, nghỉ dưỡng và khám phá điểm đến.' },
          { title: 'Thiết kế theo yêu cầu', text: 'Điều chỉnh lịch trình, phòng nghỉ, phương tiện theo nhu cầu và ngân sách của nhóm.' },
          { title: 'Đặt dịch vụ trọn gói', text: 'Tour, phòng, xe và vé tham quan được sắp xếp bởi một đầu mối.' }
        ]
      },
      {
        id: 'hoi-nghi',
        eyebrow: 'Sự kiện',
        title: 'Hội nghị, workshop và team building',
        features: [
          { title: 'Hội nghị & hội thảo', text: 'Lên kịch bản, hậu cần, truyền thông và ghi hình cho sự kiện doanh nghiệp.' },
          { title: 'Workshop & giao lưu', text: 'Không gian học hỏi, chia sẻ cho cộng đồng và khách hàng của bạn.' },
          { title: 'Team building & gala', text: 'Chương trình gắn kết đội ngũ, từ hoạt động ngoài trời đến đêm gala.' }
        ]
      }
    ],
    contactService: 'du-lich-su-kien',
    primaryCta: 'Gửi yêu cầu tổ chức',
    relatedEcosystem: ['go', 'media']
  },

  community: {
    blocks: [
      {
        id: 'cong-dong',
        eyebrow: 'Cộng đồng',
        title: 'Yoga Club Vietnam và những hoạt động kết nối',
        features: [
          { title: 'Yoga Club Vietnam', text: 'Mạng lưới kết nối người tập, huấn luyện viên và các câu lạc bộ yoga.' },
          { title: 'Workshop & giao lưu', text: 'Các buổi chia sẻ, thực hành và gặp gỡ định kỳ trong cộng đồng.' },
          { title: 'Review & chia sẻ', text: 'Chia sẻ trải nghiệm về điểm đến, yoga, công nghệ và lối sống lành mạnh.' }
        ]
      },
      {
        id: 'dong-hanh',
        eyebrow: 'Đồng hành doanh nghiệp',
        title: 'Hỗ trợ những bước đi đầu tiên',
        features: [
          { title: 'Tư vấn thành lập doanh nghiệp', text: 'Định hướng thủ tục và lộ trình theo thỏa thuận với từng đối tác.' },
          { title: 'Kết nối đối tác', text: 'Giới thiệu nguồn lực trong hệ sinh thái DANAVA phù hợp với nhu cầu của bạn.' }
        ]
      }
    ],
    contactService: 'tu-van-chuyen-doi-so',
    primaryCta: 'Kết nối với DANAVA',
    relatedEcosystem: ['go', 'media', 'digital']
  }
};
