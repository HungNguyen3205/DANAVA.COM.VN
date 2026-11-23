import type { Person, Project } from './content';
import { verifiedProjects } from './verified-projects.ts';

export type StaffDeptId = 'all' | 'ky-thuat' | 'truyen-thong' | 'kinh-doanh' | 'van-hanh';

export interface StaffPortfolioItem {
  title: string;
  href: string;
  desc: string;
  badge?: string;
}

export interface StaffDetail {
  departmentId: 'ky-thuat' | 'truyen-thong' | 'kinh-doanh' | 'van-hanh';
  departmentName: string;
  departmentKicker: string;
  expertise: string[];
  bio: string;
  portfolio: StaffPortfolioItem[];
}

export interface StaffProjectContribution {
  projectId: string;
  projectSlug: string;
  projectTitle: string;
  client: string;
  category: string;
  image: string;
  summary: string;
  roleInProject: string;
  contributions: string[];
  resultHighlight?: string;
}

export interface PersonalProduct {
  title: string;
  description: string;
  badge: string;
  link?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface VerifiedLink {
  label: string;
  url: string;
  type: 'email' | 'phone' | 'external' | 'internal';
}

export interface StaffFullProfile {
  id: string;
  name: string;
  role: string;
  departmentId: 'ky-thuat' | 'truyen-thong' | 'kinh-doanh' | 'van-hanh';
  departmentName: string;
  departmentKicker: string;
  intro: string;
  experienceYears: string;
  skillGroups: SkillGroup[];
  projects: StaffProjectContribution[];
  personalProducts: PersonalProduct[];
  verifiedLinks: VerifiedLink[];
}

export const STAFF_DEPARTMENTS: { id: StaffDeptId; label: string; shortDesc: string }[] = [
  { id: 'all', label: 'Tất cả phòng ban', shortDesc: 'Toàn bộ chuyên gia công nghệ, truyền thông, kinh doanh và vận hành' },
  { id: 'ky-thuat', label: 'Kỹ thuật', shortDesc: 'Kiến trúc phần mềm, phát triển sản phẩm Studio và thiết kế UI/UX' },
  { id: 'truyen-thong', label: 'Truyền thông', shortDesc: 'Chiến lược nội dung, sản xuất media, vận hành Fanpage & Zalo OA' },
  { id: 'kinh-doanh', label: 'Kinh doanh', shortDesc: 'Tư vấn giải pháp, onboarding quy trình và chăm sóc đối tác' },
  { id: 'van-hanh', label: 'Vận hành', shortDesc: 'Quản lý dự án triển khai, tích hợp thiết bị phần cứng QR và kiểm thử' }
];

// Bản đồ phân công vai trò trong từng dự án thực tế (đồng bộ tuyệt đối với /du-an/[slug])
export const PROJECT_STAFF_ASSIGNMENTS: Record<string, Record<string, { role: string; contributions: string[]; resultHighlight?: string }>> = {
  'hariver-studio': {
    thanh: {
      role: 'Chỉ đạo giải pháp & Kiến trúc hệ thống DANAVA Studio',
      contributions: [
        'Thiết kế kiến trúc cơ sở dữ liệu hội viên và cơ chế quản lý thời hạn thẻ tập',
        'Tích hợp API kết nối quầy thu ngân với máy quét QR Code và cổng kiểm soát',
        'Tối ưu hóa hiệu năng đồng bộ dữ liệu thời gian thực giữa quầy và app di động'
      ],
      resultHighlight: 'Xử lý mượt mà hơn 150 lượt check-in mỗi giờ cao điểm không xảy ra nghẽn mạng'
    },
    trang: {
      role: 'Triển khai vận hành quầy & Đào tạo nghiệp vụ lễ tân',
      contributions: [
        'Khảo sát trực tiếp luồng khách ra vào thực tế tại trung tâm HARIVER Đà Nẵng',
        'Soạn thảo quy trình thao tác chuẩn và đào tạo đội ngũ lễ tân sử dụng thuần thục',
        'Thiết lập quy trình nhắc hạn gói và chăm sóc hội viên tái ký tự động'
      ],
      resultHighlight: 'Đội ngũ lễ tân làm chủ phần mềm chỉ sau 2 buổi hướng dẫn trực tiếp'
    },
    avinash: {
      role: 'Thiết kế nhận diện số & Giao diện app hội viên HARIVER',
      contributions: [
        'Thiết kế Design System cho màn hình quầy lễ tân và bảng điều khiển quản trị',
        'Chuẩn hóa trải nghiệm người dùng (UX) ứng dụng di động cho hội viên xem thẻ tập',
        'Đồng bộ bảng màu nhận diện thương hiệu HARIVER xuyên suốt các giao diện số'
      ],
      resultHighlight: 'Giao diện thân thiện, học viên dễ dàng mở mã QR check-in trong 3 giây'
    },
    thong: {
      role: 'Quản lý triển khai kỹ thuật & Tích hợp thiết bị check-in',
      contributions: [
        'Trực tiếp lắp đặt đầu đọc thẻ mã QR, camera nhận diện và máy in bill tại quầy',
        'Cấu hình hạ tầng mạng nội bộ kết nối bảo mật với máy chủ đám mây DANAVA',
        'Kiểm thử khả năng phục hồi dữ liệu khi mất kết nối Internet tạm thời'
      ],
      resultHighlight: 'Cụm thiết bị phần cứng vận hành ổn định liên tục 7 ngày trong tuần'
    },
    nam: {
      role: 'Chiến lược truyền thông số & Ra mắt nhận diện app hội viên',
      contributions: [
        'Hoạch định kênh tiếp cận hội viên tại khu vực Đà Nẵng qua Fanpage và Zalo OA',
        'Sản xuất video hướng dẫn học viên tải app và sử dụng mã check-in điện tử',
        'Đo lường chi phí thu hút hội viên mới và tỷ lệ tương tác với bài truyền thông'
      ],
      resultHighlight: 'Hơn 85% hội viên hiện hữu chuyển sang dùng app số hóa trong tháng đầu'
    }
  },
  'hue-studio': {
    thanh: {
      role: 'Chỉ đạo giải pháp & Tối ưu luồng đặt lịch Pilates/Yoga',
      contributions: [
        'Xây dựng thuật toán xếp lịch lớp và cơ chế tự động khóa ca tập khi đủ sĩ số',
        'Tích hợp danh sách chờ (Waitlist) tự động đôn người tiếp theo khi có người hủy ca',
        'Phân quyền quản trị linh hoạt giữa chủ studio, quản lý và huấn luyện viên'
      ],
      resultHighlight: 'Chấm dứt hoàn toàn tình trạng trùng lịch và vượt sĩ số lớp Reformer'
    },
    trang: {
      role: 'Đào tạo nhân sự & Hướng dẫn hội viên sử dụng app',
      contributions: [
        'Onboarding trực tiếp đội ngũ nhân sự và huấn luyện viên tại TP. Huế',
        'Xây dựng kịch bản hướng dẫn học viên Pilates thao tác đặt chỗ và hủy ca hợp lệ',
        'Hỗ trợ kỹ thuật và chăm sóc cơ sở 24/7 trong suốt giai đoạn vận hành thử nghiệm'
      ],
      resultHighlight: 'Tỷ lệ hội viên tự thao tác đặt chỗ qua app đạt trên 90%'
    },
    avinash: {
      role: 'Thiết kế giao diện thời khóa biểu & Trải nghiệm đặt chỗ',
      contributions: [
        'Thiết kế giao diện lịch tập trực quan theo tuần dành riêng cho học viên Pilates',
        'Tối ưu hóa hành trình 1-chạm đặt lịch và thông báo nhắc giờ tập tự động',
        'Giao diện chuyên biệt cho huấn luyện viên điểm danh học viên tại phòng máy'
      ],
      resultHighlight: 'Trải nghiệm đặt lịch sang trọng, tinh tế đúng với định vị studio cao cấp'
    },
    thong: {
      role: 'Quản lý triển khai hệ thống & Kiểm thử sĩ số lớp học',
      contributions: [
        'Cấu hình hệ thống máy tính bảng quản lý lớp và máy in phiếu điểm danh',
        'Kiểm thử thực địa tính năng tự động chuyển trạng thái khi lớp đầy sĩ số 6 người',
        'Bàn giao hồ sơ kỹ thuật và hướng dẫn xử lý các tình huống phát sinh tại studio'
      ],
      resultHighlight: 'Bàn giao đúng tiến độ cam kết trước ngày khai trương chính thức'
    },
    nam: {
      role: 'Tư vấn truyền thông thương hiệu & Thu hút học viên lớp tập',
      contributions: [
        'Xây dựng thông điệp truyền thông về mô hình tập luyện chuyên sâu ít người',
        'Tư vấn tối ưu trang Fanpage studio và thiết lập kịch bản chatbox tự động',
        'Tổ chức chiến dịch quảng cáo định vị studio Pilates hàng đầu tại Huế'
      ],
      resultHighlight: 'Lấp đầy 100% các ca tập trong tuần lễ khai trương cơ sở mới'
    }
  }
};

export function getStaffDetail(person: Person): StaffDetail {
  if (person.id === 'thanh') {
    return {
      departmentId: 'ky-thuat',
      departmentName: 'Kỹ thuật',
      departmentKicker: 'KIẾN TRÚC & PHÁT TRIỂN HỆ THỐNG',
      expertise: ['Kiến trúc hệ thống phần mềm', 'Phần mềm quản lý Studio', 'Chuyển đổi số thể thao & wellness'],
      bio: 'Hơn 10 năm kinh nghiệm định hướng kiến trúc công nghệ và chuyển đổi số. Trực tiếp chỉ đạo nghiên cứu & phát triển lõi phần mềm DANAVA Studio, hạ tầng dữ liệu và tích hợp phần cứng cho các chuỗi phòng tập.',
      portfolio: [
        {
          title: 'HARIVER Gym & Fitness',
          href: '/du-an/hariver-gym-danava-studio/',
          desc: 'Số hóa quản trị hội viên, lớp học và tích hợp QR check-in cửa từ',
          badge: 'Dự án trọng điểm'
        },
        {
          title: 'Huế Pilates Studio',
          href: '/du-an/hue-pilates-yoga-danava-studio/',
          desc: 'Triển khai phần mềm quản lý lịch lớp, gói tập và gia hạn tự động',
          badge: 'Studio cao cấp'
        },
        {
          title: 'Giải pháp DANAVA Studio',
          href: '/giai-phap/danava-studio/',
          desc: 'Nền tảng phần mềm quản lý chuyên sâu thể thao & làm đẹp',
          badge: 'Sản phẩm cốt lõi'
        }
      ]
    };
  }

  if (person.id === 'avinash') {
    return {
      departmentId: 'ky-thuat',
      departmentName: 'Kỹ thuật',
      departmentKicker: 'THIẾT KẾ TRẢI NGHIỆM & SÁNG TẠO',
      expertise: ['UI/UX Design đa nền tảng', 'Trải nghiệm Mobile & Dashboard', 'Nhận diện thương hiệu số'],
      bio: 'Giám đốc sáng tạo chịu trách nhiệm về tư duy thiết kế trực quan, chuẩn hóa trải nghiệm người dùng (UX) và Design System xuyên suốt cho app di động DANAVA Studio và các trang web đối tác.',
      portfolio: [
        {
          title: 'HARIVER Gym & Fitness',
          href: '/du-an/hariver-gym-danava-studio/',
          desc: 'Thiết kế giao diện bảng điều khiển quầy lễ tân và app hội viên',
          badge: 'UI/UX Design'
        },
        {
          title: 'Thiết kế Website & Landing Page',
          href: '/giai-phap/thiet-ke-website/',
          desc: 'Chuẩn hóa trải nghiệm responsive và hiệu ứng tương tác hiện đại',
          badge: 'Giải pháp số'
        },
        {
          title: 'Bản tin Cổng Năng Lượng',
          href: '/blogs/cong-nang-luong/',
          desc: 'Ấn phẩm truyền thông trực quan và nhận diện số',
          badge: 'Ấn phẩm số'
        }
      ]
    };
  }

  if (person.id === 'nam') {
    return {
      departmentId: 'truyen-thong',
      departmentName: 'Truyền thông',
      departmentKicker: 'SỰ KIỆN & TRUYỀN THÔNG',
      expertise: ['Truyền thông sự kiện', 'Nội dung & hình ảnh thương hiệu', 'Kết nối cộng đồng'],
      bio: 'Phụ trách truyền thông cho sự kiện và các hoạt động cộng đồng của DANAVA.',
      portfolio: [
        {
          title: 'Tổ chức sự kiện',
          href: '/giai-phap/su-kien-truyen-thong/',
          desc: 'Kịch bản, sân khấu, thi công và điều phối chương trình',
          badge: 'Giải pháp dịch vụ'
        },
        {
          title: 'Cộng đồng Yoga Club Vietnam',
          href: '/giai-phap/cong-dong/',
          desc: 'Mạng lưới kết nối và phát triển cộng đồng người yêu yoga toàn quốc',
          badge: 'Cộng đồng'
        },
        {
          title: 'Chuỗi sự kiện Cổng Năng Lượng',
          href: '/du-an/',
          desc: 'Tổ chức sự kiện truyền thông và lan tỏa nhận diện thương hiệu',
          badge: 'Chiến dịch'
        }
      ]
    };
  }

  if (person.id === 'trang') {
    return {
      departmentId: 'kinh-doanh',
      departmentName: 'Kinh doanh',
      departmentKicker: 'TƯ VẤN & CHĂM SÓC ĐỐI TÁC',
      expertise: ['Tư vấn giải pháp chuyển đổi', 'Đào tạo nhân sự quầy lễ tân', 'Chăm sóc & đồng hành đối tác'],
      bio: 'Phụ trách tư vấn lộ trình chuyển đổi số phù hợp từng mô hình kinh doanh, trực tiếp đào tạo kỹ năng sử dụng phần mềm cho đội ngũ lễ tân và hỗ trợ vận hành 24/7.',
      portfolio: [
        {
          title: 'Huế Pilates Studio',
          href: '/du-an/hue-pilates-yoga-danava-studio/',
          desc: 'Hỗ trợ onboarding đội ngũ quầy và quy trình chăm sóc hội viên',
          badge: 'Đồng hành thực tế'
        },
        {
          title: 'Quy trình triển khai 4 bước',
          href: '/giai-phap/danava-studio/#quy-trinh',
          desc: 'Quy trình khảo sát, cài đặt và đào tạo trực tiếp tại cơ sở đối tác',
          badge: 'Tiêu chuẩn dịch vụ'
        },
        {
          title: 'Tư vấn giải pháp phòng tập',
          href: '/lien-he/?service=DANAVA+Studio',
          desc: 'Kênh tiếp nhận nhu cầu và khảo sát hiện trạng miễn phí',
          badge: 'Tư vấn trực tiếp'
        }
      ]
    };
  }

  if (person.id === 'thong') {
    return {
      departmentId: 'van-hanh',
      departmentName: 'Vận hành',
      departmentKicker: 'TRIỂN KHAI & HẠ TẦNG KỸ THUẬT',
      expertise: ['Quản lý dự án triển khai', 'Tích hợp phần cứng & QR Scan', 'Kiểm thử quy trình thực tế'],
      bio: 'Giám sát tiến độ bàn giao công nghệ tại cơ sở, cấu hình thiết bị đầu đọc mã QR, cổng phân làn và máy in hóa đơn, kiểm soát chất lượng kỹ thuật trước khi vận hành thực tế.',
      portfolio: [
        {
          title: 'HARIVER Gym & Fitness',
          href: '/du-an/hariver-gym-danava-studio/',
          desc: 'Lắp đặt thiết bị quầy lễ tân và kết nối hệ thống camera, máy quét QR',
          badge: 'Triển khai phần cứng'
        },
        {
          title: 'Hạ tầng hệ thống DANAVA Studio',
          href: '/giai-phap/danava-studio/',
          desc: 'Kiểm soát dữ liệu vận hành an toàn và sao lưu dự phòng',
          badge: 'Hạ tầng hệ thống'
        },
        {
          title: 'Nguyên tắc làm việc DANAVA',
          href: '/ve-danava/#nguyen-tac',
          desc: 'Cam kết chất lượng dịch vụ và quy trình bảo trì định kỳ',
          badge: 'Quy chuẩn bàn giao'
        }
      ]
    };
  }

  // Fallback thông minh cho nhân sự mới thêm từ CMS
  const r = (person.role || '').toLowerCase();
  let deptId: 'ky-thuat' | 'truyen-thong' | 'kinh-doanh' | 'van-hanh' = 'ky-thuat';
  let deptName = 'Kỹ thuật';
  let deptKicker = 'CÔNG NGHỆ & SẢN PHẨM';

  if (/truyền thông|marketing|media|content|báo chí|quảng cáo|ads/i.test(r)) {
    deptId = 'truyen-thong';
    deptName = 'Truyền thông';
    deptKicker = 'TRUYỀN THÔNG & TIẾP THỊ';
  } else if (/kinh doanh|cskh|bán hàng|tư vấn|sale|business|khách hàng/i.test(r)) {
    deptId = 'kinh-doanh';
    deptName = 'Kinh doanh';
    deptKicker = 'KINH DOANH & ĐỐI TÁC';
  } else if (/vận hành|hạ tầng|triển khai|manager|quản lý|ops|operation/i.test(r)) {
    deptId = 'van-hanh';
    deptName = 'Vận hành';
    deptKicker = 'VẬN HÀNH & TRIỂN KHAI';
  }

  return {
    departmentId: deptId,
    departmentName: deptName,
    departmentKicker: deptKicker,
    expertise: [person.role || 'Chuyên môn', 'Giải pháp số', 'DANAVA Solutions'],
    bio: `${person.name} phụ trách vai trò ${person.role} tại DANAVA Solutions, trực tiếp đồng hành chuyên môn trong các dự án công nghệ và giải pháp thực tế.`,
    portfolio: [
      {
        title: 'Hồ sơ dự án thực tế DANAVA',
        href: '/du-an/',
        desc: 'Các dự án chuyển đổi số và truyền thông thương hiệu đã nghiệm thu',
        badge: 'Dự án thực tế'
      },
      {
        title: 'Hệ sinh thái giải pháp số',
        href: '/giai-phap/',
        desc: 'Bộ công cụ số hóa toàn diện dành cho doanh nghiệp và cơ sở thể thao',
        badge: 'Hệ sinh thái'
      }
    ]
  };
}

export function getStaffInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'D';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  return (prev[0] + last[0]).toUpperCase();
}

