import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Transpile workspace packages from source for better DX and proper "use client" handling
  transpilePackages: ['@constructive-io/ui'],
  // Enable smaller standalone production output for Docker runtime
  output: 'standalone',
};

export default nextConfig;
