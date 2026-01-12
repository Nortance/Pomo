import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Rewrites to proxy Mixpanel requests through our domain
   * This bypasses ad blockers since requests appear as first-party
   *
   * @see https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript#tracking-via-proxy
   */
  async rewrites() {
    return [
      // Mixpanel JS library
      {
        source: '/mp/lib.min.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
      },
      {
        source: '/mp/lib.js',
        destination: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.js',
      },
      // Mixpanel decide endpoint (for feature flags, A/B tests)
      {
        source: '/mp/decide',
        destination: 'https://decide.mixpanel.com/decide',
      },
      // Mixpanel API endpoints (track, engage, etc.)
      {
        source: '/mp/:slug*',
        destination: 'https://api.mixpanel.com/:slug*',
      },
    ];
  },
};

export default nextConfig;
