import type { NextConfig } from 'next';

// The compute sync gateway origin — where the mantra auth pages and the OAuth
// lanes live. Emails this stack sends (magic links) point at the APP origin
// (:3000) because the site's canonical URL is the app, so the app has to hand
// /auth/* back to the gateway. afterFiles: the app's own pages (the OAuth
// callback landing at src/app/auth/callback) match first and are NOT
// forwarded; only the paths the app doesn't own reach the rewrite.
const GATEWAY = process.env.SSO_GATEWAY_URL ?? 'http://localhost';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Enable smaller standalone production output for Docker runtime
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', '@remixicon/react'],
  },
  async rewrites() {
    return {
      afterFiles: [
        // A magic link's token rides the query string, which rewrites
        // forward unchanged — the landing at the gateway spends it.
        { source: '/auth/:path*', destination: `${GATEWAY}/auth/:path*` },
      ],
    };
  },
};

export default nextConfig;
