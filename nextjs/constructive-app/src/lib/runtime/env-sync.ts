import { useAppStore } from '@/store/app-store';

export function initEnvOverridesSync() {
	if (typeof window === 'undefined') return;

	if ((window as any).__constructive_env_sync__) return;
	(window as any).__constructive_env_sync__ = true;

	window.addEventListener('storage', (e: StorageEvent) => {
		const key = e.key || '';
		const match = key.match(/^constructive-endpoint:(schema-builder|dashboard)$/);
		if (!match) return;
		const ctx = match[1] as 'schema-builder' | 'dashboard';
		// Dashboard is dynamic and not synced via env-slice
		if (ctx === 'dashboard') return;

		const value = e.newValue && e.newValue.trim().length ? e.newValue.trim() : null;
		const actions = useAppStore.getState();
		// Avoid writing back to localStorage; update state only
		if (actions.setEndpointOverrideFromSync) actions.setEndpointOverrideFromSync(ctx, value);
		else actions.setEndpointOverride?.(ctx, value);
	});
}
