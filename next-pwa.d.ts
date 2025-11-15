declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean | ((config: NextConfig) => boolean);
    sw?: string;
    swSrc?: string;
    publicExcludes?: string[];
    buildExcludes?: Array<string | RegExp>;
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    workboxOptions?: any;
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: any;
    }>;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}

