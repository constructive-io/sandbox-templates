import type { NextConfig } from 'next';

// Where the sync gateway answers (Traefik on :80; the app relays its JSON
// lanes here server-side). Read at server start for the rewrite below.
const SSO_GATEWAY_URL = process.env.SSO_GATEWAY_URL ?? 'http://localhost';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Enable smaller standalone production output for Docker runtime
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', '@remixicon/react'],
  },
  async rewrites() {
    return [
      // Browser-facing gateway landings the emailed links name. The site's
      // canonical URL is the APP origin (oauth callback composition needs it),
      // so a magic-link email points at localhost:3000/auth/magic-link — a
      // gateway page, not an app route. Plain (afterFiles) rewrites only catch
      // what no app page serves, so the app's own /auth/callback keeps winning.
      { source: '/auth/:path*', destination: `${SSO_GATEWAY_URL}/auth/:path*` },
    ];
  },
};

export default nextConfig;
