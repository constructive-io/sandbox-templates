'use client';

import { useMemo, useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Table2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import {
	databasePoliciesQueryKeys,
	useDatabasePolicies,
} from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { useDeletePolicyMutation } from '@sdk/api';

import { AccessModelSelectorCard } from '../../tables/access-model-selector-card';
import { PolicyCardItem } from './policy-card-item';
import { PolicyEditCard } from './policy-edit-card';
import { SecurityEmptyState } from './security-empty-state';

function NoTableSelectedState() {
	return (
		<div className='flex min-h-0 flex-1 flex-col items-center justify-center p-6'>
			<div className='bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<Table2 className='text-muted-foreground h-8 w-8' />
			</div>
			<h3 className='mb-1 text-lg font-semibold'>No table selected</h3>
			<p className='text-muted-foreground max-w-sm text-center text-sm'>
				Select a table from the sidebar to view and manage its security policies.
			</p>
		</div>
	);
}

export function SecurityView() {
	const [deletingPolicy, setDeletingPolicy] = useState<DatabasePolicy | null>(null);

	const stack = useCardStack();
	const queryClient = useQueryClient();
	const { currentTable, currentDatabase } = useSchemaBuilderSelectors();

	const databaseId = currentDatabase?.databaseId ?? '';
	const hasDatabase = Boolean(databaseId);

	const { data: tablesData = [], isLoading } = useDatabasePolicies(databaseId, { enabled: hasDatabase });

	const deletePolicy = useDeletePolicyMutation({
		onSuccess: () => {
			if (databaseId) {
				queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
			}
		},
	});

	// Get policies for the current table
	const currentTablePolicies = useMemo(() => {
		if (!currentTable) return [];
		const tableData = tablesData.find((t) => t.id === currentTable.id);
		return tableData?.policies ?? [];
	}, [tablesData, currentTable]);

	// No table selected state
	if (!currentTable) {
		return <NoTableSelectedState />;
	}

	const hasPolicies = currentTablePolicies.length > 0;

	const handleOpenCreate = () => {
		stack.push({
			id: `policy-create-${currentTable.id}`,
			title: 'Create New Policies',
			description: `Add security policies to ${currentTable.name}`,
			Component: AccessModelSelectorCard,
			props: {
				mode: 'add-policies' as const,
				tableId: currentTable.id,
				tableName: currentTable.name,
				onPoliciesCreated: () => {
					if (databaseId) {
						queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
					}
				},
			},
			width: CARD_WIDTHS.extraWide,
		});
	};

	const handleOpenEdit = (policy: DatabasePolicy) => {
		stack.push({
			id: `policy-edit-${policy.id}`,
			title: 'Edit Policy',
			description: policy.name ?? 'Update policy settings',
			Component: PolicyEditCard,
			props: {
				policy: { ...policy, tableId: currentTable.id },
				tableName: currentTable.name,
				onSuccess: () => {
					if (databaseId) {
						queryClient.invalidateQueries({ queryKey: databasePoliciesQueryKeys.byDatabase(databaseId) });
					}
				},
			},
			width: 500,
		});
	};

	const handleDelete = (policy: DatabasePolicy) => {
		setDeletingPolicy(policy);
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
			setDeletingPolicy(null);
		}
	};

	return (
		<div className='flex min-h-0 flex-1 flex-col overflow-auto p-6'>
			{isLoading ? (
				<div className='flex items-center justify-center py-16'>
					<p className='text-muted-foreground text-sm'>Loading policies...</p>
				</div>
			) : !hasPolicies ? (
				<SecurityEmptyState onCreateClick={handleOpenCreate} tableName={currentTable.name} />
			) : (
				<div className='mx-auto w-full max-w-4xl space-y-6'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-xl font-semibold tracking-tight'>Policies</h2>
							<p className='text-muted-foreground mt-1 text-sm'>
								{currentTablePolicies.length} polic{currentTablePolicies.length !== 1 ? 'ies' : 'y'} protecting{' '}
								<code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>{currentTable.name}</code>
							</p>
						</div>
						<Button onClick={handleOpenCreate}>
							<Plus className='mr-2 h-4 w-4' />
							New Policy
						</Button>
					</div>

					{/* Policy Cards */}
					<div className='space-y-3'>
						{currentTablePolicies.map((policy) => (
							<PolicyCardItem
								key={policy.id}
								policy={policy}
								isDeleting={deletingPolicy?.id === policy.id && deletePolicy.isPending}
								onEdit={() => handleOpenEdit(policy)}
								onDelete={() => handleDelete(policy)}
							/>
						))}
					</div>
				</div>
			)}

			<AlertDialog open={!!deletingPolicy} onOpenChange={(open) => !open && setDeletingPolicy(null)}>
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
							className='bg-destructive hover:bg-destructive/90 border-none'
						>
							{deletePolicy.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
