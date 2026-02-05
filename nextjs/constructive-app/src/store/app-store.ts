import { usePathname } from 'next/navigation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import { detectSchemaContextFromPath, type SchemaContext } from '@/lib/runtime/config-core';

import { AuthSlice, createAuthSlice, deserializeAuthSlice, serializeAuthSlice } from './auth-slice';
// Modularize the store so that we can stitch multiple store slices together
import {
	createDataGridSlice,
	DataGridSlice,
	deserializeDataGridSlice,
	serializeDataGridSlice,
} from './data-grid-slice';
import {
	createDraftRowsSlice,
	deserializeDraftRowsSlice,
	DraftRowsSlice,
	serializeDraftRowsSlice,
} from './draft-rows-slice';
import { createEnvSlice, deserializeEnvSlice, EnvSlice, serializeEnvSlice } from './env-slice';
import { createPolicySlice, deserializePolicySlice, PolicySlice, serializePolicySlice } from './policy-slice';
import {
	createPreferencesSlice,
	deserializePreferencesSlice,
	PreferencesSlice,
	serializePreferencesSlice,
} from './preferences-slice';
import { createSchemaSlice, deserializeSchemaSlice, SchemaSlice, serializeSchemaSlice } from './schema-slice';

export type AppState = DataGridSlice &
	SchemaSlice &
	AuthSlice &
	EnvSlice &
	DraftRowsSlice &
	PolicySlice &
	PreferencesSlice;

export const useAppStore = create<AppState>()(
	persist(
		(...args) => ({
			...createDataGridSlice(...args),
			...createSchemaSlice(...args),
			...createAuthSlice(...args),
			...createEnvSlice(...args),
			...createDraftRowsSlice(...args),
			...createPolicySlice(...args),
			...createPreferencesSlice(...args),
		}),
		{
			name: 'constructive-app-store',
			partialize: (state) => ({
				...serializeDataGridSlice(state),
				...serializeSchemaSlice(state),
				...serializeAuthSlice(state),
				...serializeEnvSlice(state),
				...serializeDraftRowsSlice(state),
				...serializePolicySlice(state),
				...serializePreferencesSlice(state),
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					// Rehydrate all slices
					const dataGridState = deserializeDataGridSlice(state);
					const schemaState = deserializeSchemaSlice(state);
					const authState = deserializeAuthSlice(state);
					const envState = deserializeEnvSlice(state);
					const draftRowsState = deserializeDraftRowsSlice(state);
					const policyState = deserializePolicySlice(state);
					const preferencesState = deserializePreferencesSlice(state);

					// Apply the rehydrated state
					Object.assign(
						state,
						dataGridState,
						schemaState,
						authState,
						envState,
						draftRowsState,
						policyState,
						preferencesState,
					);
				}
			},
		},
	),
);

// Export the useShallow hook for performance optimizations
export { useShallow };

/* ==== Exported hooks ==== */

// Schema hooks
export const useStarredTables = () => useAppStore((state) => state.starredTables);

export const useStarredTableActions = () =>
	useAppStore(
		useShallow((state) => ({
			toggleStarredTable: state.toggleStarredTable,
			addStarredTable: state.addStarredTable,
			removeStarredTable: state.removeStarredTable,
			clearStarredTables: state.clearStarredTables,
		})),
	);

// Auth hooks

/**
 * Hook to access auth state for the current route's context.
 * Uses pathname to determine if we're on dashboard or schema-builder routes.
 * For dashboard context, uses the current dashboard scope (databaseId).
 */
export const useAuth = () => {
	const pathname = usePathname();
	return useAppStore(
		useShallow((state) => {
			const ctx = detectSchemaContextFromPath(pathname || '/');
			// Use the new scoped state structure
			if (ctx === 'schema-builder') {
				const s = state.schemaBuilderAuth;
				return {
					isAuthenticated: s.isAuthenticated,
					isLoading: s.isLoading,
					user: s.user,
					token: s.token,
					rememberMe: s.rememberMe,
				};
			}
			// Dashboard - get scoped auth state
			const scope = state.dashboardScope.databaseId;
			const s = scope && state.dashboardAuthByScope[scope]
				? state.dashboardAuthByScope[scope]
				: { isAuthenticated: false, isLoading: false, user: null, token: null, rememberMe: false };
			return {
				isAuthenticated: s.isAuthenticated,
				isLoading: s.isLoading,
				user: s.user,
				token: s.token,
				rememberMe: s.rememberMe,
			};
		}),
	);
};

/**
 * Hook to access dashboard auth state for a specific databaseId.
 * Useful when you need to check auth for a specific database regardless of current scope.
 */
export const useDashboardAuth = (databaseId: string | null) => {
	return useAppStore(
		useShallow((state) => {
			if (!databaseId) {
				return {
					isAuthenticated: false,
					isLoading: false,
					user: null,
					token: null,
					rememberMe: false,
				};
			}
			const s = state.dashboardAuthByScope[databaseId];
			if (!s) {
				return {
					isAuthenticated: false,
					isLoading: false,
					user: null,
					token: null,
					rememberMe: false,
				};
			}
			return {
				isAuthenticated: s.isAuthenticated,
				isLoading: s.isLoading,
				user: s.user,
				token: s.token,
				rememberMe: s.rememberMe,
			};
		}),
	);
};

/**
 * Hook to access schema-builder (Tier 1 / app-level) auth state specifically.
 * Use this when you need to check app-level auth regardless of current route.
 *
 * This is useful for components like AuthenticatedShell that should show
 * the sidebar/topbar based on Tier 1 auth, not the current route's context.
 */
