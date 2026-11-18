import { legacyRedirects } from './lib/legacy-redirects';
import type { NextConfig } from 'next';

const isVercel = !!process.env.VERCEL;

const config: NextConfig = {
  ...(isVercel ? {} : { output: 'standalone' }),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  async redirects() {
    return legacyRedirects;
  }
};

export default config;
