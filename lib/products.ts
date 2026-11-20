/**
 * Nội dung giới thiệu 3 sản phẩm số (trang /giai-phap/danava-go/, /giai-phap/hello-danava/, /giai-phap/danava-work/).
 * Chỉ dùng thông tin công khai trên chính trang sản phẩm, lấy ngày 20/11/2026:
 *  - https://danavago.com/      (DANAVA GO)
 *  - https://hello.danava.vn/   (Hello DANAVA — bảng giá DANAVA Studio)
 *  - https://workspace.danava.com.vn/ (DANAVA Work — trang đăng nhập và mô tả)
 * Ảnh: chụp màn hình thật của các trang trên (public/assets/products/).
 */
export const PRODUCTS_CHECKED = '20/11/2026';

export const GO = {
  url: 'https://danavago.com/',
  appUrl: 'https://app.danavago.com',
  tagline: 'Đi một chuyến. Mở ngàn trải nghiệm.',
  lead: 'Nền tảng đặt vé xe khách trực tuyến cao cấp. Mang đến trải nghiệm di chuyển êm ái, an toàn và văn minh trên mọi nẻo đường Việt Nam.',
  ticketPerks: ['Vé điện tử', 'Giữ chỗ 10 phút', 'Trả tại quầy hoặc QR'],
  vehicles: ['Giường nằm', 'Limousine', 'Cabin VIP'],
  /** 3 dòng xe trên trang chủ DANAVA GO (dự án DatVeXeONL: VEHICLE_MODELS + VehicleExperience) */
  fleet: [
    { id: 'sleeper', label: 'Giường nằm', name: 'Giường nằm 34 chỗ', word: 'JOURNEY', text: 'Ngả lưng thư giãn, để hành trình đưa bạn đến miền đất mới.', seats: 34, floors: 2, perks: ['Wifi tốc độ cao', 'Cổng sạc Type-C', 'Chăn gối kháng khuẩn', 'Nước suối & khăn lạnh'], image: '/assets/products/go/vehicle-sleeper.webp', width: 900, height: 493 },
    { id: 'limousine', label: 'Limousine', name: 'Limousine VIP 16 chỗ', word: 'COMFORT', text: 'Không gian ghế ngồi thoải mái cho những chuyến đi linh hoạt.', seats: 16, floors: 1, perks: ['Ghế bọc da ngả 135°', 'Cổng sạc & Đèn đọc sách', 'Tivi trần trung tâm', 'Tủ lạnh mini'], image: '/assets/products/go/vehicle-limousine.webp', width: 900, height: 491 },
    { id: 'cabin', label: 'Cabin VIP', name: 'Cabin VIP 22 phòng', word: 'PRIVATE', text: 'Khoang nghỉ riêng, dành thêm không gian cho chính bạn.', seats: 22, floors: 2, perks: ['Phòng riêng biệt lập', 'Hệ thống massage đa điểm', 'Màn hình LCD giải trí', 'Tai nghe chống ồn'], image: '/assets/products/go/vehicle-cabin.webp', width: 900, height: 431 }
  ],
  fleetNote: 'Tiện ích cụ thể được hiển thị theo từng chuyến.',
  routes: [
    { tag: 'Di sản', kicker: 'Qua miền di sản', from: 'Đà Nẵng', to: 'Huế', image: '/assets/products/go-route-hue.webp' },
    { tag: 'Biển xanh', kicker: 'Hẹn một ngày bên biển', from: 'Đà Nẵng', to: 'Nha Trang', image: '/assets/products/go-route-nhatrang.webp' },
    { tag: 'Thành phố', kicker: 'Theo nhịp sống phương Nam', from: 'Đà Nẵng', to: 'TP. Hồ Chí Minh', image: '/assets/products/go-route-hcm.webp' }
  ],
  steps: [
    { title: 'Chọn chuyến đi', text: 'Tìm tuyến, xem giờ khởi hành và so sánh giá vé.' },
    { title: 'Chọn chỗ yêu thích', text: 'Xem sơ đồ ghế trực quan, chọn tầng và vị trí còn trống.' },
    { title: 'Nhận vé điện tử', text: 'Kiểm tra thông tin và lưu vé sau bước xác nhận.' }
  ],
  features: [
    { title: 'Chọn chỗ minh bạch', text: 'Xem vị trí ghế, giường và trạng thái còn trống trước khi tiếp tục.' },
    { title: 'Điểm đón/trả rõ ràng', text: 'Chọn điểm đón và trả từ danh sách được cung cấp cho chuyến đi.' },
    { title: 'Vé điện tử tiện lợi', text: 'Tra cứu lại thông tin và lưu hoặc in vé điện tử sau khi hoàn tất.' },
    { title: 'Thông tin chuyến đầy đủ', text: 'Xem giá, lịch trình và loại xe để chọn chuyến phù hợp với nhu cầu.' }
  ],
  operators: ['Cửa Ông Limousine'],
  studioUrl: 'https://studio.danavago.com/',
  /** DANAVA GO Studio — trang quản trị cho nhà xe (theo trang đăng nhập studio.danavago.com) */
  studio: {
    tagline: 'Chuyến, ghế, vé và doanh thu của nhà xe trên DANAVA GO, cập nhật theo thời gian thực.',
    modules: ['Đội xe', 'Lịch chuyến', 'Ghế & vé', 'Doanh thu'],
    staff: ['Chủ xe', 'Tài xế', 'Lơ xe']
  },
  /** Ví dụ thật: nhà xe Cửa Ông Limousine (trang nhà xe và app riêng, xem ngày 20/11/2026) */
  operator: {
    name: 'Cửa Ông Limousine',
    app: 'https://cuaonglimousine.danavago.com/',
    page: 'https://danavago.com/nha-xe/cua-ong-limousine',
    kinds: 'Phòng riêng (cabin) & Ghế ngồi limousine',
    places: 'Quảng Ninh, Hội An, Ninh Bình, Huế',
    stats: [['Số tuyến', '16'], ['Chuyến mỗi ngày', '~2'], ['Vé từ', '600.000đ']] as [string, string][],
    trip: { from: 'Hội An', to: 'Quảng Ninh', depart: '13:00', arrive: '11:30', plusDay: true, duration: '22h30m', kind: 'Cabin VIP', price: '600.000đ' }
  },
  /** Các màn hình thật (app.danavago.com, cuaonglimousine.danavago.com, danavago.com, studio.danavago.com) */
  tour: [
    { id: 'hanh-khach', label: 'Hành khách', device: 'phone' as const, lead: 'App DANAVA GO tại app.danavago.com: tìm chuyến, chọn chỗ và giữ vé ngay trên điện thoại.', shots: [
      { src: '/assets/products/go/app-home.webp', title: 'Đi đâu tiếp theo?', text: 'Tìm chuyến một chiều hoặc khứ hồi, chọn ngày đi, xem điểm đến nổi bật.' },
      { src: '/assets/products/go/app-trips.webp', title: 'Chuyến phù hợp', text: 'Lọc theo giờ đi, loại xe, giá; thấy số chỗ còn, điểm đón và điểm trả.' },
      { src: '/assets/products/go/app-seat.webp', title: 'Chọn chỗ trên sơ đồ 2 tầng', text: 'Phân biệt chỗ chưa bán, đang giữ, đã bán; giờ đón và giờ đến rõ ràng.' },
      { src: '/assets/products/go/app-tickets.webp', title: 'Vé của tôi', text: 'Vé sắp đi, hoàn thành, đã hủy; tra cứu bằng mã vé và số điện thoại.' }
    ] },
    { id: 'tai-khoan', label: 'Tài khoản & ưu đãi', device: 'phone' as const, lead: 'Tài khoản được tạo tự động khi đặt vé. Nhân viên nhà xe đăng nhập ngay trên cùng app.', shots: [
      { src: '/assets/products/go/app-account.webp', title: 'Tài khoản hành khách', text: 'Tên đăng nhập là số điện thoại đặt vé; chủ xe, tài xế, lơ xe có lối đăng nhập riêng.' },
      { src: '/assets/products/go/app-promos.webp', title: 'Ưu đãi & khuyến mãi', text: 'Mã giảm giá do nhà xe tạo; bấm "Dùng mã" để mã tự điền khi đặt vé.' }
    ] },
    { id: 'nha-xe', label: 'Trang nhà xe', device: 'desktop' as const, lead: 'Mỗi nhà xe có trang riêng trên danavago.com và cổng đăng nhập DANAVA GO Studio.', shots: [
      { src: '/assets/products/go/operator-page.webp', title: 'Trang nhà xe', text: 'Ảnh xe, số tuyến, chuyến mỗi ngày, giá từ, hỏi đáp và danh sách tuyến theo lịch 7 ngày.' },
      { src: '/assets/products/go/studio-login.webp', title: 'Đăng nhập Studio', text: 'Nhà xe đăng nhập bằng số điện thoại hoặc email để vào bảng điều khiển.' }
    ] },
    { id: 'quan-tri', label: 'Quản trị Studio', device: 'desktop' as const, lead: 'Bên trong DANAVA GO Studio: ảnh chụp bản demo với nhà xe Cửa Ông Limousine, dữ liệu mẫu.', shots: [
      { src: '/assets/products/go/studio-overview.webp', title: 'Tổng quan', text: 'Doanh thu, vé và chuyến hôm nay, tỉ lệ lấp đầy ghế, việc cần làm và tình trạng đội xe.' },
      { src: '/assets/products/go/studio-trips.webp', title: 'Xe, tuyến & chuyến', text: 'Xe & sơ đồ ghế → tuyến & điểm đón → giờ chạy → chuyến đang bán → lịch tháng; nhập nhanh bằng 1 file Excel.' },
      { src: '/assets/products/go/studio-seatmap.webp', title: 'Sơ đồ xe & bán vé tại quầy', text: 'Ghế cập nhật trực tiếp với app khách: trống, đang giữ, đã bán; chọn ghế, nhập khách, thu tiền ngay.' },
      { src: '/assets/products/go/studio-orders.webp', title: 'Đơn vé', text: 'Tổng đơn, chưa thu, đã thu, đã hủy; tìm theo mã vé, tên khách hoặc số điện thoại và thu tiền từng đơn.' },
      { src: '/assets/products/go/studio-apps.webp', title: 'App & tên miền nhà xe', text: 'Bật app đặt vé riêng cho từng nhà xe, với tên miền dạng tennhaxe.danavago.com và logo riêng.' }
    ] }
  ],
  operatorNote: 'Lịch trình, giá và tồn ghế do nhà xe quản lý (dữ liệu qua API). Thanh toán theo hướng dẫn của nhà xe.',
  status: 'DANAVA GO đang chạy thử: trang ghi rõ bản demo chưa xử lý hoàn tiền thực tế, hiện có 1 nhà xe đồng hành.'
};

