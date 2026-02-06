import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import { AuthSlice, createAuthSlice, deserializeAuthSlice, serializeAuthSlice } from './auth-slice';
import { createEnvSlice, deserializeEnvSlice, EnvSlice, serializeEnvSlice } from './env-slice';
import {
	createPreferencesSlice,
	deserializePreferencesSlice,
	PreferencesSlice,
	serializePreferencesSlice,
} from './preferences-slice';

export type AppState = AuthSlice & EnvSlice & PreferencesSlice;

export const useAppStore = create<AppState>()(
	persist(
		(...args) => ({
			...createAuthSlice(...args),
			...createEnvSlice(...args),
			...createPreferencesSlice(...args),
		}),
		{
			name: 'constructive-app-store',
			partialize: (state) => ({
				...serializeAuthSlice(state),
				...serializeEnvSlice(state),
				...serializePreferencesSlice(state),
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					const authState = deserializeAuthSlice(state);
					const envState = deserializeEnvSlice(state);
					const preferencesState = deserializePreferencesSlice(state);
					Object.assign(state, authState, envState, preferencesState);
				}
			},
		},
	),
);

// Export the useShallow hook for performance optimizations
export { useShallow };

/* ==== Exported hooks ==== */

// Auth hooks

/**
 * Hook to access schema-builder (app-level) auth state.
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

export const useAuth = useSchemaBuilderAuth;

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
export const useDirectConnect = () => {
	return useAppStore(
		useShallow((state) => {
			const config = state.directConnect['schema-builder'];
			return {
				config,
				isEnabled: config?.enabled ?? false,
				endpoint: config?.endpoint ?? null,
				skipAuth: config?.skipAuth ?? true,
			};
		}),
	);
};

export const useDirectConnectActions = () =>
	useAppStore(
		useShallow((state) => ({
			setDirectConnect: state.setDirectConnect,
			clearDirectConnect: state.clearDirectConnect,
			isDirectConnectEnabled: state.isDirectConnectEnabled,
			getDirectConnectEndpoint: state.getDirectConnectEndpoint,
			shouldBypassAuth: state.shouldBypassAuth,
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

// Main sidebar pinned state hooks
export const useSidebarPinned = () => useAppStore((state) => state.sidebarPinned);
export const useSidebarPinnedActions = () =>
	useAppStore(
		useShallow((state) => ({
			setSidebarPinned: state.setSidebarPinned,
			toggleSidebarPinned: state.toggleSidebarPinned,
		})),
	);
