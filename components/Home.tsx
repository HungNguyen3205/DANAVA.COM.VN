'use client';

import Hero from './Hero';
import Ecosystem from './Ecosystem';
import BentoServices from './BentoServices';
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
 * Trang chủ = Mở đầu điện ảnh (Desktop: 5 cảnh / Mobile: Hero tinh giản công nghệ)
 * + Bố cục Bento Grid công nghệ 2x2
 * + 7 chương kể chuyện thương hiệu & kết nối giải pháp.
 */
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <HomeMotion>
        <CompanyStory />
        <BentoServices />
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
