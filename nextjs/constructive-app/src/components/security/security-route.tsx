'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@constructive-io/ui/alert-dialog';
import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { toast } from '@constructive-io/ui/toast';
import { RiAddLine, RiShieldCheckLine } from '@remixicon/react';
import { useQueryClient } from '@tanstack/react-query';
import { LockKeyhole } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import {
	databasePoliciesQueryKeys,
	useDatabasePolicies,
} from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { usePermissions } from '@/lib/gql/hooks/schema-builder/policies/use-permissions';
import { usePolicyFilters } from '@/store/app-store';
import { useDeletePolicyMutation } from '@sdk/app-public';

import { PermissionCard } from '../permissions/permission-card';
import type { PolicyStatus } from '../policies/policies.types';
import { isSystemTable } from '../policies/policies.utils';
import { PolicyCard } from '../policies/policy-card';
import { PolicyTableCard } from '../policies/policy-table-card';
import { PermissionsPanel } from './permissions-panel';
import { SecurityFilters } from './security-filters';
import { SecurityStats } from './security-stats';

export function SecurityRoute() {
	const stack = useCardStack();
	const [deletingPolicy, setDeletingPolicy] = useState<(DatabasePolicy & { tableId: string }) | undefined>(undefined);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
	const [privilegeFilter, setPrivilegeFilter] = useState<string | 'all'>('all');
	const [statusFilter, setStatusFilter] = useState<'all' | PolicyStatus>('all');

	const { currentDatabase } = useSchemaBuilderSelectors();

	const { showEmptyTables, setShowEmptyTables, showSystemTables, setShowSystemTables } = usePolicyFilters();

	const databaseId = currentDatabase?.databaseId ?? '';
	const hasDatabase = Boolean(databaseId);
	const queryClient = useQueryClient();

	const deletePolicy = useDeletePolicyMutation({
		onSuccess: () => {
			if (databaseId) {
				queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
			}
		},
	});

	const { data: permissionsData, isLoading: isPermissionsLoading, refetch: refetchPermissions } = usePermissions();

	useEffect(() => {
		setSearch('');
		setRoleFilter('all');
		setPrivilegeFilter('all');
		setStatusFilter('all');
	}, [databaseId]);

	const {
		data: tablesData = [],
		isLoading: isPoliciesLoading,
		error: policiesError,
	} = useDatabasePolicies(databaseId, { enabled: hasDatabase });

	const { activePoliciesCount, disabledPoliciesCount } = useMemo(() => {
		let active = 0;
		let disabled = 0;
		tablesData
			.filter((table) => showSystemTables || !isSystemTable(table.category))
			.forEach((table) => {
				table.policies.forEach((policy) => {
					if (policy.disabled) {
						disabled++;
					} else {
						active++;
					}
				});
			});
		return { activePoliciesCount: active, disabledPoliciesCount: disabled };
	}, [tablesData, showSystemTables]);

	const appPermissionsCount = permissionsData?.appPermissions?.length ?? 0;
	const membershipPermissionsCount = permissionsData?.membershipPermissions?.length ?? 0;

	const filteredTables = useMemo(() => {
		const hasActiveFilters = roleFilter !== 'all' || privilegeFilter !== 'all' || statusFilter !== 'all';
		const hasSearch = search.trim() !== '';

		const byTable = tablesData
			.filter((table) => {
				if (!showSystemTables && isSystemTable(table.category)) return false;
				return true;
			})
			.filter((table) => {
				if (!hasSearch) return true;
				const q = search.toLowerCase();
				if (table.name.toLowerCase().includes(q)) return true;
				return table.policies.some((policy) => (policy.name ?? '').toLowerCase().includes(q));
			});

		return byTable
			.map((table) => {
				const filteredPolicies = table.policies.filter((policy) => {
					if (roleFilter !== 'all' && (policy.roleName ?? '') !== roleFilter) return false;
					if (privilegeFilter !== 'all' && (policy.privilege ?? '') !== privilegeFilter) return false;
					if (statusFilter !== 'all') {
						const isDisabled = policy.disabled ?? false;
						const policyStatus = isDisabled ? 'disabled' : 'active';
						if (policyStatus !== statusFilter) return false;
					}
					return true;
				});

				const policies = filteredPolicies.map((policy) => ({
					id: policy.id ?? '',
					name: policy.name ?? '',
					targetRole: policy.roleName ?? 'unknown',
					privilege: policy.privilege ?? 'UNKNOWN',
					status: ((policy.disabled ?? false) ? 'disabled' : 'active') as PolicyStatus,
					policyType: policy.policyType ?? undefined,
					rawPolicy: policy,
				}));

				return {
					id: table.id,
					name: table.name,
					useRls: table.useRls,
					policies,
				};
			})
			.filter((table) => {
				if (table.policies.length === 0) {
					if (hasActiveFilters || hasSearch) return false;
					if (!showEmptyTables) return false;
				}
				return true;
			});
	}, [tablesData, showEmptyTables, showSystemTables, search, roleFilter, privilegeFilter, statusFilter]);

	const handleOpenDrawer = (tableId?: string) => {
		stack.push({
			id: tableId ? `policy-create-${tableId}` : 'policy-create',
			title: 'Create New Policy',
			description: 'Configure the details and conditions for your new security policy.',
			headerSize: 'lg',
			Component: PolicyCard,
			props: {
				selectedTableId: tableId,
				onSuccess: () => {
					// Policies will auto-refetch via React Query invalidation
				},
			},
			width: 900,
		});
	};

	const handleEditPolicy = (policy: DatabasePolicy, tableId: string) => {
		stack.push({
			id: `policy-edit-${policy.id}`,
			title: 'Edit Policy',
			description: 'Update the details and conditions for your security policy.',
			headerSize: 'lg',
			Component: PolicyCard,
			props: {
				editingPolicy: { ...policy, tableId },
				onSuccess: () => {
					// Policies will auto-refetch via React Query invalidation
				},
			},
			width: 900,
		});
	};

	const handleDeletePolicy = (policy: DatabasePolicy, tableId: string) => {
		setDeletingPolicy({ ...policy, tableId });
	};

	const handleConfirmDelete = async () => {
		if (!deletingPolicy) return;

		try {
			await deletePolicy.mutateAsync({
				input: { id: deletingPolicy.id },
			});
			toast.success({
				message: 'Policy deleted',
				description: `Policy "${deletingPolicy.name}" has been successfully deleted.`,
			});
		} catch (error) {
			toast.error({
				message: 'Failed to delete policy',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		} finally {
			setDeletingPolicy(undefined);
		}
	};

	return (
		<div className='from-background via-background to-muted/20 flex h-full flex-col overflow-y-auto bg-linear-to-br'>
			{/* Fixed header section */}
			<div className='shrink-0 px-4 pt-6 md:px-6 lg:px-8'>
				<div className='mx-auto max-w-350'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
						<div className='space-y-2'>
							<h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>Security</h1>
							<p className='text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base'>
								Manage data access rules and app capabilities.
							</p>
						</div>
						<div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3'>
							<Button
								variant='outline'
								className='w-full rounded-lg sm:w-auto'
								onClick={() => {
									stack.push({
										id: 'permission-create-app',
										title: 'Create App Permission',
										description: 'Add a new app permission.',
										Component: PermissionCard,
										props: {
											type: 'app' as const,
											editingPermission: null,
											onSuccess: refetchPermissions,
										},
										width: 480,
									});
								}}
							>
								<RiAddLine className='size-5' />
								<span className='font-semibold'>New Permission</span>
							</Button>
							<Button className='w-full rounded-lg sm:w-auto' onClick={() => handleOpenDrawer()}>
								<RiAddLine className='size-5' />
								<span className='font-semibold'>Create Policy</span>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Stats section */}
			<div className='shrink-0 px-4 pt-6 md:px-6 lg:px-8'>
				<div className='mx-auto max-w-350'>
					<SecurityStats
						activePolicies={activePoliciesCount}
						disabledPolicies={disabledPoliciesCount}
						appPermissions={appPermissionsCount}
						membershipPermissions={membershipPermissionsCount}
					/>
				</div>
			</div>

			{/* Filters section */}
			<div className='shrink-0 px-4 pt-6 md:px-6 lg:px-8'>
				<div className='mx-auto max-w-350'>
					<SecurityFilters
						search={search}
						onSearchChange={setSearch}
						showEmptyTables={showEmptyTables}
						onShowEmptyTablesChange={setShowEmptyTables}
						showSystemTables={showSystemTables}
						onShowSystemTablesChange={setShowSystemTables}
						roleFilter={roleFilter}
						onRoleFilterChange={setRoleFilter}
						privilegeFilter={privilegeFilter}
						onPrivilegeFilterChange={setPrivilegeFilter}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
					/>
				</div>
			</div>

			{/* Two-column content area */}
			<div className='flex flex-1 flex-col px-4 pt-6 pb-6 md:px-6 lg:px-8'>
				<div className='mx-auto flex w-full max-w-350 flex-1 flex-col gap-8 xl:flex-row'>
					{/* Policies column */}
					<div className='order-2 flex flex-1 flex-col xl:order-1 xl:basis-2/3'>
						<div className='flex shrink-0 items-center gap-2 pb-4'>
							<LockKeyhole className='h-5 w-5 text-sky-500' />
							<h2 className='text-foreground text-base font-semibold'>Policies</h2>
							<span className='text-muted-foreground text-sm'>Row-level rules by table</span>
						</div>

						{/* Content */}
						<div>
							{!hasDatabase ? (
								<div
									className='border-border/60 text-muted-foreground bg-card flex flex-col items-center justify-center
										rounded-xl border border-dashed py-16 text-center'
								>
									<p className='text-sm'>Select a database to view its policies.</p>
								</div>
							) : isPoliciesLoading ? (
								<div className='flex items-center justify-center py-16'>
									<p className='text-muted-foreground text-sm'>Loading policies...</p>
								</div>
							) : policiesError ? (
								<div className='border-destructive/50 bg-destructive/10 rounded-xl border p-6'>
									<p className='text-destructive text-sm'>
										Failed to load policies: {policiesError instanceof Error ? policiesError.message : 'Unknown error'}
									</p>
								</div>
							) : filteredTables.length === 0 ? (
								<div
									className='border-border/60 text-muted-foreground bg-card flex flex-col items-center justify-center
										rounded-xl border border-dashed py-16 text-center'
								>
									<p className='text-sm'>No policies match your filters.</p>
								</div>
							) : (
								<div className='space-y-5'>
									{filteredTables.map((table) => (
										<PolicyTableCard
											key={table.id}
											table={table}
											onCreatePolicy={handleOpenDrawer}
											onEditPolicy={handleEditPolicy}
											onDeletePolicy={handleDeletePolicy}
										/>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Permissions column */}
					<div className='order-1 flex flex-1 flex-col xl:order-2 xl:basis-1/3'>
						<div className='flex shrink-0 items-center gap-2 pb-4'>
							<RiShieldCheckLine className='h-5 w-5 text-sky-500' />
							<h2 className='text-foreground text-base font-semibold'>Permissions</h2>
							<span className='text-muted-foreground text-sm'>App capabilities</span>
						</div>

						{/* Content */}
						<div>
							<PermissionsPanel
								permissionsData={permissionsData}
								isLoading={isPermissionsLoading}
								onRefetch={refetchPermissions}
							/>
						</div>
					</div>
				</div>
			</div>

			<AlertDialog open={!!deletingPolicy} onOpenChange={(open) => !open && setDeletingPolicy(undefined)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Policy</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the policy <strong>&quot;{deletingPolicy?.name}&quot;</strong>? This
							action cannot be undone and may affect access control for your database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deletePolicy.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleConfirmDelete();
							}}
							disabled={deletePolicy.isPending}
							className='bg-destructive hover:bg-destructive/90'
						>
							{deletePolicy.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
