import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// The desktop's Preview may open the dev server on 127.0.0.1 rather than localhost.
	allowedDevOrigins: ['127.0.0.1', 'localhost'],
	// AGENTS.md is curated for this app; keep `next dev` from rewriting it.
	agentRules: false,
	// The app runs inside the desktop's Preview; keep the dev overlay badge out of it.
	devIndicators: false,
};

export default nextConfig;
