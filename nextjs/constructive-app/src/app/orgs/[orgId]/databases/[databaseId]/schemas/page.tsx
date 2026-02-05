'use client';

import dynamic from 'next/dynamic';

import { SchemaBuilderSkeleton } from '@/components/skeletons';

// Dynamic import: SchemasRoute includes heavy dependencies (xyflow, form-builder, table-editor)
// ~500KB+ code split from initial bundle
const SchemasRoute = dynamic(() => import('@/components/schemas').then((m) => ({ default: m.SchemasRoute })), {
	ssr: false,
	loading: () => <SchemaBuilderSkeleton />,
});

/**
 * Database Schemas page - displays schema builder for the database
 *
 * Route: /orgs/[orgId]/databases/[databaseId]/schemas
 */
export default function DatabaseSchemasPage() {
	return <SchemasRoute />;
}
