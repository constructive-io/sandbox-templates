'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { TooltipProvider } from '@constructive-io/ui/tooltip';
import { parseAsString, useQueryState } from 'nuqs';

import { useSchemaBuilderSelectors, useVisualizerSchema } from '@/lib/gql/hooks/schema-builder';
import { useShowSystemTablesInVisualizer } from '@/store/app-store';
import { NoDatabasesEmptyState } from '@/components/databases';
import {
	ContentFadeIn,
	SchemaBuilderSkeleton,
	SchemaBuilderEditorSkeleton,
	Skeleton,
} from '@/components/skeletons';
// Light-weight header component loaded synchronously
import { SchemaBuilderHeader } from '@/components/table-editor';

import { ClientOnly } from '../client-only';
import { SchemaBuilderSidebar } from './schema-builder-sidebar';
import { SchemaStateDisplay } from './schema-state-display';

// Dynamic imports: Heavy tab-specific components loaded on-demand
// Each ~100-200KB, loaded only when user switches to that tab
const TableEditor = dynamic(() => import('@/components/table-editor').then((m) => m.TableEditor), {
	ssr: false,
	loading: () => <SchemaBuilderEditorSkeleton />,
});

const RelationshipsView = dynamic(() => import('@/components/table-editor').then((m) => m.RelationshipsView), {
	ssr: false,
	loading: () => <SchemaBuilderEditorSkeleton />,
});

const IndexesView = dynamic(() => import('@/components/table-editor').then((m) => m.IndexesView), {
	ssr: false,
	loading: () => <SchemaBuilderEditorSkeleton />,
});

const FormBuilderEditor = dynamic(() => import('@/components/form-builder').then((m) => m.FormBuilderEditor), {
	ssr: false,
	loading: () => <SchemaBuilderEditorSkeleton />,
});

const SchemaVisualizer = dynamic(() => import('@/components/schema-visualizer/schema-visualizer'), {
	ssr: false,
	loading: () => (
		<div className='flex h-full items-center justify-center'>
			<Skeleton className='h-full w-full' />
		</div>
	),
});

export function SchemasRoute() {
	const [leftPanelVisible, setLeftPanelVisible] = useState(true);
	const [activeTab, setActiveTab] = useState('editor');
	const [urlTab, setUrlTab] = useQueryState('tab', parseAsString);
	const isSyncingTabRef = useRef(false);

	// Use new selectors - data is derived from React Query, no sync needed
	const {
		selectedSchemaKey,
		availableSchemas,
		setActiveTab: setStoreActiveTab,
		isLoading,
		error: remoteSchemasError,
		refetch,
	} = useSchemaBuilderSelectors();

	// Get visualizer filter setting (persisted preference)
	const showSystemTables = useShowSystemTablesInVisualizer();

	// Get visualizer schema (computed from currentSchema, filtered by category)
	const visualizerSchema = useVisualizerSchema({ showSystemTables });

	// Sync URL -> local tab state
	useEffect(() => {
		if (isSyncingTabRef.current) return;

		const nextTab = urlTab ?? 'editor';
		if (nextTab !== activeTab) {
			isSyncingTabRef.current = true;
			setActiveTab(nextTab);
			requestAnimationFrame(() => {
				isSyncingTabRef.current = false;
			});
		}
	}, [urlTab, activeTab]);

	const handleTabChange = (newTab: string) => {
		setActiveTab(newTab);
		setStoreActiveTab(newTab === 'diagram' ? 'diagram' : 'schemas');

		// Persist in URL: default editor has no param
		isSyncingTabRef.current = true;
		if (newTab === 'editor') {
			setUrlTab(null);
		} else {
			setUrlTab(newTab);
		}
		requestAnimationFrame(() => {
			isSyncingTabRef.current = false;
		});
	};

	// NOTE: No need to manually call loadIntoBuilder - data is derived automatically

	// Get display schema for visualizer
	const displaySchema = useMemo(() => {
		// Prefer the computed visualizer schema
		if (visualizerSchema) return visualizerSchema;

		// Fallback to first available schema
		const selectedSchema = availableSchemas.find((s) => s.key === selectedSchemaKey)?.schema;
		const fallbackSchema = availableSchemas[0]?.schema;
		return selectedSchema || fallbackSchema || null;
	}, [visualizerSchema, availableSchemas, selectedSchemaKey]);

	// Determine current state - filter to only database schemas (not custom)
	const databaseSchemas = availableSchemas.filter((s) => s.source === 'database');
	const hasDatabases = databaseSchemas.length > 0;
	const hasSchemas = availableSchemas.length > 0;

	// Show skeleton only during initial load with no cached data
	const showSkeleton = isLoading && !hasSchemas;

	// Loading fallback for ClientOnly (server-side render)
	const loadingFallback = (
		<div className='bg-background text-foreground flex h-full flex-col overflow-hidden'>
			<SchemaBuilderSkeleton />
		</div>
	);

	return (
		<ClientOnly fallback={loadingFallback}>
			<TooltipProvider>
				<div className='bg-background text-foreground flex h-full flex-col overflow-hidden'>
					{/* Error state - full page with skeleton background */}
					{remoteSchemasError && (
						<SchemaStateDisplay
							config={{
								type: 'error',
								message: remoteSchemasError.message,
								error: remoteSchemasError,
								onRetry: refetch,
							}}
						/>
					)}

					{/* Initial loading state - full page skeleton */}
					{showSkeleton && !remoteSchemasError && <SchemaBuilderSkeleton />}

					{/* Empty state - show when no databases exist (but not during initial load or error) */}
					{!remoteSchemasError && !showSkeleton && !hasDatabases && <NoDatabasesEmptyState />}

					{/* Main content - only show when not in error/loading state AND has databases */}
					{!remoteSchemasError && !showSkeleton && hasDatabases && (
						<ContentFadeIn className='flex min-h-0 min-w-0 flex-1'>
							{leftPanelVisible && <SchemaBuilderSidebar />}

							<div className='flex min-h-0 min-w-0 flex-1 flex-col'>
								<SchemaBuilderHeader
									leftPanelVisible={leftPanelVisible}
									setLeftPanelVisible={setLeftPanelVisible}
									activeTab={activeTab}
									setActiveTab={handleTabChange}
								/>

								<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
									{activeTab === 'editor' && <TableEditor />}

									{activeTab === 'relationships' && <RelationshipsView />}

									{activeTab === 'indexes' && <IndexesView />}

									{activeTab === 'form-builder' && <FormBuilderEditor />}

									{activeTab === 'diagram' && (
										<div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
											{displaySchema && <SchemaVisualizer schema={displaySchema} />}
										</div>
									)}
								</div>
							</div>
						</ContentFadeIn>
					)}
				</div>
			</TooltipProvider>
		</ClientOnly>
	);
}