/**
 * Tạo hồ sơ Portfolio cá nhân đầy đủ và đã xác minh từ dữ liệu thực
 */
export function getStaffProfile(person: Person, allProjects: Project[]): StaffFullProfile {
  const detail = getStaffDetail(person);

  // 1. Trích xuất các dự án đã tham gia từ quan hệ đồng nhất với /du-an/[slug]
  const projects: StaffProjectContribution[] = [];
  const projectMap = new Map<string, Project>();
  for (const vp of verifiedProjects) {
    if (vp.published) projectMap.set(vp.id, vp);
  }
  for (const p of (allProjects || [])) {
    if (p.published) {
      projectMap.set(p.id, p);
    } else {
      // Nếu dự án bị gỡ xuất bản trong CMS thì loại bỏ
      projectMap.delete(p.id);
    }
  }
  const publishedProjects = Array.from(projectMap.values());

  for (const project of publishedProjects) {
    const assignment = PROJECT_STAFF_ASSIGNMENTS[project.id]?.[person.id];
    if (assignment) {
      projects.push({
        projectId: project.id,
        projectSlug: project.slug,
        projectTitle: project.title,
        client: project.client,
        category: project.category,
        image: project.image,
        summary: project.summary,
        roleInProject: assignment.role,
        contributions: assignment.contributions,
        resultHighlight: assignment.resultHighlight
      });
    }
  }

  // 2. Kỹ năng chuyên môn, sản phẩm cá nhân và link nghề nghiệp theo từng nhân sự
  if (person.id === 'thanh') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: 'ky-thuat',
      departmentName: 'Kỹ thuật & Công nghệ',
      departmentKicker: 'KIẾN TRÚC HỆ THỐNG & PHÁT TRIỂN SẢN PHẨM',
      intro: 'Người sáng lập kiêm kiến trúc sư trưởng tại DANAVA Solutions. Tập trung nghiên cứu và xây dựng các giải pháp phần mềm quản trị chuyên sâu cho ngành thể thao, thể hình và chăm sóc sức khỏe. Luôn tâm niệm công nghệ phải thiết thực, vận hành tin cậy và giải phóng sức lao động cho người làm kinh doanh.',
      experienceYears: '10+ năm kinh nghiệm',
      skillGroups: [
        {
          category: 'Kiến trúc & Công nghệ',
          skills: ['System Architecture', 'Node.js & TypeScript', 'Next.js App Router', 'SQLite / PostgreSQL', 'RESTful API & Webhooks']
        },
        {
          category: 'Nghiệp vụ chuyên sâu',
          skills: ['Chuyển đổi số Thể thao & Wellness', 'Quản trị Hội viên & Hạn thẻ', 'Hạ tầng QR Check-in', 'Bảo mật & Sao lưu thời gian thực']
        }
      ],
      projects,
      personalProducts: [
        {
          title: 'DANAVA Studio Core Engine',
          description: 'Hạt nhân phần mềm quản lý gói tập, phân quyền quầy lễ tân và lịch lớp thể thao chuyên sâu.',
          badge: 'Lõi sản phẩm',
          link: '/giai-phap/danava-studio/'
        },
        {
          title: 'Multi-Branch Sync Architecture',
          description: 'Kiến trúc đồng bộ dữ liệu thời gian thực giữa quầy thu ngân tại cơ sở và ứng dụng đám mây.',
          badge: 'Hạ tầng kỹ thuật'
        }
      ],
      verifiedLinks: [
        { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
        { label: '0935 917 677', url: 'tel:0935917677', type: 'phone' },
        { label: 'Tư vấn giải pháp Studio', url: '/lien-he/?service=DANAVA+Studio&ref=thanh', type: 'internal' }
      ]
    };
  }

  if (person.id === 'avinash') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: 'ky-thuat',
      departmentName: 'Kỹ thuật & Thiết kế',
      departmentKicker: 'THIẾT KẾ TRẢI NGHIỆM & ĐỒNG BỘ NHẬN DIỆN',
      intro: 'Giám đốc sáng tạo chịu trách nhiệm về tư duy mỹ thuật trực quan và trải nghiệm người dùng tại DANAVA Solutions. Từng thiết kế nhiều giao diện ứng dụng quản lý, ứng dụng hội viên và hệ thống nhận diện số cao cấp cho các thương hiệu thể thao, mang lại sự liền mạch và tự nhiên trong từng thao tác chạm.',
      experienceYears: '8+ năm kinh nghiệm',
      skillGroups: [
        {
          category: 'Thiết kế UI/UX',
          skills: ['Figma Design Systems', 'Mobile App UX (iOS & Android)', 'Web Application Dashboard', 'Wireframing & Prototyping', 'Usability Testing']
        },
        {
          category: 'Nhận diện & Tương tác',
          skills: ['Brand Identity Design', 'Visual Guidelines', 'Responsive Grid Systems', 'Micro-interactions', 'Accessible Typography']
        }
      ],
      projects,
      personalProducts: [
        {
          title: 'DANAVA Design System & Token Tokens',
          description: 'Bộ quy chuẩn giao diện và thư viện component chuẩn hóa cho Web & Mobile app DANAVA.',
          badge: 'Design System'
        },
        {
          title: 'Member Mobile Experience Kit',
          description: 'Khung trải nghiệm đặt chỗ 1-chạm và thẻ hội viên số hóa dành riêng cho phòng tập cao cấp.',
          badge: 'Ứng dụng di động'
        }
      ],
      verifiedLinks: [
        { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
        { label: 'Trao đổi ý tưởng UI/UX', url: '/lien-he/?service=Website&ref=avinash', type: 'internal' }
      ]
    };
  }

  if (person.id === 'nam') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: 'truyen-thong',
      departmentName: 'Truyền thông & Tiếp thị',
      departmentKicker: 'CHIẾN LƯỢC TRUYỀN THÔNG & TĂNG TRƯỞNG SỐ',
      intro: 'Phụ trách hoạch định chiến lược tăng trưởng khách hàng tiềm năng và xây dựng thương hiệu số tại DANAVA Solutions. Chú trọng các chiến dịch truyền thông đa kênh dựa trên số liệu đo lường thực tế, chuyển hóa sự quan tâm của cộng đồng thành học viên gắn bó lâu dài.',
      experienceYears: '7+ năm kinh nghiệm',
      skillGroups: [
        {
          category: 'Tiếp thị số & Quảng cáo',
          skills: ['Meta Ads Specialist', 'Google Ads & Performance Max', 'Zalo Official Account', 'Tối ưu phễu chuyển đổi (Conversion Funnel)']
        },
        {
          category: 'Nội dung & Cộng đồng',
          skills: ['Content Strategy', 'Sản xuất Media & Video ngắn', 'Phát triển Cộng đồng thể thao', 'Phân tích dữ liệu tiếp thị (Data Analytics)']
        }
      ],
      projects,
      personalProducts: [
        {
          title: 'Yoga Club Vietnam Community Hub',
          description: 'Cộng đồng yoga và chuỗi sự kiện, workshop tại Đà Nẵng.',
          badge: 'Cộng đồng',
          link: '/giai-phap/cong-dong/'
        }
      ],
      verifiedLinks: [
        { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
        { label: 'Trao đổi về sự kiện & truyền thông', url: '/lien-he/?service=su-kien-truyen-thong&ref=nam', type: 'internal' }
      ]
    };
  }

  if (person.id === 'trang') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: 'kinh-doanh',
      departmentName: 'Kinh doanh & Khách hàng',
      departmentKicker: 'TƯ VẤN LỘ TRÌNH & ĐỒNG HÀNH VẬN HÀNH',
      intro: 'Người kết nối mật thiết giữa nhu cầu thực tế của chủ phòng tập và giải pháp công nghệ của DANAVA. Trực tiếp hướng dẫn, đào tạo đội ngũ nhân viên quầy và đồng hành giải quyết mọi vướng mắc vận hành để đảm bảo quá trình số hóa diễn ra êm đẹp và hiệu quả.',
      experienceYears: '6+ năm kinh nghiệm',
      skillGroups: [
        {
          category: 'Nghiệp vụ & Đào tạo',
          skills: ['Onboarding nhân sự quầy lễ tân', 'Tối ưu quy trình thu ngân', 'Kịch bản xử lý phàn nàn', 'Quản trị quan hệ khách hàng (CRM)']
        },
        {
          category: 'Tư vấn giải pháp',
          skills: ['Khảo sát hiện trạng cơ sở', 'Phân tích hành vi hội viên', 'Quy trình nhắc hạn gói tự động', 'Đồng hành hỗ trợ 24/7']
        }
      ],
      projects,
      personalProducts: [
        {
          title: '15-Minute Receptionist Onboarding Kit',
          description: 'Bộ quy chuẩn đào tạo nhanh giúp nhân viên quầy mới làm quen và sử dụng phần mềm trong 15 phút.',
          badge: 'Quy trình nghiệp vụ'
        },
        {
          title: 'Member Retention & Renewal Guide',
          description: 'Bộ kịch bản chăm sóc khách hàng và gia hạn gói tập gia tăng tỷ lệ giữ chân hội viên trên 40%.',
          badge: 'Tài liệu độc quyền'
        }
      ],
      verifiedLinks: [
        { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
        { label: '0935 917 677', url: 'tel:0935917677', type: 'phone' },
        { label: 'Yêu cầu tư vấn lộ trình', url: '/lien-he/?service=Tu+van&ref=trang', type: 'internal' }
      ]
    };
  }

  if (person.id === 'thong') {
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      departmentId: 'van-hanh',
      departmentName: 'Vận hành & Kỹ thuật',
      departmentKicker: 'TRIỂN KHAI PHẦN CỨNG & BẢO HÀNH THỰC ĐỊA',
      intro: 'Chuyên gia phụ trách lắp đặt phần cứng và kiểm soát chất lượng kỹ thuật tại cơ sở của đối tác. Đảm bảo mọi thiết bị máy quét, cổng từ và hạ tầng mạng luôn hoạt động chính xác trong mọi điều kiện vận hành thực tế.',
      experienceYears: '6+ năm kinh nghiệm',
      skillGroups: [
        {
          category: 'Thiết bị & Tích hợp phần cứng',
          skills: ['Tích hợp đầu đọc QR Code', 'Cổng từ phân làn thông minh', 'Máy in hóa đơn nhiệt POS', 'Hạ tầng mạng LAN & IoT']
        },
        {
          category: 'Quản lý dự án & Kiểm thử',
          skills: ['Triển khai thực địa tại cơ sở', 'Kiểm thử áp lực hệ thống', 'Khắc phục sự cố tại chỗ', 'Quy trình bảo trì định kỳ']
        }
      ],
      projects,
      personalProducts: [
        {
          title: 'Hardware QR Bridge Protocol',
          description: 'Giải pháp kết nối trực tiếp đầu đọc thẻ mã QR với phần mềm quản trị qua mạng cục bộ siêu tốc.',
          badge: 'Giải pháp phần cứng'
        },
        {
          title: 'Facility Stress-Test Protocol',
          description: 'Quy trình kiểm thử khả năng chịu tải check-in và đóng mở cổng từ tự động trước ngày vận hành.',
          badge: 'Quy chuẩn kỹ thuật'
        }
      ],
      verifiedLinks: [
        { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
        { label: 'Yêu cầu hỗ trợ kỹ thuật', url: '/lien-he/?service=Ky+thuat&ref=thong', type: 'internal' }
      ]
    };
  }

  // Fallback chung cho nhân sự thêm mới từ CMS
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    departmentId: detail.departmentId,
    departmentName: detail.departmentName,
    departmentKicker: detail.departmentKicker,
    intro: detail.bio,
    experienceYears: 'Chuyên viên DANAVA',
    skillGroups: [
      {
        category: 'Chuyên môn cốt lõi',
        skills: detail.expertise
      }
    ],
    projects,
    personalProducts: [
      {
        title: 'Giải pháp đồng hành DANAVA Solutions',
        description: `Đóng góp chuyên môn trong vai trò ${person.role} tại DANAVA Solutions.`,
        badge: 'Chuyên môn'
      }
    ],
    verifiedLinks: [
      { label: 'hello@danava.vn', url: 'mailto:hello@danava.vn', type: 'email' },
      { label: 'Kết nối làm việc', url: `/lien-he/?service=${encodeURIComponent(person.role)}&ref=${person.id}`, type: 'internal' }
    ]
  };
}

