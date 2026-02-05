'use client';

import { Button } from '@constructive-io/ui/button';
import { Label } from '@constructive-io/ui/label';
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
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';

import { POLICY_ROLES, type PolicyRole } from '@/components/policies/policies.types';

import { isPerOperationField } from './policy-config';
import { PolicyConfigForm } from './policy-config-form';
import { useFormSchema } from './policy-hooks';
import {
	OPERATION_DESCRIPTIONS,
	OPERATION_LABELS,
	OPERATION_STYLES,
	type CrudOperation,
	type MergedPolicyType,
	type OperationPolicyConfig,
} from './policy-types';

const OPERATION_ICONS = {
	Plus: PlusIcon,
	Search: SearchIcon,
	Pencil: PencilIcon,
	Trash2: Trash2Icon,
} as const;

export interface OperationEditCardProps {
	operation: CrudOperation;
	config: OperationPolicyConfig;
	policyType: MergedPolicyType;
	onSave: (updates: Partial<Omit<OperationPolicyConfig, 'isCustomized'>>) => void;
	onResetToDefaults: () => void;
}

/**
 * Side card for editing operation-specific policy settings.
 * Controlled component - all state lives in parent, changes are immediate.
 */
export const OperationEditCard: CardComponent<OperationEditCardProps> = ({
	operation,
	config,
	policyType,
	onSave,
	onResetToDefaults,
	card,
}) => {
	// Derive values directly from config prop (controlled component)
	const roleName = config.roleName as PolicyRole;
	const isPermissive = config.isPermissive;
	const policyData = config.policyData;

	// Handlers call onSave immediately - parent is source of truth
	const handleRoleChange = (value: string) => {
		onSave({ roleName: value as PolicyRole, isPermissive, policyData });
	};

	const handleModeChange = (value: string) => {
		onSave({ roleName, isPermissive: value === 'permissive', policyData });
	};

	const handlePolicyDataChange = (newPolicyData: Record<string, unknown>) => {
		onSave({ roleName, isPermissive, policyData: newPolicyData });
	};

	const handleResetToDefaults = () => {
		onResetToDefaults();
	};

	const handleDone = () => {
		card.close();
	};

	// Check if policy type has any per-operation fields to show
	const { mainFields, advancedFields } = useFormSchema(policyType);
	const hasPerOperationFields = [...mainFields, ...advancedFields].some((f) =>
		isPerOperationField(policyType.name, f.key),
	);

	// Operation badge styling
	const operationLabel = OPERATION_LABELS[operation];
	const operationDescription = OPERATION_DESCRIPTIONS[operation];
	const style = OPERATION_STYLES[operation];
	const Icon = OPERATION_ICONS[style.iconName];

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<div className='space-y-6 p-6'>
					{/* Operation Badge Header */}
					<div className='flex items-start gap-3'>
						<div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg ${style.bgClass}`}>
							<Icon className={`size-5 ${style.textClass}`} />
						</div>
						<div className='min-w-0 flex-1'>
							<span className={`text-sm font-bold tracking-wide uppercase ${style.textClass}`}>{operationLabel}</span>
							<p className='text-muted-foreground mt-0.5 text-xs'>{operationDescription}</p>
						</div>
					</div>

					{/* Policy Settings */}
					<div className='space-y-4'>
						<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Policy Settings</p>

						{/* Role select */}
						<div className='space-y-1.5'>
							<Label htmlFor={`${operation}-role`}>Role</Label>
							<Select value={roleName} onValueChange={handleRoleChange}>
								<SelectTrigger id={`${operation}-role`}>
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

						{/* Mode select */}
						<div className='space-y-1.5'>
							<Label htmlFor={`${operation}-mode`}>Mode</Label>
							<Select value={isPermissive ? 'permissive' : 'restrictive'} onValueChange={handleModeChange}>
								<SelectTrigger id={`${operation}-mode`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectRichItem value='permissive' label='Permissive' description='Allows access when matched' />
									<SelectRichItem value='restrictive' label='Restrictive' description='Must pass for access' />
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Per-operation settings (permission, is_admin, is_owner) - only shown if policy has per-op fields */}
					{hasPerOperationFields && (
						<div className='space-y-4'>
							<p className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Access Settings</p>
							<PolicyConfigForm
								policyType={policyType}
								value={policyData}
								onChange={handlePolicyDataChange}
								hideAutoGeneratedInfo
								flattenAdvanced
								perOperationOnly
							/>
						</div>
					)}
				</div>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button type='button' variant='outline' onClick={handleResetToDefaults}>
					Reset to Defaults
				</Button>
				<Button type='button' onClick={handleDone}>
					Done
				</Button>
			</div>
		</div>
	);
};
