'use client';

import { RiPlayCircleLine, RiDatabase2Line } from '@remixicon/react';

import type { AccessibleDatabase } from '@/lib/gql/hooks/schema-builder';
import { buildOrgDatabaseRoute } from '@/app-routes';

import { EntityCard } from './entity-card';

export interface DatabaseCardProps {
	/** Database data */
	database: AccessibleDatabase;
	/** Organization ID for building the database URL */
	orgId: string;
	/** Additional class names */
	className?: string;
}

/**
 * Database card component - displays database information in a card format
 *
 * Used in the databases list page to show all databases for an organization.
 *
 * @example
 * ```tsx
 * <DatabaseCard database={database} orgId={orgId} />
 * ```
 */
export function DatabaseCard({ database, orgId, className }: DatabaseCardProps) {
	const tableCount = database.tables?.totalCount ?? 0;
	const schemaCount = database.schemas?.nodes?.length ?? 0;
	const apiCount = database.apis?.nodes?.length ?? 0;

	// Build description from database stats
	const descriptionParts: string[] = [];
	if (tableCount > 0) {
		descriptionParts.push(`${tableCount} table${tableCount !== 1 ? 's' : ''}`);
	}
	if (apiCount > 0) {
		descriptionParts.push(`${apiCount} API${apiCount !== 1 ? 's' : ''}`);
	}
	const description = descriptionParts.length > 0 ? descriptionParts.join(' | ') : 'Empty database';

	// Build tags for metadata
	const tags: { label: string; variant: 'default' | 'secondary' | 'outline' }[] = [];

	// Add schema count if available
	if (schemaCount > 0) {
		tags.push({
			label: `${schemaCount} schema${schemaCount !== 1 ? 's' : ''}`,
			variant: 'outline',
		});
	}

	const displayName = database.label || database.name || 'Unnamed Database';

	return (
		<EntityCard
			id={database.id}
			name={displayName}
			description={description}
			href={buildOrgDatabaseRoute('ORG_DATABASE_SCHEMAS', orgId, database.id)}
			statusDivider={false}
			status={{
				label: 'Active',
				icon: <RiPlayCircleLine className='h-4 w-4 text-green-500' aria-hidden='true' />,
			}}
			tags={tags.length > 0 ? tags : undefined}
			className={className}
		/>
	);
}
