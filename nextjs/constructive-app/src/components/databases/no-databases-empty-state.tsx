'use client';

import { useParams, useRouter } from 'next/navigation';
import { DatabaseIcon, Plus } from 'lucide-react';

import { buildOrgDatabaseRoute } from '@/app-routes';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateDatabaseProvision } from '@/lib/gql/hooks/schema-builder/use-create-database-provision';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';

import type { CreateDatabaseParams } from './create-database-card';
import { CreateDatabaseCard } from './create-database-card';

/**
 * Subtle dot grid background - hints at schema/data structure
 */
function DotGrid() {
	return (
		<div className='pointer-events-none absolute inset-0 overflow-hidden opacity-40 dark:opacity-20'>
			<svg className='absolute inset-0 h-full w-full' xmlns='http://www.w3.org/2000/svg'>
				<defs>
					<pattern id='dot-grid' width='24' height='24' patternUnits='userSpaceOnUse'>
						<circle cx='2' cy='2' r='1' fill='currentColor' className='text-muted-foreground/40' />
					</pattern>
				</defs>
				<rect width='100%' height='100%' fill='url(#dot-grid)' />
			</svg>
		</div>
	);
}

/**
 * Empty state component shown when user has no databases
 *
 * Design: Clean with subtle personality
 * - Dot grid background for visual texture
 * - Icon with soft gradient and ring accent
 * - Clear typography and single CTA
 */
export function NoDatabasesEmptyState() {
	const stack = useCardStack();
	const router = useRouter();
	const params = useParams();
	const orgId = (params?.orgId as string) ?? null;
	const createDatabaseProvision = useCreateDatabaseProvision();
	const { selectSchema } = useSchemaBuilderSelectors();

	const handleCreateDatabase = async (params: CreateDatabaseParams) => {
		const result = await createDatabaseProvision.mutateAsync({
			name: params.name,
			domain: params.domain,
			subdomain: params.subdomain,
		});

		// Navigate to the new database if we have an ID
		if (result.provision.databaseId && orgId) {
			const route = buildOrgDatabaseRoute('ORG_DATABASE_SCHEMAS', orgId, result.provision.databaseId);
			router.push(route);
			return;
		}

		if (result.provision.databaseId) {
			selectSchema(`db-${result.provision.databaseId}`);
		}
	};

	const openCreateDatabaseCard = () => {
		stack.push({
			id: 'create-database',
			title: 'Create Database',
			Component: CreateDatabaseCard,
			props: { createDatabase: handleCreateDatabase },
			width: CARD_WIDTHS.medium,
		});
	};

	return (
		<div className='bg-background relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden'>
			<DotGrid />

			{/* Content */}
			<div className='relative z-10 flex max-w-md flex-col items-center px-6 text-center'>
				{/* Icon with ring accent */}
				<div className='relative mb-8'>
					{/* Outer ring */}
					<div className='absolute -inset-3 rounded-full border border-dashed border-primary/20' />

					{/* Icon container */}
					<div className='relative flex h-20 w-20 items-center justify-center rounded-full border border-border/20 bg-gradient-to-br from-muted/80 to-muted/40'>
						<DatabaseIcon className='h-9 w-9 text-primary/80' strokeWidth={1.5} />
					</div>

					{/* Small accent dot */}
					<div className='absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-primary/60' />
				</div>

				{/* Text */}
				<h2 className='text-foreground mb-2 text-xl font-semibold tracking-tight'>No databases yet</h2>
				<p className='text-muted-foreground mb-8 text-sm leading-relaxed'>
					Create your first database to start building schemas, defining tables, and designing your data architecture.
				</p>

				{/* CTA */}
				<Button size='lg' onClick={openCreateDatabaseCard} className='px-6'>
					<Plus className='mr-2 h-4 w-4' />
					Create Database
				</Button>

				{/* Subtle helper text */}
				<p className='text-muted-foreground/60 mt-4 text-xs'>Includes auto-generated GraphQL API and modules</p>
			</div>
		</div>
	);
}
