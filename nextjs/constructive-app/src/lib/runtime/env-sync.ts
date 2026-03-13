import { appStore } from '@/store/app-store';
import type { SchemaContext } from '@/lib/runtime/config-core';

const ENDPOINT_KEY_PREFIX = 'constructive-endpoint:';
const SYNCED_CONTEXTS: SchemaContext[] = ['admin', 'auth'];

export function initEnvOverridesSync() {
	if (typeof window === 'undefined') return;

	if ((window as any).__constructive_env_sync__) return;
	(window as any).__constructive_env_sync__ = true;

	window.addEventListener('storage', (e: StorageEvent) => {
		if (!e.key?.startsWith(ENDPOINT_KEY_PREFIX)) return;
		const ctx = e.key.slice(ENDPOINT_KEY_PREFIX.length) as SchemaContext;
		if (!SYNCED_CONTEXTS.includes(ctx)) return;
		const value = e.newValue && e.newValue.trim().length ? e.newValue.trim() : null;
		appStore.setEndpointOverrideFromSync(ctx, value);
	});
}
