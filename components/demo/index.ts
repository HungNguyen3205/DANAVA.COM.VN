import type { ComponentType } from 'react';
import { SonTraDemo } from './SonTra';
import { EmberDemo } from './Ember';
import { LotusDemo } from './Lotus';
import { AuroraDemo } from './Aurora';
import { MayDemo } from './May';
import { SaasDemo } from './Saas';

/** slug (lib/web-templates.ts) → component demo */
export const DEMOS: Record<string, ComponentType> = {
  'son-tra-residences': SonTraDemo,
  'ember-gym': EmberDemo,
  'lotus-spa': LotusDemo,
  'aurora-gala': AuroraDemo,
  'may-yoga': MayDemo,
  'studio-saas': SaasDemo
};
