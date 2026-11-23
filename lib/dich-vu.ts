/**
 * Mục "Dịch vụ" (không phải phần mềm): truyền thông, landing page, tổ chức sự kiện, du lịch trải nghiệm.
 * Tách riêng khỏi "Giải pháp" (phần mềm và sản phẩm). Trang: /dich-vu/ và /dich-vu/{slug}/.
 * Nội dung là bản khởi tạo, anh có thể sửa trực tiếp tại đây.
 */
import type { Service } from './content';

export const DICH_VU: Service[] = [
  {
    id: 'dv-truyen-thong',
    slug: 'truyen-thong',
    title: 'Truyền thông & nội dung',
    description: 'Chiến lược, sản xuất nội dung và vận hành kênh để thương hiệu được nhớ đến và tin tưởng.',
    heroLead: 'Kể câu chuyện của thương hiệu bằng nội dung đúng khách hàng: bài viết, hình ảnh, video và lịch đăng được lên kế hoạch rõ ràng.',
    items: ['Chiến lược truyền thông theo mục tiêu', 'Sản xuất bài viết, hình ảnh và video', 'Vận hành Fanpage và Zalo OA', 'Đo lường và tối ưu hiệu quả hằng tháng'],
    audience: ['Doanh nghiệp muốn xây dựng thương hiệu', 'Cơ sở cần khách hàng mới qua mạng xã hội', 'Sự kiện, dự án cần lan tỏa'],
    problems: ['Đăng bài không đều, không biết nói gì với khách', 'Nội dung đẹp nhưng không dẫn tới khách hàng', 'Không biết kênh nào hiệu quả để đầu tư'],
    process: [
      { title: 'Khảo sát thương hiệu', text: 'Hiểu mục tiêu, khách hàng và đối thủ.' },
      { title: 'Lập kế hoạch nội dung', text: 'Chủ đề, định dạng và lịch đăng theo tháng.' },
      { title: 'Sản xuất và duyệt', text: 'Làm nội dung, bạn duyệt trước khi đăng.' },
      { title: 'Đo lường và điều chỉnh', text: 'Báo cáo định kỳ và đề xuất cải thiện.' }
    ],
    faqs: [
      { q: 'Chi phí truyền thông là bao nhiêu?', a: 'Tùy quy mô kênh và số lượng nội dung mỗi tháng. Anh/chị gửi yêu cầu để nhận báo giá theo phạm vi.' },
      { q: 'Bao lâu thì thấy kết quả?', a: 'Thường sau 2 đến 3 tháng vận hành đều đặn, kết quả được đo bằng số liệu cụ thể.' }
    ],
    pricing: 'Báo giá theo phạm vi kênh và số lượng nội dung mỗi tháng.',
    updated: '2026-11-23'
  },
  {
    id: 'dv-landing-page',
    slug: 'landing-page',
    title: 'Thiết kế landing page',
    description: 'Trang đích một mục tiêu, tải nhanh trên điện thoại, dẫn khách tới hành động: gọi, nhắn tin hoặc đặt mua.',
    heroLead: 'Một trang đích được thiết kế quanh một mục tiêu duy nhất: tiêu đề rõ, lợi ích thuyết phục và nút liên hệ nổi bật.',
    items: ['Thiết kế giao diện theo thương hiệu', 'Tối ưu tốc độ và hiển thị trên điện thoại', 'Form thu thập khách hàng tiềm năng', 'Gắn công cụ đo lường cơ bản'],
    audience: ['Chiến dịch quảng cáo cần trang đích riêng', 'Sản phẩm, dịch vụ mới cần ra mắt', 'Dự án bất động sản, sự kiện, khóa học'],
    problems: ['Quảng cáo chạy nhưng khách rời trang ngay', 'Trang chủ quá nhiều nội dung, khó chốt khách', 'Không biết khách đến từ đâu và có hiệu quả không'],
    process: [
      { title: 'Xác định mục tiêu', text: 'Một hành động chính cho mỗi trang.' },
      { title: 'Phác thảo bố cục', text: 'Thứ tự thông tin dẫn dắt khách tới nút liên hệ.' },
      { title: 'Thiết kế và lập trình', text: 'Giao diện cho máy tính và điện thoại.' },
      { title: 'Thử nghiệm và bàn giao', text: 'Kiểm tra form, tốc độ và đo lường trước khi chạy.' }
    ],
    faqs: [
      { q: 'Landing page khác website như thế nào?', a: 'Landing page chỉ có một mục tiêu và ít đường dẫn để khách không bị phân tâm, phù hợp cho quảng cáo và chiến dịch.' },
      { q: 'Có sửa nội dung sau khi bàn giao không?', a: 'Có. Anh/chị có thể yêu cầu cập nhật nội dung, hình ảnh theo chính sách hỗ trợ.' }
    ],
    pricing: 'Báo giá theo số lượng trang và mức độ tùy biến.',
    updated: '2026-11-23'
  },
  {
    id: 'dv-su-kien',
    slug: 'to-chuc-su-kien',
    title: 'Tổ chức sự kiện',
    description: 'Ý tưởng, kịch bản, sân khấu, thi công và điều phối trọn gói cho sự kiện của doanh nghiệp.',
    heroLead: 'Từ hội nghị khách hàng đến lễ ra mắt sản phẩm, DANAVA lo trọn gói từ ý tưởng đến ngày diễn ra.',
    items: ['Ý tưởng và kịch bản chương trình', 'Sân khấu, thi công và thiết bị', 'Nhân sự và điều phối trong ngày', 'Ghi hình và truyền thông sau sự kiện'],
    audience: ['Doanh nghiệp tổ chức hội nghị, ra mắt sản phẩm', 'Nhãn hàng cần sự kiện trải nghiệm', 'Tổ chức cần workshop, họp báo'],
    problems: ['Ngân sách không rõ ràng từ đầu', 'Thiếu người điều phối trong ngày sự kiện', 'Chương trình đẹp nhưng không đúng mục tiêu'],
    process: [
      { title: 'Tiếp nhận yêu cầu', text: 'Mục tiêu, quy mô, thời gian và ngân sách.' },
      { title: 'Đề xuất phương án', text: 'Kịch bản, không gian và dự toán chi tiết.' },
      { title: 'Chuẩn bị và thi công', text: 'Lịch làm việc, nhân sự và kiểm tra kỹ thuật.' },
      { title: 'Điều phối và tổng kết', text: 'Chạy chương trình và báo cáo sau sự kiện.' }
    ],
    faqs: [
      { q: 'Tổ chức sự kiện cần chuẩn bị bao lâu?', a: 'Thường từ 3 đến 6 tuần tùy quy mô. Sự kiện lớn cần lên kế hoạch sớm hơn.' },
      { q: 'DANAVA có làm sự kiện ngoài Đà Nẵng không?', a: 'Có. Anh/chị gửi yêu cầu để được tư vấn về địa điểm và chi phí.' }
    ],
    pricing: 'Báo giá trọn gói theo quy mô, địa điểm và thời lượng chương trình.',
    updated: '2026-11-23'
  },
  {
    id: 'dv-du-lich',
    slug: 'du-lich-trai-nghiem',
    title: 'Du lịch trải nghiệm',
    description: 'Tour trải nghiệm, retreat và hành trình thiết kế riêng cho từng nhóm khách hoặc doanh nghiệp.',
    heroLead: 'Mỗi hành trình được thiết kế theo nhóm khách: team building, retreat yoga hay chuyến đi gắn với sự kiện.',
    items: ['Tour trải nghiệm theo chủ đề', 'Retreat yoga và thiền', 'Team building và chương trình gắn kết', 'Hành trình thiết kế riêng cho doanh nghiệp'],
    audience: ['Doanh nghiệp tổ chức team building', 'Nhóm bạn, cộng đồng yoga', 'Khách cần chuyến đi có chủ đề'],
    problems: ['Chuyến đi đông người khó sắp xếp', 'Lịch trình rời rạc, thiếu trải nghiệm', 'Khó chọn nơi phù hợp với mục tiêu của nhóm'],
    process: [
      { title: 'Lắng nghe nhu cầu', text: 'Số người, thời gian, sở thích và ngân sách.' },
      { title: 'Thiết kế hành trình', text: 'Lịch trình, hoạt động và nơi lưu trú.' },
      { title: 'Chốt và chuẩn bị', text: 'Xác nhận dịch vụ và thông tin cho khách.' },
      { title: 'Đồng hành trong chuyến đi', text: 'Điều phối và hỗ trợ suốt hành trình.' }
    ],
    faqs: [
      { q: 'Nhóm nhỏ có đi được không?', a: 'Có. Chúng tôi nhận cả nhóm nhỏ và nhóm lớn, lịch trình được điều chỉnh theo số người.' },
      { q: 'Có tổ chức retreat yoga không?', a: 'Có. Retreat yoga được thiết kế riêng về địa điểm, lịch tập và hoạt động.' }
    ],
    pricing: 'Báo giá theo số người, thời gian và mức dịch vụ.',
    updated: '2026-11-23'
  }
];

export const dichVuBySlug = (slug: string) => DICH_VU.find(s => s.slug === slug);
