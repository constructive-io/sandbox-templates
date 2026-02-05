'use client';

// Route-specific CSS: only loaded for database routes (not auth pages)
import '@glideapps/glide-data-grid/dist/index.css';

import { ReactNode, useEffect } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useEntityParams } from '@/lib/navigation';

interface DatabaseLayoutProps {
	children: ReactNode;
}

/**
 * Database-scoped layout - validates database from URL and renders children.
 *
 * URL is the source of truth for entity selection.
 * This layout validates that both the org and database exist and redirects if not found.
 *
 * Loading Strategy:
 * - Always render children during loading - page components handle their own skeletons
 * - Redirect on validation failure without showing intermediate messages
 * - This eliminates flash of "Redirecting..." text
 *
 * Entity hierarchy: App (root) -> Org -> Database
 */
export default function DatabaseLayout({ children }: DatabaseLayoutProps) {
	const router = useRouter();
	const { orgId, databaseId, database, validation, isLoading } = useEntityParams();

	// Handle redirect in useEffect to avoid React render-during-render issues
	// and to prevent flash of redirect message
	useEffect(() => {
		if (isLoading) return;

		// Validation failed - redirect
		if (!validation.isValid) {
			const redirectPath = (validation.redirectTo ?? '/') as Route;
			router.replace(redirectPath);
			return;
		}

		// Database not found after loading (extra safety check)
		if (orgId && databaseId && !database) {
			const redirectPath = `/orgs/${orgId}/databases` as Route;
			router.replace(redirectPath);
		}
	}, [isLoading, validation, orgId, databaseId, database, router]);

	// Always render children - they handle their own loading states
	// Redirect happens in useEffect without blocking render
	return <>{children}</>;
}
