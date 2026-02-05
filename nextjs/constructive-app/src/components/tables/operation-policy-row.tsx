'use client';

import { Button } from '@constructive-io/ui/button';
import { CheckIcon, LightbulbIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';

import { POLICY_ROLES } from '@/components/policies/policies.types';

import {
	OPERATION_DESCRIPTIONS,
	OPERATION_HINTS,
	OPERATION_LABELS,
	OPERATION_STYLES,
	type CrudOperation,
	type OperationPolicyConfig,
} from './policy-types';

const OPERATION_ICONS = {
	Plus: PlusIcon,
	Search: SearchIcon,
	Pencil: PencilIcon,
	Trash2: Trash2Icon,
} as const;

/** Pill-style badge for settings summary */
function SettingsPill({ children }: { children: React.ReactNode }) {
	return <span className='bg-muted/60 text-muted-foreground rounded px-2 py-0.5 text-[11px]'>{children}</span>;
}

interface OperationPolicyRowProps {
	operation: CrudOperation;
	config: OperationPolicyConfig;
	policyTypeName: string;
	onEdit: () => void;
	disabled?: boolean;
}

/**
 * Compact row showing operation policy config with Edit button.
 */
export function OperationPolicyRow({ operation, config, policyTypeName, onEdit, disabled }: OperationPolicyRowProps) {
	const operationLabel = OPERATION_LABELS[operation];
	const operationDescription = OPERATION_DESCRIPTIONS[operation];
	const style = OPERATION_STYLES[operation];
	const Icon = OPERATION_ICONS[style.iconName];
	const roleLabel = POLICY_ROLES.find((r) => r.value === config.roleName)?.label ?? config.roleName;
	const modeLabel = config.isPermissive ? 'Permissive' : 'Restrictive';
	const hint = OPERATION_HINTS[operation];

	return (
		<div className='group border-border/60 relative flex items-start gap-3 rounded-xl border px-4 py-3'>
			{/* Decorative corner accent */}
			<div className='pointer-events-none absolute -top-px -right-px size-3 overflow-hidden rounded-tr-xl rounded-bl-md'>
				<div className='from-border/40 absolute -top-1 -right-1 size-4 rotate-45 bg-gradient-to-br to-transparent' />
			</div>

			<div className='min-w-0 flex-1 space-y-2'>
				{/* Header: Operation badge + status */}
				<div className='flex items-center gap-2'>
					<span
						className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${style.bgClass}
							${style.textClass}`}
					>
						<Icon className='size-3.5' />
						{operationLabel}
					</span>
					{config.isCustomized ? (
						<span className='text-muted-foreground flex items-center gap-1 text-[11px]'>
							<span className='size-1.5 rounded-full bg-amber-500' />
							Customized
						</span>
					) : (
						<span className='text-muted-foreground flex items-center gap-1 text-[11px]'>
							<CheckIcon className='size-3 text-emerald-500' />
							Defaults
						</span>
					)}
				</div>

				{/* Description */}
				<p className='text-foreground/70 text-[13px]'>{operationDescription}</p>

				{/* Hint (if available) */}
				{hint && (
					<p
						className='flex items-start gap-2 rounded-lg bg-sky-500/5 px-3 py-2 text-xs text-sky-700 ring-1
							ring-sky-500/10 dark:text-sky-300'
					>
						<LightbulbIcon className='mt-0.5 size-3.5 shrink-0' />
						<span className='leading-relaxed'>{hint}</span>
					</p>
				)}

				{/* Settings summary */}
				<div className='flex flex-wrap items-center gap-1.5'>
					<SettingsPill>{policyTypeName}</SettingsPill>
					<span className='text-muted-foreground/40'>·</span>
					<SettingsPill>{roleLabel}</SettingsPill>
					<span className='text-muted-foreground/40'>·</span>
					<SettingsPill>{modeLabel}</SettingsPill>
				</div>
			</div>
			<Button
				variant='ghost'
				size='sm'
				onClick={onEdit}
				disabled={disabled}
				className='shrink-0 opacity-50 hover:opacity-100'
			>
				Edit
			</Button>
		</div>
	);
}
