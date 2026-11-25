'use client';
/** Gắn phòng lab với các phần mở rộng: trợ lý ANNA (Gemini hoặc chế độ mẫu) và mô phỏng vận hành. */
import type { Equipment, Flooring } from '@/lib/equipment';
import { GymStudio } from './GymStudio';
import { AssistantPanel } from './AssistantPanel';
import { SimPanel } from './SimPanel';

export function GymStudioPage(props: { equipment: Equipment[]; flooring: Flooring | null; addId?: string; code?: string; aiEnabled: boolean }) {
  const { aiEnabled, ...rest } = props;
  return (
    <GymStudio {...rest} extras={{
      assistant: ({ project, commit }) => <AssistantPanel project={project} commit={commit} equipment={props.equipment} flooring={props.flooring} aiEnabled={aiEnabled} />,
      sim: ctx => <SimPanel {...ctx} aiEnabled={aiEnabled} />
    }} />
  );
}
