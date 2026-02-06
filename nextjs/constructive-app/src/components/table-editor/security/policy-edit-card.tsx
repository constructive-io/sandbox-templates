'use client';

import { useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Label } from '@constructive-io/ui/label';
import { ResponsiveDiagram } from '@constructive-io/ui/responsive-diagram';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectRichItem,
	SelectTrigger,
	SelectValue,
} from '@constructive-io/ui/select';
import type { CardComponent } from '@constructive-io/ui/stack';
import { Switch } from '@constructive-io/ui/switch';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { Info, Loader2Icon, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { POLICY_ROLES } from '@/components/policies/policies.types';
import { CompositePolicyBuilder, type CompositePolicyData } from '@/components/tables/composite-policy-builder';
import { injectSchemaFields } from '@/components/tables/policy-config';
import { PolicyConfigForm } from '@/components/tables/policy-config-form';
import { PolicyDiagramByKey } from '@/components/tables/policy-diagram';
import { usePolicyType, usePolicyTypes } from '@/components/tables/policy-hooks';
import { useUpdatePolicyMutation } from '@sdk/api';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { mapConditionNodeToAst } from '@/lib/policies/ast-helpers';
import { mapAstToConditionNode } from '@/lib/policies/rls-parser';

import { usePolicyEditState } from './use-policy-edit-state';

export interface PolicyEditCardProps {
	policy: DatabasePolicy & { tableId: string };
	tableName: string;
	onSuccess?: () => void;
}

const PRIVILEGE_CONFIG: Record<string, { bg: string; text: string; icon: typeof Search }> = {
	SELECT: {
		bg: 'bg-gradient-to-r from-sky-500/15 to-sky-400/10 ring-1 ring-sky-500/30',
		text: 'text-sky-600 dark:text-sky-400',
		icon: Search,
	},
	INSERT: {
		bg: 'bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 ring-1 ring-emerald-500/30',
		text: 'text-emerald-600 dark:text-emerald-400',
		icon: Plus,
	},
	UPDATE: {
		bg: 'bg-gradient-to-r from-amber-500/15 to-amber-400/10 ring-1 ring-amber-500/30',
		text: 'text-amber-600 dark:text-amber-400',
		icon: Pencil,
	},
	DELETE: {
		bg: 'bg-gradient-to-r from-rose-500/15 to-rose-400/10 ring-1 ring-rose-500/30',
		text: 'text-rose-600 dark:text-rose-400',
		icon: Trash2,
	},
};

/**
 * Card component for editing an existing policy.
 * Shows policy header, diagram, settings form, and access rule config.
 */
export const PolicyEditCard: CardComponent<PolicyEditCardProps> = ({ policy, tableName, onSuccess, card }) => {
	const { currentDatabase } = useSchemaBuilderSelectors();
	const schemaId = currentDatabase?.schemaId ?? '';

	const { policyType, isLoading: isPolicyTypeLoading } = usePolicyType(policy.policyType ?? '');
	const { policyTypes } = usePolicyTypes();
	const updatePolicyMutation = useUpdatePolicyMutation();

	const isCompositePolicy = policy.policyType === 'AuthzComposite';

	const { state, updateState, updatePolicyData, hasChanges } = usePolicyEditState(policy);

	// For composite policies, parse AST data to condition tree (memoized initial value)
	const initialCompositeData = useMemo(() => {
		if (!isCompositePolicy || !policy.data) return null;
		try {
			return mapAstToConditionNode(policy.data as Record<string, unknown>) as CompositePolicyData;
		} catch {
			return null;
		}
	}, [isCompositePolicy, policy.data]);

	const [compositeData, setCompositeData] = useState<CompositePolicyData | null>(initialCompositeData);
	const [compositeDataChanged, setCompositeDataChanged] = useState(false);

	const handleCompositeChange = (data: CompositePolicyData) => {
		setCompositeData(data);
		setCompositeDataChanged(true);
	};

	const handleSubmit = async () => {
		if (!policyType || !schemaId) return;

		try {
			// For composite policies, convert condition tree to AST
			const dataToSubmit = isCompositePolicy && compositeData
				? mapConditionNodeToAst(compositeData) ?? {}
				: injectSchemaFields(state.policyData, schemaId, policyType.name);

			await updatePolicyMutation.mutateAsync({
				input: {
					id: policy.id,
					patch: {
						permissive: state.isPermissive,
						disabled: !state.isEnabled,
						data: dataToSubmit,
					},
				},
			});

			showSuccessToast({
				message: 'Policy updated',
				description: `Policy "${policy.name}" has been updated successfully.`,
			});

			onSuccess?.();
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to update policy',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const canSubmit = isCompositePolicy ? compositeDataChanged || hasChanges : hasChanges;
		if (!updatePolicyMutation.isPending && canSubmit) {
			handleSubmit();
		}
	};

	const hasAnyChanges = isCompositePolicy ? compositeDataChanged || hasChanges : hasChanges;

	if (isPolicyTypeLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<Loader2Icon className='text-muted-foreground h-6 w-6 animate-spin' />
			</div>
		);
	}

	if (!policyType) {
		return (
			<div className='flex h-full items-center justify-center p-6'>
				<p className='text-muted-foreground text-sm'>Policy type not found</p>
			</div>
		);
	}

	const PolicyIcon = policyType.icon;
	const privilege = policy.privilege ?? 'SELECT';
	const privilegeConfig = PRIVILEGE_CONFIG[privilege] ?? PRIVILEGE_CONFIG.SELECT;
	const PrivilegeIcon = privilegeConfig.icon;

	return (
		<form onSubmit={handleFormSubmit} className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Policy Header */}
					<div className='space-y-4'>
						<div className='flex items-start gap-3'>
							<div className='bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg'>
								<PolicyIcon className='text-primary size-5' />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='flex items-center gap-2'>
									<h3 className='font-semibold'>{policyType.title}</h3>
									<span
										className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${privilegeConfig.bg} ${privilegeConfig.text}`}
									>
										<PrivilegeIcon className='size-3' />
										{privilege}
									</span>
								</div>
								<p className='text-muted-foreground text-sm'>{policyType.tagline}</p>
							</div>
						</div>

						{/* Policy Diagram */}
						<ResponsiveDiagram>
							<PolicyDiagramByKey
								diagramKey={policyType.diagramKey ?? 'allow-all'}
								tableName={tableName}
								config={state.policyData}
							/>
						</ResponsiveDiagram>
					</div>

					{/* Basic Settings */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Settings</p>
						<div className='grid gap-3 sm:grid-cols-2'>
							{/* Role - Read Only */}
							<div className='space-y-1.5'>
								<div className='flex h-5 items-center gap-1'>
									<Label htmlFor='policy-role'>Role</Label>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className='text-muted-foreground size-3.5 cursor-help' />
										</TooltipTrigger>
										<TooltipContent side='top'>
											Role cannot be changed after policy creation
										</TooltipContent>
									</Tooltip>
								</div>
								<Select value={state.roleName} disabled>
									<SelectTrigger id='policy-role'>
										<SelectValue placeholder='Select role' />
									</SelectTrigger>
									<SelectContent>
										{POLICY_ROLES.map((r) => (
											<SelectItem key={r.value} value={r.value}>
												{r.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Mode Selector */}
							<div className='space-y-1.5'>
								<div className='flex h-5 items-center'>
									<Label htmlFor='policy-mode'>Mode</Label>
								</div>
								<Select
									value={state.isPermissive ? 'permissive' : 'restrictive'}
									onValueChange={(v) => updateState({ isPermissive: v === 'permissive' })}
									disabled={updatePolicyMutation.isPending}
								>
									<SelectTrigger id='policy-mode'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectRichItem value='permissive' label='Permissive' description='Allows access when matched' />
										<SelectRichItem value='restrictive' label='Restrictive' description='Must pass for access' />
									</SelectContent>
								</Select>
							</div>

							{/* Status Switch */}
							<div className='space-y-1.5'>
								<div className='flex h-5 items-center'>
									<Label htmlFor='policy-enabled'>Status</Label>
								</div>
								<div className='flex h-9 items-center gap-2'>
									<Switch
										id='policy-enabled'
										checked={state.isEnabled}
										onCheckedChange={(checked) => updateState({ isEnabled: checked })}
										disabled={updatePolicyMutation.isPending}
									/>
									<span className='text-sm'>{state.isEnabled ? 'Enabled' : 'Disabled'}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Access Rule Config */}
					<div className='space-y-3'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Access Rule Config</p>
						{isCompositePolicy ? (
							<CompositePolicyBuilder
								value={compositeData as CompositePolicyData}
								onChange={handleCompositeChange}
								policyTypes={policyTypes}
								disabled={updatePolicyMutation.isPending}
							/>
						) : (
							<PolicyConfigForm
								policyType={policyType}
								value={state.policyData}
								onChange={updatePolicyData}
								disabled={updatePolicyMutation.isPending}
								hideAutoGeneratedInfo
								flattenAdvanced
							/>
						)}
					</div>
				</div>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button type='button' variant='outline' onClick={() => card.close()} disabled={updatePolicyMutation.isPending}>
					Cancel
				</Button>
				<Button type='submit' disabled={updatePolicyMutation.isPending || !hasAnyChanges}>
					{updatePolicyMutation.isPending && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
					{updatePolicyMutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	);
};
