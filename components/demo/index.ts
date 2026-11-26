import type { ReactNode } from 'react';
import { SonTraDemo } from './SonTra';
import { EmberDemo } from './Ember';
import { LotusDemo } from './Lotus';
import { AuroraDemo } from './Aurora';
import { MayDemo } from './May';
import { SaasDemo } from './Saas';

/** slug (lib/web-templates.ts) → component demo */
/** Component máy chủ (có thể async — mẫu SaaS đọc bảng giá) */
export const DEMOS: Record<string, () => ReactNode | Promise<ReactNode>> = {
  'son-tra-residences': SonTraDemo,
  'ember-gym': EmberDemo,
  'lotus-spa': LotusDemo,
  'aurora-gala': AuroraDemo,
  'may-yoga': MayDemo,
  'studio-saas': SaasDemo
};
