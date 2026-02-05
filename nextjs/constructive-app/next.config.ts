import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Transpile workspace packages from source for better DX and proper "use client" handling
  transpilePackages: ['@constructive-io/ui'],
  turbopack: {
    // Explicitly set monorepo root to prevent incorrect detection from parent lockfiles
    root: path.join(__dirname, '..', '..'),
  },
  // Enable smaller standalone production output for Docker runtime
  output: 'standalone',
};

export default nextConfig;
