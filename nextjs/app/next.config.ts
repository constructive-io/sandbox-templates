import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// The app ships as a static single-page app: `next build` writes `out/`, which the
	// desktop's Deploy uploads to a static site. So no route renders on a server; a
	// record page reads its id from the query string (`/<resource>/view/?id=`).
	output: 'export',
	// Every route is a folder with an index.html, which any static host serves.
	trailingSlash: true,
	// A static host runs no image optimizer.
	images: { unoptimized: true },
	// The desktop's Preview may open the dev server on 127.0.0.1 rather than localhost.
	allowedDevOrigins: ['127.0.0.1', 'localhost'],
	// AGENTS.md is curated for this app; keep `next dev` from rewriting it.
	agentRules: false,
	// The app runs inside the desktop's Preview; keep the dev overlay badge out of it.
	devIndicators: false,
};

export default nextConfig;