/* ------------------------------------------------------------------
 * Hồ sơ chỉnh sửa trong CMS (lib/blocks.ts → khối "staff").
 * Dự án vẫn lấy từ danh sách đã xuất bản (giống getStaffProfile) để không hiện dự án đã gỡ.
 * ------------------------------------------------------------------ */
export type StaffEdit = {
  departmentId: string; departmentName: string; departmentKicker: string; expertise: string[]; bio: string;
  portfolio: { title: string; href: string; desc: string; badge: string }[];
  profileDepartmentName: string; profileDepartmentKicker: string; intro: string; experienceYears: string;
  skillGroups: SkillGroup[];
  personalProducts: { title: string; description: string; badge: string; link: string }[];
  verifiedLinks: { label: string; url: string; type: string }[];
  projectRoles: { projectId: string; role: string; contributions: string[]; resultHighlight: string }[];
};
const DEPTS = ['ky-thuat', 'truyen-thong', 'kinh-doanh', 'van-hanh'] as const;
const dept = (v: string) => (DEPTS as readonly string[]).includes(v) ? v as StaffDetail['departmentId'] : 'van-hanh';

export function staffDetailFromEdit(e: StaffEdit): StaffDetail {
  return {
    departmentId: dept(e.departmentId), departmentName: e.departmentName, departmentKicker: e.departmentKicker,
    expertise: e.expertise, bio: e.bio,
    portfolio: e.portfolio.map(p => ({ title: p.title, href: p.href, desc: p.desc, ...(p.badge ? { badge: p.badge } : {}) }))
  };
}

