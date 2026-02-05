// Runtime Configuration Placeholder
// This file is generated at Docker container startup by docker-entrypoint.sh
// In development, it serves as an empty placeholder.
// The actual values are injected by the entrypoint script at container start.
//
// Priority chain:
// 1. UI Override (localStorage via env-slice.ts) - highest
// 2. Docker Runtime (this file: window.__RUNTIME_CONFIG__)
// 3. Build-time Default (process.env.NEXT_PUBLIC_*) - lowest
(function () {
	window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};
	// Development placeholder - values come from .env.local via Next.js build-time injection
})();
