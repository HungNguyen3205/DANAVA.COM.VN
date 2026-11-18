/**
 * Nội dung chi tiết cho từng trang giải pháp (/giai-phap/[slug]/).
 * Tiêu đề, mô tả ngắn và danh sách hạng mục vẫn lấy từ CMS (data.services);
 * file này bổ sung phần trình bày sâu hơn. Chỉ dùng thông tin đã có trên website cũ,
 * không thêm số liệu chưa được ban lãnh đạo xác nhận.
 */
export type Feature = { title: string; text: string };
export type Faq = { q: string; a: string };
export type Block = { id: string; eyebrow: string; title: string; lead?: string; features: Feature[] };

export type ServiceDetail = {
  heroLead: string;
  audience: string[];
  blocks: Block[];
  process?: Feature[];
  promises?: Feature[];
  faqs: Faq[];
  contactService: string;
  primaryCta: string;
  relatedEcosystem: string[];
};

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  studio: {
    heroLead: 'Quản lý hội viên, gói tập, lịch lớp, check-in QR và báo cáo doanh thu trên một nền tảng. Đội ngũ của bạn bớt việc giấy tờ để dành thời gian cho khách hàng.',
    audience: ['Phòng Gym & Fitness', 'Yoga & Pilates studio', 'Bể bơi', 'Spa & Wellness'],
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
    process: [
      { title: 'Khảo sát', text: 'Tìm hiểu mô hình gói tập, lịch lớp và quy trình quầy lễ tân hiện tại.' },
      { title: 'Cấu hình & nhập dữ liệu', text: 'Thiết lập gói dịch vụ, phân quyền và chuyển dữ liệu hội viên cũ từ Excel hoặc sổ sách.' },
      { title: 'Đào tạo', text: 'Hướng dẫn lễ tân, HLV và quản lý thao tác trực tiếp trên hệ thống.' },
      { title: 'Vận hành & hỗ trợ', text: 'Đồng hành trong giai đoạn đầu và hỗ trợ kỹ thuật theo chính sách dịch vụ.' }
    ],
    faqs: [
      { q: 'Dữ liệu hội viên cũ từ Excel hoặc sổ sách có chuyển sang được không?', a: 'Có. Đội ngũ DANAVA hỗ trợ chuẩn hóa và nhập danh sách hội viên, hạn thẻ, số buổi còn lại vào hệ thống để phòng tập không bị gián đoạn.' },
      { q: 'Có cần máy tính cấu hình cao hay thiết bị đắt tiền không?', a: 'Không. DANAVA Studio chạy trên trình duyệt web, dùng được với máy tính, laptop, máy tính bảng hoặc điện thoại sẵn có. Check-in QR có thể dùng camera thiết bị hoặc máy quét mã vạch phổ thông.' },
      { q: 'Triển khai và đào tạo nhân viên mất bao lâu?', a: 'Thời gian phụ thuộc vào quy mô cơ sở và lượng dữ liệu cần chuyển. Giao diện tiếng Việt, quy trình trực quan nên lễ tân có thể làm quen các thao tác chính ngay trong buổi hướng dẫn.' },
      { q: 'Dữ liệu và doanh thu của tôi được bảo mật thế nào?', a: 'Kết nối được mã hóa SSL/TLS. Phân quyền chi tiết theo vai trò giúp bạn kiểm soát nhân viên được xem và thao tác những gì.' },
      { q: 'Mất internet tạm thời thì có check-in được không?', a: 'Hệ thống hỗ trợ lưu tạm để tiếp nhận hội viên vào tập bình thường, dữ liệu tự đồng bộ khi có kết nối trở lại.' }
    ],
    contactService: 'danava-studio',
    primaryCta: 'Đăng ký demo miễn phí',
    relatedEcosystem: ['studio', 'website', 'digital']
  },

  website: {
    heroLead: 'Website và landing page thiết kế riêng theo thương hiệu, tải nhanh trên điện thoại, chuẩn SEO và có biểu mẫu thu khách hàng tiềm năng.',
    audience: ['Doanh nghiệp dịch vụ', 'Trung tâm wellness', 'Cơ sở đào tạo', 'Chiến dịch marketing'],
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
    process: [
      { title: 'Nhận brief & tư vấn cấu trúc', text: 'Lắng nghe mục tiêu, khảo sát đối thủ và thống nhất sơ đồ trang, tính năng cần có.' },
      { title: 'Thiết kế giao diện', text: 'Bản thiết kế desktop và mobile để bạn duyệt màu sắc, bố cục trước khi lập trình.' },
      { title: 'Lập trình & nghiệm thu', text: 'Dựng website, tối ưu tốc độ và cùng bạn kiểm tra form, nội dung trên bản chạy thử.' },
      { title: 'Bàn giao & vận hành', text: 'Trỏ tên miền, cấu hình SSL, bàn giao tài khoản quản trị và hướng dẫn cập nhật.' }
    ],
    faqs: [
      { q: 'Làm một website mất bao lâu?', a: 'Tùy số lượng trang, tính năng đặc thù và thời gian chuẩn bị nội dung, hình ảnh. DANAVA sẽ thống nhất tiến độ cụ thể trong đề xuất trước khi bắt đầu.' },
      { q: 'Sau khi bàn giao tôi có tự sửa nội dung được không?', a: 'Được. Website có trang quản trị tiếng Việt để bạn và nhân viên tự đăng bài, đổi hình ảnh, cập nhật bảng giá.' },
      { q: 'Chi phí duy trì hằng năm gồm những gì?', a: 'Chủ yếu là phí tên miền và máy chủ lưu trữ theo giá nhà cung cấp. Các khoản khác (nếu có) được ghi rõ trong báo giá.' },
      { q: 'Website có hiển thị tốt trên điện thoại không?', a: 'Có. Mọi website đều được thiết kế ưu tiên di động và tối ưu tốc độ tải trang.' },
      { q: 'Chế độ bảo hành và hỗ trợ thế nào?', a: 'Phạm vi bảo hành và hỗ trợ kỹ thuật được quy định trong Chính sách dịch vụ của DANAVA và hợp đồng của từng dự án.' }
    ],
    contactService: 'thiet-ke-website',
    primaryCta: 'Nhận báo giá website',
    relatedEcosystem: ['website', 'digital', 'studio']
  },

  marketing: {
    heroLead: 'Chiến lược, nội dung, quay chụp và quảng cáo được kết nối thành một kế hoạch. Thương hiệu của bạn đến gần khách hàng hơn, với số liệu minh bạch.',
    audience: ['Phòng tập & studio', 'Spa & wellness', 'Doanh nghiệp dịch vụ', 'Sự kiện & cộng đồng'],
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
    process: [
      { title: 'Đánh giá hiện trạng', text: 'Phân tích kênh, đối thủ trong khu vực và thống nhất mục tiêu ưu tiên.' },
      { title: 'Lập kế hoạch', text: 'Trục nội dung, lịch biên tập, kịch bản quay chụp và ngân sách dự kiến.' },
      { title: 'Sản xuất & kích hoạt', text: 'Quay chụp tại cơ sở, hoàn thiện bài đăng và chạy chiến dịch.' },
      { title: 'Báo cáo & tối ưu', text: 'Báo cáo số liệu từ nền tảng, bàn giao file gốc và đề xuất cho chu kỳ tiếp theo.' }
    ],
    promises: [
      { title: 'Bạn nắm tài khoản quảng cáo', text: 'Doanh nghiệp đứng tên và thanh toán trực tiếp cho Meta/Google, toàn quyền kiểm soát chi tiêu.' },
      { title: 'Hình ảnh thật', text: 'Nội dung được sản xuất tại chính cơ sở của bạn để khách hàng có cảm nhận chân thực.' },
      { title: 'Tài sản thuộc về bạn', text: 'Fanpage, Zalo OA, kho ảnh/video gốc và tệp khách hàng thuộc quyền sở hữu của doanh nghiệp.' }
    ],
    faqs: [
      { q: 'Doanh nghiệp có cần tự chuẩn bị hình ảnh, video không?', a: 'Không bắt buộc. Đội ngũ DANAVA có thể đến cơ sở để quay chụp không gian, đội ngũ và không khí dịch vụ thực tế.' },
      { q: 'Ngân sách quảng cáo được quản lý thế nào?', a: 'Doanh nghiệp đứng tên tài khoản và thanh toán trực tiếp cho nền tảng quảng cáo theo hóa đơn thực tế. DANAVA thu phí dịch vụ theo thỏa thuận.' },
      { q: 'Kết thúc hợp đồng, các kênh truyền thông thuộc về ai?', a: 'Toàn bộ Fanpage, Zalo OA, tài khoản quảng cáo, tệp khách hàng và file ảnh/video gốc thuộc về doanh nghiệp. DANAVA bàn giao đầy đủ quyền quản trị.' },
      { q: 'Vì sao nên kết hợp Fanpage và Zalo OA?', a: 'Fanpage giúp tiếp cận khách hàng mới qua nội dung và quảng cáo. Zalo OA phù hợp để chăm sóc và giữ liên lạc với khách hàng đã quan tâm.' }
    ],
    contactService: 'digital-marketing',
    primaryCta: 'Nhận tư vấn marketing',
    relatedEcosystem: ['digital', 'media', 'website']
  },

  travel: {
    heroLead: 'Tour trải nghiệm, retreat yoga, hội thảo, workshop và team building, được thiết kế để mỗi chuyến đi, mỗi cuộc gặp gỡ đều có ý nghĩa.',
    audience: ['Doanh nghiệp', 'Câu lạc bộ & cộng đồng', 'Trung tâm yoga', 'Nhóm khách riêng'],
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
    faqs: [
      { q: 'DANAVA có nhận tổ chức theo yêu cầu riêng không?', a: 'Có. Mỗi chương trình được thiết kế theo số lượng khách, mục tiêu và ngân sách của bạn.' },
      { q: 'Tôi cần chuẩn bị gì để nhận báo giá?', a: 'Chỉ cần cho biết thời gian dự kiến, số lượng người tham gia, địa điểm mong muốn và mục tiêu chương trình.' }
    ],
    contactService: 'du-lich-su-kien',
    primaryCta: 'Gửi yêu cầu tổ chức',
    relatedEcosystem: ['go', 'media']
  },

  community: {
    heroLead: 'Kết nối cộng đồng yoga, tổ chức hoạt động giao lưu và đồng hành cùng doanh nghiệp trong những bước phát triển đầu tiên.',
    audience: ['Cộng đồng yoga', 'Huấn luyện viên', 'Doanh nghiệp mới', 'Đối tác'],
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
    faqs: [
      { q: 'Làm sao để tham gia các hoạt động cộng đồng?', a: 'Theo dõi Bản tin DANAVA hoặc liên hệ trực tiếp để nhận thông tin về sự kiện sắp diễn ra.' },
      { q: 'Chương trình đồng hành doanh nghiệp áp dụng thế nào?', a: 'Phạm vi hỗ trợ được thống nhất theo thỏa thuận cụ thể với từng doanh nghiệp.' }
    ],
    contactService: 'tu-van-chuyen-doi-so',
    primaryCta: 'Kết nối với DANAVA',
    relatedEcosystem: ['go', 'media', 'digital']
  }
};
