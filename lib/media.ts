import type{Person}from'./content';
const root='/assets/legacy/';
export const staffPhotos:Record<string,string>={thanh:root+'founder.webp',trang:root+'pham-trang.webp',nam:root+'tran-van-nam.webp',avinash:root+'avinash.webp',thong:root+'dang-ngoc-thong.webp'};
export const personPhoto=(p:Person)=>p.image===undefined?(staffPhotos[p.id]||''):p.image;
export const servicePhotos:Record<string,string>={website:root+'website.webp',studio:root+'cong-nghe.webp',marketing:root+'marketing.webp',travel:root+'travel.webp',community:root+'community.webp'};
export const postPhotos:Record<string,string>={'cong-nang-luong':root+'post-energy.webp','thien-tra':root+'post-tea.webp',marketing:root+'marketing.webp'};
export const activityPhotos=[{src:root+'event-group.webp',title:'Kết nối qua những cuộc gặp gỡ',label:'SỰ KIỆN & CỘNG ĐỒNG',alt:'Hoạt động sự kiện được đăng trên website DANAVA'},{src:root+'event-session.webp',title:'Không gian cùng học hỏi',label:'WORKSHOP & CHIA SẺ',alt:'Người tham gia workshop trong kho ảnh DANAVA'},{src:root+'event-workshop.webp',title:'Những hành trình đồng hành',label:'CON NGƯỜI & TRẢI NGHIỆM',alt:'Ảnh người tham gia chương trình trong kho ảnh DANAVA'}];
