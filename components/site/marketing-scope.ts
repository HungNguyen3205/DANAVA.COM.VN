import { BarChart3, Camera, Compass, MessagesSquare, Target } from 'lucide-react';

export const MARKETING_STAGES = [
  {
    id: 'chien-luoc',
    icon: Compass,
    title: 'Chiến lược',
    short: 'Mục tiêu & thông điệp',
    headline: 'Chọn đúng khách\u00a0hàng, đúng thông\u00a0điệp',
    description: 'Xác định khách hàng cần tiếp cận và hành động muốn họ thực hiện, từ tìm hiểu dịch vụ đến nhắn tin hoặc đặt lịch.',
    image: { src: '/assets/marketing/hero-team-session.webp', alt: 'Đội ngũ trao đổi trong buổi làm việc', width: 1280, height: 800 },
    tasks: [
      { title: 'Rà hiện trạng', text: 'Xem nội dung, kênh đang dùng và cách đối thủ cùng khu vực tiếp cận khách.' },
      { title: 'Chốt thông điệp', text: 'Xác định nhóm khách, nhu cầu của họ và lý do họ nên chọn doanh nghiệp bạn.' },
      { title: 'Chọn kênh ưu tiên', text: 'Thống nhất mục tiêu, ngân sách dự kiến và vai trò từng kênh theo tháng.' }
    ],
    handover: 'Kế hoạch theo tháng gồm nhóm khách hàng, trục nội dung, kênh ưu tiên và chỉ số theo dõi.'
  },
  {
    id: 'noi-dung',
    icon: Camera,
    title: 'Sản xuất nội dung',
    short: 'Quay chụp & biên tập',
    headline: 'Làm nội dung từ hình\u00a0ảnh thật của bạn',
    description: 'Quay chụp tại cơ sở và biên tập thành ảnh, video ngắn hoặc ấn phẩm nhất quán với nhận diện thương hiệu.',
    image: { src: '/assets/marketing/hero-on-location.webp', alt: 'Hậu trường quay nội dung tại Núi Đỏ', width: 600, height: 750 },
    tasks: [
      { title: 'Chuẩn bị kịch bản', text: 'Chốt mục đích, bối cảnh, nhân vật và danh sách cảnh cần quay trước buổi ghi hình.' },
      { title: 'Ghi hình tại cơ sở', text: 'Quay chụp không gian, sản phẩm và đội ngũ. Có thể ghi hình và dựng recap sự kiện theo phạm vi đã chốt.' },
      { title: 'Biên tập theo kênh', text: 'Chọn cảnh, dựng video, làm phụ đề hoặc thiết kế ấn phẩm theo định dạng đăng.' }
    ],
    handover: 'Ảnh, video và ấn phẩm đã duyệt, kèm file gốc theo phạm vi sản xuất.'
  },
  {
    id: 'kenh',
    icon: MessagesSquare,
    title: 'Vận hành kênh',
    short: 'Lịch đăng & phản hồi',
    headline: 'Duy trì lịch đăng và theo dõi phản hồi',
    description: 'Tổ chức công việc trên Fanpage và Zalo OA để khách tìm thấy thông tin, nhắn hỏi và được hướng dẫn sang bước tiếp theo.',
    image: { src: '/assets/marketing/projects/kim-nhu-quynh-fanpage.webp', alt: 'Ảnh tập thể từ Fanpage Kim Như Quỳnh Aerobics', width: 960, height: 540 },
    tasks: [
      { title: 'Lập lịch biên tập', text: 'Phân chủ đề theo tuần, gửi nội dung để doanh nghiệp duyệt và lên lịch đăng.' },
      { title: 'Chăm sóc kênh', text: 'Theo dõi bình luận và tin nhắn, phản hồi câu hỏi phổ biến theo hướng dẫn đã thống nhất.' },
      { title: 'Chuyển nhu cầu tư vấn', text: 'Chuyển các yêu cầu cần tư vấn, báo giá hoặc chốt lịch cho đội ngũ phụ trách.' }
    ],
    handover: 'Lịch biên tập, kho nội dung đã đăng và danh sách yêu cầu cần nhân sự của bạn tiếp nhận.'
  },
  {
    id: 'quang-cao',
    icon: Target,
    title: 'Quảng cáo',
    short: 'Nhắm chọn & thử nghiệm',
    headline: 'Chạy quảng cáo theo một mục tiêu cụ thể',
    description: 'Thiết lập chiến dịch Meta hoặc Google trên tài khoản doanh nghiệp, với ngân sách và mục tiêu đã thống nhất.',
    image: { src: '/assets/marketing/projects/micc-hai-van-bay.webp', alt: 'Hình giới thiệu dự án Vinhomes Hải Vân Bay từ MICC Group', width: 1200, height: 675 },
    tasks: [
      { title: 'Thiết lập chiến dịch', text: 'Chọn khu vực, nhóm khách, mẫu quảng cáo và đích đến như tin nhắn hoặc form đăng ký.' },
      { title: 'Thử thông điệp', text: 'So sánh các mẫu nội dung theo mục tiêu để quyết định giữ, điều chỉnh hoặc dừng mẫu.' },
      { title: 'Kết nối điểm đo', text: 'Theo dõi form trên website hoặc Landing Page của bạn khi có thể gắn đo lường.' }
    ],
    handover: 'Cấu trúc chiến dịch, mẫu quảng cáo và số liệu chi tiêu trên tài khoản doanh nghiệp.'
  },
  {
    id: 'do-luong',
    icon: BarChart3,
    title: 'Đo lường',
    short: 'Báo cáo & tối ưu',
    headline: 'Đọc số liệu để biết nên điều chỉnh gì',
    description: 'Đối chiếu số liệu từ kênh và nền tảng quảng cáo với mục tiêu đã chốt, rồi ưu tiên thay đổi cho chu kỳ tiếp theo.',
    tasks: [
      { title: 'Gom số theo mục tiêu', text: 'Theo dõi tiếp cận, tương tác, tin nhắn hoặc đăng ký tùy mục tiêu và dữ liệu có thể đo.' },
      { title: 'Tách theo nguồn', text: 'Đối chiếu từng kênh hoặc chiến dịch để thấy chi phí và lượng phản hồi ghi nhận được.' },
      { title: 'Chốt việc tối ưu', text: 'Đề xuất giữ, sửa hoặc dừng nội dung, nhóm khách hay ngân sách dựa trên số liệu.' }
    ],
    handover: 'Báo cáo theo kỳ kèm nguồn số liệu, các điểm chưa đo được và việc ưu tiên cho đợt tiếp theo.'
  }
];
