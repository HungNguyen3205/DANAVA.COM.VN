'use client';
/** Gắn phòng lab với các phần mở rộng (trợ lý ANNA, mô phỏng vận hành). */
import type { Equipment, Flooring } from '@/lib/equipment';
import { GymStudio } from './GymStudio';

export function GymStudioPage(props: { equipment: Equipment[]; flooring: Flooring | null; addId?: string; code?: string }) {
  return <GymStudio {...props} />;
}