export function staffProfileFromEdit(person: Person, allProjects: Project[], e: StaffEdit): StaffFullProfile {
  const map = new Map<string, Project>();
  for (const vp of verifiedProjects) if (vp.published) map.set(vp.id, vp);
  for (const p of allProjects || []) { if (p.published) map.set(p.id, p); else map.delete(p.id); }
  const projects: StaffProjectContribution[] = [];
  for (const r of e.projectRoles) {
    const project = map.get(r.projectId);
    if (!project) continue;
    projects.push({
      projectId: project.id, projectSlug: project.slug, projectTitle: project.title, client: project.client, category: project.category,
      image: project.image, summary: project.summary, roleInProject: r.role, contributions: r.contributions,
      ...(r.resultHighlight ? { resultHighlight: r.resultHighlight } : {})
    });
  }
  const linkType = (t: string): VerifiedLink['type'] => (['email', 'phone', 'external', 'internal'].includes(t) ? t as VerifiedLink['type'] : 'external');
  return {
    id: person.id, name: person.name, role: person.role,
    departmentId: dept(e.departmentId), departmentName: e.profileDepartmentName || e.departmentName, departmentKicker: e.profileDepartmentKicker || e.departmentKicker,
    intro: e.intro, experienceYears: e.experienceYears, skillGroups: e.skillGroups, projects,
    personalProducts: e.personalProducts.map(p => ({ title: p.title, description: p.description, badge: p.badge, ...(p.link ? { link: p.link } : {}) })),
    verifiedLinks: e.verifiedLinks.map(l => ({ label: l.label, url: l.url, type: linkType(l.type) }))
  };
}