export const HELLO = {
  url: 'https://hello.danava.vn/',
  registerUrl: 'https://studio.danava.vn/register',
  models: ['Gym', 'Yoga', 'Pilates', 'Bể bơi', 'Spa'],
  plans: [
    { name: 'Khởi đầu', desc: 'Quản lý phòng tập nhỏ với các tính năng cơ bản.', price: 'Miễn phí', perMonth: '', members: '50', staff: '2', branches: '1', highlight: false, perks: ['Lịch lớp & điểm danh'] },
    { name: 'Pro', desc: 'Tự động hóa vận hành và bán gói tập.', price: '5.000.000 ₫', perMonth: '≈ 416.667 ₫/tháng', members: '1.000', staff: '10', branches: '1', highlight: false, perks: ['POS bán hàng & kho', 'Lịch lớp & điểm danh', 'Cổng thanh toán online riêng', 'Chiến dịch & khuyến mãi'] },
    { name: 'Premium', desc: 'Dành cho phòng tập có nhiều hội viên và nhân sự.', price: '10.000.000 ₫', perMonth: '≈ 833.333 ₫/tháng', members: '5.000', staff: '15', branches: '2', highlight: true, perks: ['POS bán hàng & kho', 'Lịch lớp & điểm danh', 'Cổng thanh toán online riêng', 'Chiến dịch & khuyến mãi'] },
    { name: 'Doanh nghiệp', desc: 'Quản lý chuỗi và phân quyền nâng cao.', price: '20.000.000 ₫', perMonth: '≈ 1.666.667 ₫/tháng', members: 'Không giới hạn', staff: 'Không giới hạn', branches: '3', highlight: false, perks: ['POS bán hàng & kho', 'Thiết bị check-in & khóa cửa', 'Lịch lớp & điểm danh', 'Cổng thanh toán online riêng'] }
  ],
  termNote: 'Giá kỳ 12 tháng. Kỳ 6 tháng và 24 tháng: liên hệ để nhận báo giá.',
  /** Bảng so sánh: giá trị theo thứ tự Khởi đầu, Pro, Premium, Doanh nghiệp — 'y' có sẵn, 'n' không, 'buy' mua thêm */
  modules: [
    { group: 'Quản trị Studio', name: 'Lịch lớp & điểm danh', desc: 'Xếp lịch và theo dõi chuyên cần.', v: ['y', 'y', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'POS bán hàng & kho', desc: 'Quản lý bán tại quầy, tồn kho và phiếu nhập.', v: ['n', 'y', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Cổng thanh toán online riêng', desc: 'Kết nối PayOS, SePAY hoặc Tingee.', v: ['n', 'y', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Chiến dịch & khuyến mãi', desc: 'Gửi tin và theo dõi chương trình ưu đãi.', v: ['n', 'y', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Báo cáo nâng cao', desc: 'Theo dõi hiệu quả vận hành.', v: ['n', 'y', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Tích điểm & hạng thành viên', desc: 'Cấu hình điểm và hạng thành viên.', v: ['n', 'n', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'CRM khách tiềm năng & tập thử', desc: 'Theo dõi nguồn khách và lịch tập thử.', v: ['n', 'n', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Zalo ZNS', desc: 'Nhắc hội viên qua Zalo. Phí tin nhắn tính riêng nếu áp dụng.', v: ['n', 'n', 'y', 'y'] },
    { group: 'Quản trị Studio', name: 'Ca làm, chấm công & lương', desc: 'Xếp ca, chấm công và quản lý bảng lương.', v: ['n', 'n', 'n', 'y'] },
    { group: 'Quản trị Studio', name: 'Hoa hồng nhân viên & HLV', desc: 'Tính hoa hồng theo doanh số.', v: ['n', 'n', 'n', 'y'] },
    { group: 'Quản trị Studio', name: 'CTV / Đối tác', desc: 'Quản lý cộng tác viên và giới thiệu khách.', v: ['n', 'n', 'n', 'y'] },
    { group: 'Quản trị Studio', name: 'Thiết bị check-in & khóa cửa', desc: 'Kết nối thiết bị và theo dõi nhật ký.', v: ['n', 'n', 'n', 'y'] },
    { group: 'Quản trị Studio', name: 'Nhật ký hoạt động', desc: 'Theo dõi thao tác trong Studio.', v: ['n', 'n', 'n', 'y'] },
    { group: 'Quản trị Studio', name: 'Mở thêm chi nhánh', desc: 'Bổ sung chi nhánh ngoài hạn mức gói.', v: ['buy', 'buy', 'buy', 'buy'] },
    { group: 'App hội viên', name: 'App hội viên', desc: 'Đặt lịch và xem gói tập trên điện thoại.', v: ['n', 'n', 'y', 'y'] },
    { group: 'App riêng theo thương hiệu', name: 'App riêng theo thương hiệu', desc: 'Tùy chỉnh app theo nhận diện của phòng tập.', v: ['buy', 'buy', 'buy', 'buy'] }
  ] as { group: string; name: string; desc: string; v: ('y' | 'n' | 'buy')[] }[],
  addons: [
    { name: 'App riêng theo thương hiệu', price: '500.000 ₫ / tháng' },
    { name: 'Mở thêm chi nhánh', price: '3.000.000 ₫ / lần' }
  ],
  quoteSteps: [
    { title: 'Chọn gói phần mềm', text: 'Giá theo kỳ hạn đang chọn ở bảng giá.' },
    { title: 'Tùy chọn bổ sung', text: 'Tick để thêm vào dự toán, chỉnh số lượng nếu cần.' },
    { title: 'Thông tin liên hệ', text: 'DANAVA sẽ gọi lại để tư vấn và gửi báo giá.' }
  ]
};

export const WORK = {
  url: 'https://workspace.danava.com.vn/',
  tagline: 'Nền tảng quản trị công việc chuyên nghiệp. Mọi thứ bạn cần ở một nơi.',
  purpose: 'Phân bổ và theo dõi công việc của nhóm DANAVA.',
  access: 'Sử dụng tài khoản do Admin cấp',
  status: 'DANAVA Work hiện được dùng nội bộ cho đội ngũ DANAVA.',
  /** Ảnh chụp bản chạy thử của DANAVA Work (dự án Trello) với dữ liệu minh họa vui, không phải dữ liệu thật */
  tour: [
    { id: 'bang', label: 'Bảng công việc', device: 'desktop' as const, lead: 'Một bảng, ba cách xem: Kanban kéo thả, danh sách và lịch, cùng một nguồn dữ liệu.', shots: [
      { src: '/assets/products/danava-work/kanban.webp', title: 'Kanban kéo thả', text: 'Cột Ý tưởng → Đang làm → Chờ duyệt → Xong; thẻ có nhãn màu, hạn, tiến độ và người làm.' },
      { src: '/assets/products/danava-work/list.webp', title: 'Danh sách', text: 'Xem mọi việc dạng bảng, đổi trạng thái ngay tại chỗ, lọc và nhập việc từ Excel.' },
      { src: '/assets/products/danava-work/calendar.webp', title: 'Lịch', text: 'Việc trải theo ngày bắt đầu và hạn hoàn thành; xem theo tháng hoặc lịch biểu.' }
    ] },
    { id: 'ca-nhan', label: 'Góc cá nhân', device: 'desktop' as const, lead: 'Mỗi người có trang chủ riêng: việc hôm nay, việc cần chú ý và các bảng đang tham gia.', shots: [
      { src: '/assets/products/danava-work/home.webp', title: 'Trang chủ của tôi', text: 'Lời chào, chấm công hôm nay, tiếp tục bảng đang làm và danh sách việc cần chú ý.' },
      { src: '/assets/products/danava-work/my-tasks.webp', title: 'Công việc của tôi', text: 'Gom mọi việc được giao từ tất cả các bảng: cần làm, sắp đến hạn, quá hạn.' }
    ] },
    { id: 'theo-doi', label: 'Theo dõi nhóm', device: 'desktop' as const, lead: 'Nhìn nhanh khối lượng việc của từng thành viên để chia việc cho đều.', shots: [
      { src: '/assets/products/danava-work/stats.webp', title: 'Thống kê khối lượng', text: 'Tổng việc, đã xong, đang làm, quá hạn và biểu đồ phân bổ theo từng thành viên.' },
      { src: '/assets/products/work-login.webp', title: 'Đăng nhập', text: 'Tài khoản do quản trị viên cấp; đổi mật khẩu ở lần đăng nhập đầu tiên.' }
    ] }
  ],
  /** Tính năng theo README dự án DANAVA Work */
  features: [
    { title: 'Quản lý công việc', items: ['Kanban kéo thả, Danh sách, Lịch', 'Việc cha, việc con, checklist', 'Nhiều người làm, chia % đóng góp', 'Nhãn màu, bình luận, file đính kèm', 'Nhập việc từ Excel'] },
    { title: 'Điều hành & báo cáo', items: ['Trang chủ và công việc của tôi', 'Thống kê khối lượng theo thành viên', 'Chấm điểm hiệu suất theo kỳ', 'Tổng kết dự án', 'Nhân viên, phòng ban, chấm công'] },
    { title: 'Cộng tác & thông báo', items: ['Mời thành viên vào từng bảng', 'Vai trò Chủ bảng / Quản trị / Thành viên', 'Thông báo trong ứng dụng', 'Gửi thông báo qua Telegram'] },
    { title: 'Dùng ở mọi nơi', items: ['Máy tính, máy tính bảng, điện thoại', 'Chế độ sáng và tối', 'Cài như ứng dụng (PWA)', 'Trợ lý công việc DANAVA'] }
  ]
};
