'use client';
/**
 * Gắn phòng lab với các phần mở rộng:
 *  - Trợ lý thiết kế: nằm trong chatbot ANNA (bé May) của website, thẻ "Chỉnh phòng" (portal vào khung chat).
 *    ANNA tắt trên toàn website → trợ lý quay về mục ANNA trong Tùy chỉnh.
 *  - Mô phỏng vận hành.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Equipment, Flooring } from '@/lib/equipment';
import { GymStudio } from './GymStudio';
import { AssistantPanel } from './AssistantPanel';
import { SimPanel } from './SimPanel';
import { useAnna } from '../anna/AnnaProvider';

export function GymStudioPage(props: { equipment: Equipment[]; flooring: Flooring | null; addId?: string; code?: string; aiEnabled: boolean }) {
  const { aiEnabled, ...rest } = props;
  const anna = useAnna();
  const { setDesign } = anna;
  useEffect(() => { if (!anna.enabled) return; setDesign(true); return () => setDesign(false); }, [anna.enabled, setDesign]);
  const panel = (project: Parameters<typeof AssistantPanel>[0]['project'], commit: Parameters<typeof AssistantPanel>[0]['commit']) =>
    <AssistantPanel project={project} commit={commit} equipment={props.equipment} flooring={props.flooring} aiEnabled={aiEnabled} />;
  return (
    <GymStudio {...rest} extras={anna.enabled ? {
      assistantPortal: ({ project, commit }) => (anna.slot ? createPortal(<div className="gs gs--anna">{panel(project, commit)}</div>, anna.slot) : null),
      openAssistant: anna.openDesign,
      sim: ctx => <SimPanel {...ctx} aiEnabled={aiEnabled} />
    } : {
      assistant: ({ project, commit }) => panel(project, commit),
      sim: ctx => <SimPanel {...ctx} aiEnabled={aiEnabled} />
    }} />
  );
}
