/** Nhãn tiếng Việt và cấu hình biểu mẫu cho từng khối nội dung (components/AdminBlockEditor.tsx). */
import type { BlockEditorConfig } from './AdminBlockEditor';
import type { BlockKey } from '@/lib/blocks';

const COMMON: Record<string, string> = {
  title: 'Tiêu đề', text: 'Nội dung', name: 'Tên', label: 'Nhãn', description: 'Mô tả', badge: 'Nhãn nổi bật', href: 'Đường dẫn',
  image: 'Ảnh', visible: 'Hiển thị trên website', link: 'Đường dẫn (tùy chọn)', url: 'Đường dẫn'
};

export const PAGE_NAMES: Record<string, string> = {
  'mac-dinh': 'Dải kêu gọi mặc định (các trang không có chữ riêng)',
  've-danava': 'Về DANAVA', 'giai-phap': 'Giải pháp (trang tổng hợp)', 'du-an': 'Dự án', 'kien-thuc': 'Blogs',
  'he-sinh-thai': 'Hệ sinh thái', 'doi-tac': 'Đối tác đồng hành', 'doi-ngu': 'Đội ngũ', 'lien-he': 'Liên hệ',
  studio: 'DANAVA Studio (dải cuối trang)', website: 'Website & Landing Page (dải cuối trang)', 'case-study': 'Case study website (dải cuối trang)'
};

