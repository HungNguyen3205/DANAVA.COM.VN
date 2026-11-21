type MarketingEngagement = {
  id: string;
  client: string;
  title: string;
  scope: string[];
  throughPartner?: boolean;
  websiteWork?: string;
  websiteProjectHref?: string;
  website?: string;
  fanpage?: string;
  maps?: string;
  logo?: string;
  image?: { src: string; alt: string };
};

const assets = '/assets/marketing/projects/';

export const MARKETING_ENGAGEMENTS: MarketingEngagement[] = [
  {
    id: 'hudi-sofa', client: 'HUDI Sofa', title: 'Truyền thông đa kênh cho thương hiệu nội thất',
    scope: ['Lập kế hoạch cho Fanpage, TikTok, YouTube và Google Maps', 'Quay phim và chụp ảnh sản phẩm', 'Triển khai Facebook Ads'],
    websiteWork: 'Website HUDI Sofa', website: 'https://hudisofa.com/',
    websiteProjectHref: '/giai-phap/thiet-ke-website/#hudi-sofa-website',
    logo: assets + 'hudi-logo.webp',
    image: { src: assets + 'hudi-showroom.webp', alt: 'Không gian trưng bày nội thất HUDI Sofa' }
  },
  {
    id: 'micc-group', client: 'MICC Group', title: 'Quảng bá dự án Vinhomes Hải Vân Bay',
    scope: ['Triển khai Zalo Ads', 'Triển khai Facebook Ads'],
    websiteWork: 'Lading Page Vinhomes Hải Vân Bay', website: 'https://miccgroup.vn/',
    logo: assets + 'micc-logo.webp',
    image: { src: assets + 'micc-hai-van-bay.webp', alt: 'Hình giới thiệu dự án Vinhomes Hải Vân Bay từ MICC Group' }
  },
  {
    id: 'vinhomes', client: 'Vinhomes', title: 'Truyền thông bất động sản Hải Vân Bay', throughPartner: true,
    scope: ['Hỗ trợ đối tác quảng bá và giới thiệu sản phẩm của dự án Vinhomes Hải Vân Bay'],
    logo: assets + 'vinhomes-logo.webp',
    website: 'https://haivanbay.vinhomes.vn/',
    image: { src: '/assets/portfolio/vinhomes/desktop-hero.webp', alt: 'Giao diện website giới thiệu Vinhomes Hải Vân Bay' }
  },
  {
    id: 'sun-group', client: 'Sun Group', title: 'Truyền thông căn hộ và shophouse', throughPartner: true,
    scope: ['Hỗ trợ đối tác quảng bá và giới thiệu sản phẩm căn hộ, shophouse của Sun Group'],
    website: 'https://sungroup.com.vn/', logo: assets + 'sun-group-logo.webp'
  },
  {
    id: 'kim-nhu-quynh', client: 'Kim Như Quỳnh', title: 'Phát triển Fanpage phòng tập',
    scope: ['Phát triển kênh Fanpage để quảng bá phòng tập và hỗ trợ bán hàng'],
    fanpage: 'https://www.facebook.com/kimnhuquynhaerobics', logo: assets + 'kim-nhu-quynh-logo.webp',
    // https://www.facebook.com/photo/?fbid=1652529643338697
    image: { src: assets + 'kim-nhu-quynh-fanpage.webp', alt: 'Ảnh tập thể tại phòng tập Kim Như Quỳnh Aerobics' }
  },
  {
    id: 'thanh-phat-creative', client: 'Thành Phát Creative', title: 'Truyền thông tổng thể và Facebook Ads',
    scope: ['Lập kế hoạch truyền thông tổng thể', 'Triển khai Facebook Ads'],
    fanpage: 'https://www.facebook.com/thanhphatcreative', logo: assets + 'thanh-phat-creative-logo.webp',
    // https://www.facebook.com/photo/?fbid=122120918691219522
    image: { src: assets + 'thanh-phat-creative-fanpage.webp', alt: 'Ảnh bìa Thành Phát Creative với logo trên mặt tủ gỗ' }
  },
  {
    id: 'td-land', client: 'TD Land', title: 'Video và quảng cáo bất động sản',
    scope: ['Quay và dựng video giới thiệu bất động sản', 'Triển khai Facebook Ads']
  },
  {
    id: 'tram-binh-an', client: 'Trạm Bình An', title: 'Truyền thông trên mạng xã hội',
    scope: ['Lập kế hoạch truyền thông tổng thể cho các kênh mạng xã hội'],
    fanpage: 'https://www.facebook.com/trambinhanYogaHealing', logo: assets + 'tram-binh-an-logo.webp',
    // https://www.facebook.com/photo/?fbid=1629650518472572
    image: { src: assets + 'tram-binh-an-fanpage.webp', alt: 'Ảnh bìa Fanpage Trạm Bình An Yoga and Healing' }
  },
  {
    id: 'banh-mi-ong-beu', client: 'Bánh Mì Ông Bếu', title: 'Truyền thông trên mạng xã hội',
    scope: ['Lập kế hoạch truyền thông tổng thể cho các kênh mạng xã hội'],
    logo: assets + 'banh-mi-ong-beu-logo.webp',
    maps: 'https://www.google.com/maps?cid=15201240630744197060',
    // https://top10danang.com/no-cang-bung-voi-15-dia-diem-an-dem-da-nang-ngon-khong-the-bo-lo/
    image: { src: assets + 'banh-mi-ong-beu.webp', alt: 'Mặt tiền cửa hàng Bánh Mì Ông Bếu' }
  }
];
