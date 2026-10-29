import fs from 'node:fs';
import path from 'node:path';

import type { NextConfig } from 'next';

// Monorepo: pin the workspace root, Turbopack's inference fails here.
// Walk up to the nearest pnpm-workspace.yaml so the path resolves both in the
// generated monorepo (packages/app) and when the template builds standalone.
function workspaceRoot(): string {
  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
    const parent = path.dirname(dir);
    if (parent === dir) return __dirname;
    dir = parent;
  }
  return dir;
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Static export so the app can deploy to the platform's static site gateway.
  output: 'export',
  // next/image optimization needs a server; export requires unoptimized images.
  images: { unoptimized: true },
  turbopack: { root: workspaceRoot() },
  experimental: {
    optimizePackageImports: ['lucide-react', '@remixicon/react'],
  },
};

export default nextConfig;
