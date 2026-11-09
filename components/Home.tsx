'use client';

import Hero from './Hero';
import Ecosystem from './Ecosystem';
import HomeMotion from './HomeMotion';
import HomeChapters from './HomeChapters';
import {
  CompanyStory,
  Capabilities,
  RealProjects,
  PeopleSection,
  CommunityStory,
  KnowledgeFeed,
  HomeClosing
} from './HomeSections';

/**
 * Trang chủ = 5 cảnh mở đầu (Hero, giữ nguyên) + 7 chương nối tiếp + lời mời kết.
 * 01 Về DANAVA → 02 Hệ sinh thái → 03 Giải pháp → 04 Dự án → 05 Con người → 06 Cộng đồng → 07 Góc nhìn.
 */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <HomeMotion>
        <CompanyStory />
        <Ecosystem />
        <Capabilities />
        <RealProjects />
        <PeopleSection />
        <CommunityStory />
        <KnowledgeFeed />
        <HomeClosing />
      </HomeMotion>
      <HomeChapters />
    </main>
  );
}
