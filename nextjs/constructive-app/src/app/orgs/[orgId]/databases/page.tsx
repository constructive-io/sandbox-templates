'use client';

import { useState } from 'react';
import type { Route } from 'next';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Database, LayoutGrid, List, Plus, Search } from 'lucide-react';

import { useAccessibleDatabases, type AccessibleDatabase } from '@/lib/gql/hooks/schema-builder';
import { useOrganization } from '@/lib/gql/hooks/schema-builder/organizations';
import { useCreateDatabaseProvision } from '@/lib/gql/hooks/schema-builder/use-create-database-provision';
import { useDeleteDatabase } from '@/lib/gql/hooks/schema-builder/use-delete-database';
import { useUpdateDatabase } from '@/lib/gql/hooks/schema-builder/use-update-database';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { useCardStack } from '@constructive-io/ui/stack';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@constructive-io/ui/table';
import {
	CreateDatabaseCard,
	DatabaseCard,
	DatabaseCardSkeleton,
	DatabaseListRow,
	DatabaseListRowSkeleton,
	DeleteDatabaseDialog,
	EditDatabaseCard,
	type CreateDatabaseParams,
} from '@/components/databases';
import { PageHeaderWithIcon } from '@/components/shared/page-header-with-icon';

export default function DatabasesPage() {
	const params = useParams();
	const orgId = params.orgId as string;
	const router = useRouter();
	const stack = useCardStack();

	const [searchValue, setSearchValue] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [deleteDatabaseDialog, setDeleteDatabaseDialog] = useState<{
		isOpen: boolean;
		databaseId: string | null;
		databaseName: string | null;
	}>({
		isOpen: false,
		databaseId: null,
		databaseName: null,
	});

	// Fetch organization details
	const { organization, isLoading: isOrgLoading } = useOrganization({ orgId });

	// Fetch all accessible databases
	const { databases, isLoading: isDbLoading, error, refetch } = useAccessibleDatabases();

	// Mutation hooks
	const updateDatabaseMutation = useUpdateDatabase();
	const deleteDatabaseMutation = useDeleteDatabase();

	// Filter databases by organization owner
	const orgDatabases = databases.filter((db: AccessibleDatabase) => db.ownerId === orgId);

	// Filter by search
	const filteredDatabases = orgDatabases.filter((db: AccessibleDatabase) => {
		const name = db.label || db.name || '';
		return name.toLowerCase().includes(searchValue.toLowerCase());
	});

	const isLoading = isOrgLoading || isDbLoading;

	const handleRowClick = (databaseId: string) => {
		router.push(`/orgs/${orgId}/databases/${databaseId}/schemas` as string as Route);
	};

	// Database creation hook
	const createDatabaseProvision = useCreateDatabaseProvision();

	// Simplified handler - just calls provision mutation
	const handleCreateDatabase = async (params: CreateDatabaseParams) => {
		await createDatabaseProvision.mutateAsync({
			name: params.name,
			domain: params.domain,
			subdomain: params.subdomain,
			ownerId: orgId,
		});
		refetch();
	};

	const handleUpdateDatabase = async (id: string, name: string, label: string | null) => {
		await updateDatabaseMutation.mutateAsync({ id, name, label });
	};

	const handleDeleteDatabase = async (id: string) => {
		await deleteDatabaseMutation.mutateAsync({ id });
	};

	const openEditDatabaseCard = (database: AccessibleDatabase) => {
		stack.push({
			id: `edit-database-${database.id}`,
			title: 'Edit Database',
			Component: EditDatabaseCard,
			props: {
				databaseId: database.id,
				databaseName: database.name,
				databaseLabel: database.label ?? null,
				updateDatabase: handleUpdateDatabase,
			},
			width: CARD_WIDTHS.narrow,
		});
	};

	const openDeleteDatabaseDialog = (database: AccessibleDatabase) => {
		setDeleteDatabaseDialog({
			isOpen: true,
			databaseId: database.id,
			databaseName: database.label || database.name || 'Unnamed Database',
		});
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

	if (error) {
		return (
			<div className='h-full overflow-y-auto'>
				<div className='mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10'>
					<div
						className={cn(
							'border-destructive/30 bg-destructive/5 flex items-start gap-4 rounded-xl border p-5',
							'animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
						)}
					>
						<div className='bg-destructive/15 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
							<AlertCircle className='text-destructive h-5 w-5' />
						</div>
						<div>
							<h3 className='text-destructive text-sm font-semibold'>Failed to load databases</h3>
							<p className='text-muted-foreground mt-1 text-sm'>{error.message}</p>
							<Button variant='outline' size='sm' className='mt-3' onClick={() => refetch()}>
								Try Again
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full overflow-y-auto'>
			<div className='mx-auto max-w-6xl px-6 py-8 lg:px-8 lg:py-10'>
				<PageHeaderWithIcon
					title='Databases'
					description={
						organization?.displayName
							? `Manage databases for ${organization.displayName}`
							: 'Manage your organization databases'
					}
					icon={Database}
					actions={
						<Button className='gap-2' onClick={openCreateDatabaseCard} data-testid='dbs-create-button'>
							<Plus className='h-4 w-4' />
							New Database
						</Button>
					}
				/>

				{/* Filters section */}
				<section
					className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards mb-6 duration-500'
					style={{ animationDelay: '100ms' }}
				>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						{/* Search and count */}
						<div className='flex items-center gap-3'>
							<InputGroup className='max-w-sm flex-1'>
								<InputGroupAddon>
									<Search />
								</InputGroupAddon>
								<InputGroupInput
									placeholder='Search databases...'
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
									data-testid='dbs-search-input'
								/>
							</InputGroup>
							{!isLoading && (
								<span className='text-muted-foreground text-sm'>
									{filteredDatabases.length} {filteredDatabases.length === 1 ? 'database' : 'databases'}
								</span>
							)}
						</div>

						{/* View mode toggle */}
						<div className='border-border/50 flex rounded-lg border p-1'>
							<Button
								variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
								size='sm'
								className='gap-1.5 rounded-md'
								onClick={() => setViewMode('grid')}
								data-testid='dbs-view-grid'
							>
								<LayoutGrid className='h-4 w-4' />
								<span className='hidden sm:inline'>Grid</span>
							</Button>
							<Button
								variant={viewMode === 'list' ? 'secondary' : 'ghost'}
								size='sm'
								className='gap-1.5 rounded-md'
								onClick={() => setViewMode('list')}
								data-testid='dbs-view-list'
							>
								<List className='h-4 w-4' />
								<span className='hidden sm:inline'>List</span>
							</Button>
						</div>
					</div>
				</section>

				{/* Databases content */}
				<section
					className='animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-backwards duration-500'
					style={{ animationDelay: '150ms' }}
				>
					{isLoading ? (
						viewMode === 'grid' ? (
							<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{Array.from({ length: 6 }).map((_, index) => (
									<DatabaseCardSkeleton key={index} index={index} />
								))}
							</div>
						) : (
							<div className='border-border/50 bg-card rounded-xl border'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Database</TableHead>
											<TableHead className='w-[90px] text-right'>Tables</TableHead>
											<TableHead className='w-[90px] text-right'>APIs</TableHead>
											<TableHead className='w-12' />
										</TableRow>
									</TableHeader>
									<TableBody>
										{Array.from({ length: 5 }).map((_, i) => (
											<DatabaseListRowSkeleton key={i} />
										))}
									</TableBody>
								</Table>
							</div>
						)
					) : filteredDatabases.length === 0 ? (
						<div
							className='border-border/50 bg-muted/20 flex flex-col items-center justify-center rounded-xl border
								border-dashed py-16'
						>
							<div className='bg-muted/50 mb-4 flex h-14 w-14 items-center justify-center rounded-full'>
								<Database className='text-muted-foreground h-7 w-7' />
							</div>
							<h3 className='text-foreground text-base font-semibold tracking-tight'>
								{searchValue ? 'No databases found' : 'No Databases Yet'}
							</h3>
							<p className='text-muted-foreground mt-2 max-w-sm text-center text-sm'>
								{searchValue
									? 'Try adjusting your search query'
									: 'Create your first database to start building your schema and APIs.'}
							</p>
							{!searchValue && (
								<Button
									className='mt-6 gap-2'
									onClick={openCreateDatabaseCard}
									data-testid='dbs-empty-create-button'
								>
									<Plus className='h-4 w-4' />
									Create Database
								</Button>
							)}
						</div>
					) : viewMode === 'grid' ? (
						<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{filteredDatabases.map((database, index) => (
								<DatabaseCard
									key={database.id}
									database={database}
									onClick={() => handleRowClick(database.id)}
									index={index}
									onEdit={() => openEditDatabaseCard(database)}
									onDelete={() => openDeleteDatabaseDialog(database)}
								/>
							))}
						</div>
					) : (
						<div className='border-border/50 bg-card overflow-hidden rounded-xl border'>
							<Table>
								<TableHeader>
									<TableRow className='hover:bg-transparent'>
										<TableHead>Database</TableHead>
										<TableHead className='w-[90px] text-right'>Tables</TableHead>
										<TableHead className='w-[90px] text-right'>APIs</TableHead>
										<TableHead className='w-12' />
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredDatabases.map((database, index) => (
										<DatabaseListRow
											key={database.id}
											database={database}
											onClick={() => handleRowClick(database.id)}
											index={index}
											onEdit={() => openEditDatabaseCard(database)}
											onDelete={() => openDeleteDatabaseDialog(database)}
										/>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</section>

				{/* Bottom spacing */}
				<div className='h-10' />
			</div>

			<DeleteDatabaseDialog
				isOpen={deleteDatabaseDialog.isOpen}
				onOpenChange={(open) =>
					!open && setDeleteDatabaseDialog({ isOpen: false, databaseId: null, databaseName: null })
				}
				databaseId={deleteDatabaseDialog.databaseId}
				databaseName={deleteDatabaseDialog.databaseName}
				deleteDatabase={handleDeleteDatabase}
				isLoading={deleteDatabaseMutation.isPending}
			/>
		</div>
	);
}
