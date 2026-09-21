// Default runtime config for non-Docker runs (dev, next start).
// The layout loads this before hydration; deployments that inject runtime
// values overwrite this file, everything else falls through to build-time
// NEXT_PUBLIC_* values — this default only makes the request resolve
// instead of 404ing.
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};