export const useSchemaBuilderAuth = () => {
	return useAppStore(
		useShallow((state) => {
			const s = state.schemaBuilderAuth;
			return {
				isAuthenticated: s.isAuthenticated,
				isLoading: s.isLoading,
				user: s.user,
				token: s.token,
				rememberMe: s.rememberMe,
			};
		}),
	);
};

/**
 * Hook to get/set the current dashboard scope (databaseId).
 */
export const useDashboardScope = () => {
	return useAppStore(
		useShallow((state) => ({
			databaseId: state.dashboardScope.databaseId,
			setDashboardScope: state.setDashboardScope,
		})),
	);
};

/**
 * Hook to get all databases the user is authenticated to.
 */
export const useAuthenticatedDatabases = () => {
	return useAppStore(
		useShallow((state) => {
			const authenticatedScopes: string[] = [];
			for (const [scope, authState] of Object.entries(state.dashboardAuthByScope)) {
				if (authState.isAuthenticated) {
					authenticatedScopes.push(scope);
				}
			}
			return authenticatedScopes;
		}),
	);
};

export const useAuthActions = () =>
	useAppStore(
		useShallow((state) => ({
			setAuthenticated: state.setAuthenticated,
			setUnauthenticated: state.setUnauthenticated,
			setLoading: state.setLoading,
			updateToken: state.updateToken,
			clearToken: state.clearToken,
			updateUser: state.updateUser,
			isTokenExpired: state.isTokenExpired,
			getAuthHeader: state.getAuthHeader,
			// New scoped actions
			setDashboardScope: state.setDashboardScope,
			getDashboardScope: state.getDashboardScope,
			getAuthForScope: state.getAuthForScope,
			clearAllDashboardAuth: state.clearAllDashboardAuth,
		})),
	);

// Env slice hooks
export const useEnv = () =>
	useAppStore(
		useShallow((state) => ({
			endpointOverrides: state.endpointOverrides,
			getEffectiveEndpoint: state.getEffectiveEndpoint,
		})),
	);

export const useEnvActions = () =>
	useAppStore(
		useShallow((state) => ({
			setEndpointOverride: state.setEndpointOverride,
			clearEndpointOverride: state.clearEndpointOverride,
			resetEndpointOverrides: state.resetEndpointOverrides,
		})),
	);

// Direct Connect hooks
/**
 * Hook to access Direct Connect state for a specific context.
 * If no context is provided, uses the current route's context.
 *
 * @param ctx - Optional schema context. Defaults to current route context.
 * @returns Direct Connect state including enabled status, custom endpoint, and auth settings
 */
export const useDirectConnect = (ctx?: SchemaContext) => {
	const pathname = usePathname();
	const effectiveCtx = ctx ?? detectSchemaContextFromPath(pathname || '/');
	return useAppStore(
		useShallow((state) => {
			const config = state.directConnect[effectiveCtx];
			return {
				/** The full Direct Connect config object */
				config,
				/** Whether Direct Connect is enabled for this context */
				isEnabled: config?.enabled ?? false,
				/** The custom endpoint when Direct Connect is enabled, or null */
				endpoint: config?.endpoint ?? null,
				/** Whether auth should be skipped (bypassed) */
				skipAuth: config?.skipAuth ?? true,
			};
		}),
	);
};

/**
 * Hook to access Direct Connect actions.
 * These actions are used to enable/disable Direct Connect and configure the custom endpoint.
 */
export const useDirectConnectActions = () =>
	useAppStore(
		useShallow((state) => ({
			/** Enable or disable Direct Connect for a context */
			setDirectConnect: state.setDirectConnect,
			/** Clear Direct Connect for a context (disable and remove endpoint) */
			clearDirectConnect: state.clearDirectConnect,
			/** Check if Direct Connect is enabled for a context */
			isDirectConnectEnabled: state.isDirectConnectEnabled,
			/** Get the Direct Connect endpoint for a context */
			getDirectConnectEndpoint: state.getDirectConnectEndpoint,
			/** Check if auth should be bypassed for a context */
			shouldBypassAuth: state.shouldBypassAuth,
		})),
	);

// Policy hooks
export const usePolicyFilters = () =>
	useAppStore(
		useShallow((state) => ({
			showEmptyTables: state.showEmptyTables,
			setShowEmptyTables: state.setShowEmptyTables,
			showSystemTables: state.showSystemTables,
			setShowSystemTables: state.setShowSystemTables,
		})),
	);

// Preferences hooks (app-level UI preferences)
export const useSidebarSections = () => useAppStore((state) => state.sidebarSectionsExpanded);
export const useSidebarSectionActions = () =>
	useAppStore(
		useShallow((state) => ({
			setSidebarSectionExpanded: state.setSidebarSectionExpanded,
			toggleSidebarSection: state.toggleSidebarSection,
			resetSidebarSections: state.resetSidebarSections,
		})),
	);

// Schema visualizer filter hooks
export const useShowSystemTablesInVisualizer = () =>
	useAppStore((state) => state.showSystemTablesInVisualizer);
export const useVisualizerFilterActions = () =>
	useAppStore(
		useShallow((state) => ({
			setShowSystemTablesInVisualizer: state.setShowSystemTablesInVisualizer,
			toggleShowSystemTablesInVisualizer: state.toggleShowSystemTablesInVisualizer,
		})),
	);

// Main sidebar pinned state hooks
export const useSidebarPinned = () => useAppStore((state) => state.sidebarPinned);
export const useSidebarPinnedActions = () =>
	useAppStore(
		useShallow((state) => ({
			setSidebarPinned: state.setSidebarPinned,
			toggleSidebarPinned: state.toggleSidebarPinned,
		})),
	);