export const BLOCK_META: Record<BlockKey, { title: string; desc: string; config: BlockEditorConfig }> = {
  gallery: {
    title: 'Ảnh doanh nghiệp (Trang chủ)',
    desc: 'Ảnh đang hiển thị đứng đầu là ảnh lớn; dùng mũi tên để đổi thứ tự. Khung ảnh tỉ lệ 3:2, nên dùng ảnh ngang rộng từ 1200px. Chỉ dùng ảnh thật của DANAVA và đã có sự đồng ý của người trong ảnh. Tắt "Hiển thị" để ẩn cả khu vực hoặc từng ảnh.',
    config: {
      labels: { ...COMMON, kicker: 'Dòng chữ nhỏ phía trên', title: 'Tiêu đề (*phần nhấn mạnh*)', lead: 'Câu dẫn', photos: 'Danh sách ảnh', caption: 'Chú thích trên ảnh', alt: 'Mô tả ảnh cho người khiếm thị và Google', focus: 'Phần cần giữ khi ảnh bị cắt' },
      long: ['lead'],
      enums: { focus: [{ value: '', label: 'Giữa ảnh (mặc định)' }, { value: 'top', label: 'Phía trên (khuôn mặt ở trên cao)' }, { value: 'bottom', label: 'Phía dưới' }, { value: 'left', label: 'Bên trái' }, { value: 'right', label: 'Bên phải' }] },
      itemTitle: (item, i) => {
        const photo = item && typeof item === 'object' && !Array.isArray(item) ? item : null;
        return photo ? `${i === 0 ? 'Ảnh lớn · ' : ''}${String(photo.caption || '') || 'Ảnh ' + (i + 1)}` : undefined;
      }
    }
  },
  company: {
    title: 'Thông tin công ty',
    desc: 'Dùng ở chân trang, trang Liên hệ, Về DANAVA, Trang chủ và dữ liệu có cấu trúc cho Google. Email và hotline sửa ở mục Cài đặt.',
    config: {
      labels: { ...COMMON, companyName: 'Tên pháp nhân', representative: 'Người đại diện', address: 'Địa chỉ (ngắn, hiển thị chân trang)', legalAddress: 'Địa chỉ đầy đủ (pháp lý, bản đồ)',
        street: 'Số nhà, đường (cho Google)', city: 'Tỉnh/thành (cho Google)', hours: 'Giờ làm việc', mapUrl: 'Link chỉ đường Google Maps', supportEmail: 'Email hỗ trợ kỹ thuật',
        facebook: 'Facebook (https://…)', youtube: 'YouTube (https://…)', tiktok: 'TikTok (https://…)', mission: 'Sứ mệnh (một câu)', overview: 'Giới thiệu ngắn (trang chủ)' },
      long: ['overview', 'mission']
    }
  },
  menu: {
    title: 'Menu Giải pháp',
    desc: 'Các cột trong menu "Giải pháp" trên đầu trang (máy tính) và trong menu điện thoại — chỉ chữ, không có ảnh. Mục để trống đường dẫn chỉ hiển thị, không bấm được (vd. công cụ nội bộ). Đường dẫn: /trang-trong-website/ hoặc https://…',
    config: {
      hidden: ['image'],
      labels: { ...COMMON, columns: 'Các cột', items: 'Mục trong cột', label: 'Tên', desc: 'Mô tả ngắn', href: 'Đường dẫn (để trống = chỉ hiển thị)', badge: 'Nhãn nhỏ (vd. Mới, Nội bộ)',
        footText: 'Dòng cuối menu', footLabel: 'Chữ liên kết cuối menu', footHref: 'Đường dẫn cuối menu' }
    }
  },
  pages: {
    title: 'Chữ trên các trang',
    desc: 'Dòng chữ nhỏ phía trên, tiêu đề, câu dẫn đầu trang và dải kêu gọi liên hệ cuối trang. Đặt *dấu sao* quanh phần muốn nhấn mạnh (vd. Câu chuyện *triển khai thực tế*). Để trống một ô để dùng lại chữ mặc định.',
    config: {
      labels: { ...COMMON, kicker: 'Dòng chữ nhỏ phía trên', title: 'Tiêu đề trang (H1)', lead: 'Câu dẫn', ctaTitle: 'Dải cuối trang: tiêu đề', ctaLead: 'Dải cuối trang: câu dẫn' },
      long: ['lead', 'ctaLead'],
      groupTitle: k => PAGE_NAMES[k]
    }
  },
  about: {
    title: 'Trang Về DANAVA',
    desc: 'Giá trị cốt lõi, sứ mệnh, tầm nhìn, cột mốc, ảnh hoạt động, nguyên tắc làm việc (cũng hiện ở Trang chủ) và quy trình hợp tác.',
    config: {
      labels: { ...COMMON, goals: 'Giá trị · Sứ mệnh · Tầm nhìn', n: 'Số thứ tự (I, II…)', milestones: 'Cột mốc', year: 'Năm', moments: 'Ảnh hoạt động', src: 'Ảnh',
        principles: 'Nguyên tắc làm việc (Trang chủ + Về DANAVA)', steps: 'Quy trình hợp tác (Trang chủ)' },
      hidden: ['key'],
      long: ['text']
    }
  },
  ecosystem: {
    title: 'Trang Hệ sinh thái',
    desc: 'Các khối năng lực, hành trình khách hàng, các đơn vị trong hệ sinh thái và danh sách sản phẩm đang chạy.',
    config: {
      labels: { ...COMMON, categories: 'Khối năng lực', shortDesc: 'Mô tả ngắn', allLabel: 'Mô tả chung (tất cả khối)', journey: 'Hành trình khách hàng', units: 'Đơn vị trong hệ sinh thái',
        shortName: 'Tên ngắn', category: 'Thuộc khối', categoryName: 'Tên khối (hiển thị)', categoryKicker: 'Dòng chữ nhỏ', targetAudience: 'Dành cho', features: 'Tính năng',
        officialLink: 'Liên kết chính', isExternal: 'Mở tab mới (trang ngoài)', statusText: 'Trạng thái (vd. Tư vấn theo yêu cầu)', live: 'Sản phẩm đang chạy', screenshot: 'Ảnh chụp màn hình', stage: 'Giai đoạn trên hành trình',
        group: 'Nhóm', items: 'Sản phẩm', host: 'Tên miền', note: 'Ghi chú' },
      hidden: ['id'],
      fixed: ['categories', 'journey'],
      enums: {
        category: [{ value: 'san-pham-so', label: 'Sản phẩm số' }, { value: 'du-lich-su-kien', label: 'Sự kiện & Du lịch' }, { value: 'cong-dong', label: 'Cộng đồng' }],
        stage: [{ value: '', label: '(không gắn)' }, { value: 'thu-hut', label: 'Thu hút' }, { value: 'van-hanh', label: 'Vận hành' }, { value: 'gan-ket', label: 'Gắn kết' }, { value: 'trai-nghiem', label: 'Trải nghiệm' }]
      }
    }
  },
  staff: {
    title: 'Hồ sơ nhân sự',
    desc: 'Nội dung thẻ trên trang Đội ngũ và trang hồ sơ từng người. Họ tên, chức danh, ảnh sửa ở mục Nhân sự.',
    config: {
      labels: { ...COMMON, '': 'Hồ sơ theo từng người', departmentId: 'Phòng ban (dùng cho bộ lọc)', departmentName: 'Tên phòng ban (thẻ Đội ngũ)', departmentKicker: 'Dòng chữ nhỏ (thẻ Đội ngũ)', expertise: 'Chuyên môn',
        bio: 'Giới thiệu ngắn (thẻ Đội ngũ)', portfolio: 'Liên kết nổi bật', desc: 'Mô tả', profileDepartmentName: 'Tên phòng ban (trang hồ sơ)', profileDepartmentKicker: 'Dòng chữ nhỏ (trang hồ sơ)',
        intro: 'Giới thiệu (trang hồ sơ)', experienceYears: 'Kinh nghiệm (vd. 7+ năm kinh nghiệm)', skillGroups: 'Nhóm kỹ năng', category: 'Tên nhóm', skills: 'Kỹ năng',
        personalProducts: 'Sản phẩm / đóng góp cá nhân', verifiedLinks: 'Liên kết liên hệ', type: 'Loại liên kết',
        projectRoles: 'Vai trò trong dự án', projectId: 'Dự án', role: 'Vai trò', contributions: 'Đóng góp', resultHighlight: 'Kết quả nổi bật' },
      hidden: ['id'],
      fixed: [''],
      long: ['bio', 'intro', 'desc', 'description'],
      enums: {
        departmentId: [{ value: 'ky-thuat', label: 'Kỹ thuật' }, { value: 'truyen-thong', label: 'Truyền thông' }, { value: 'kinh-doanh', label: 'Kinh doanh' }, { value: 'van-hanh', label: 'Vận hành' }],
        type: [{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Điện thoại' }, { value: 'external', label: 'Trang ngoài' }, { value: 'internal', label: 'Trang trong website' }]
      }
    }
  },
  privacy: {
    title: 'Chính sách quyền riêng tư',
    desc: 'Trang /chinh-sach-rieng-tu/. Trong ô nội dung: dòng trống tách đoạn, dòng bắt đầu bằng "- " là danh sách, "> " là ô ghi chú, **chữ đậm**, `tên miền`, [chữ](/duong-dan).',
    config: {
      labels: { ...COMMON, eyebrow: 'Dòng chữ nhỏ phía trên', lead: 'Câu dẫn', badges: 'Nhãn dưới tiêu đề', summary: 'Tóm tắt (4 thẻ)', sections: 'Các mục', toc: 'Tên trong mục lục', body: 'Nội dung mục',
        storage: 'Bảng thời gian lưu trữ', type: 'Loại dữ liệu', mechanism: 'Cơ chế lưu trữ', retention: 'Thời gian lưu trữ', access: 'Phân quyền truy cập',
        rights: 'Quyền của khách hàng', pendingBadge: 'Nhãn mục chờ xác nhận', pending: 'Điều khoản chờ xác nhận', tag: 'Mã xác nhận', status: 'Trạng thái',
        issuerAddress: 'Địa chỉ đơn vị chịu trách nhiệm', issuerEmailNote: 'Ghi chú email' },
      hidden: ['id'],
      long: ['body', 'text', 'lead']
    }
  },
  servicePolicy: {
    title: 'Chính sách dịch vụ',
    desc: 'Trang /chinh-sach-dich-vu/: 3 nhóm dịch vụ, cam kết thời gian xử lý (SLA), kênh hỗ trợ và điều khoản dự thảo.',
    config: {
      labels: { ...COMMON, version: 'Phiên bản', lastUpdated: 'Ngày cập nhật', effectiveDate: 'Phạm vi áp dụng', groups: 'Nhóm dịch vụ', tagline: 'Mô tả ngắn',
        scopeOfSupport: 'Phạm vi hỗ trợ', warrantyTerms: 'Bảo hành', ownershipAndHandover: 'Quyền sở hữu & bàn giao', exclusions: 'Không bao gồm',
        sla: 'Cam kết thời gian xử lý (SLA)', levelLabel: 'Mức độ', priorityText: 'Ưu tiên', scenario: 'Tình huống', firstResponseTime: 'Phản hồi đầu tiên', resolutionTime: 'Thời gian khắc phục', contactChannel: 'Kênh liên hệ',
        channels: 'Kênh hỗ trợ', value: 'Giá trị hiển thị', workingHours: 'Giờ hỗ trợ', drafts: 'Điều khoản dự thảo', code: 'Mã', targetService: 'Áp dụng cho',
        proposedContent: 'Nội dung đề xuất', status: 'Trạng thái', impactAnalysis: 'Phân tích ảnh hưởng' },
      hidden: ['id', 'category', 'level'],
      fixed: ['groups', 'sla'],
      long: ['proposedContent', 'impactAnalysis', 'scenario', 'description']
    }
  }
};
