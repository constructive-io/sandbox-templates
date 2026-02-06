'use client';

import { Button } from '@constructive-io/ui/button';
import { Loader2, Shield, Trash2 } from 'lucide-react';

import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { cn } from '@/lib/utils';

import { getRoleLabel } from '../../policies/policies.utils';
import { POLICY_TYPE_UI_CONFIG } from '../../tables/policy-config';

// Privilege styles - pill shape like relationship badges
const PRIVILEGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
	SELECT: {
		bg: 'bg-sky-500/10',
		text: 'text-sky-600 dark:text-sky-400',
		border: 'border-sky-500/30',
	},
	INSERT: {
		bg: 'bg-emerald-500/10',
		text: 'text-emerald-600 dark:text-emerald-400',
		border: 'border-emerald-500/30',
	},
	UPDATE: {
		bg: 'bg-amber-500/10',
		text: 'text-amber-600 dark:text-amber-400',
		border: 'border-amber-500/30',
	},
	DELETE: {
		bg: 'bg-rose-500/10',
		text: 'text-rose-600 dark:text-rose-400',
		border: 'border-rose-500/30',
	},
};

interface PolicyCardItemProps {
	policy: DatabasePolicy;
	isDeleting: boolean;
	onEdit: () => void;
	onDelete: () => void;
}

export function PolicyCardItem({ policy, isDeleting, onEdit, onDelete }: PolicyCardItemProps) {
	const policyTypeConfig = policy.policyType ? POLICY_TYPE_UI_CONFIG[policy.policyType] : null;
	const policyTypeLabel = policyTypeConfig?.title ?? policy.policyType ?? 'Unknown';
	const roleLabel = getRoleLabel(policy.roleName ?? 'unknown');
	const privilege = policy.privilege ?? 'SELECT';
	const privilegeStyle = PRIVILEGE_STYLES[privilege] ?? PRIVILEGE_STYLES.SELECT;
	const isPermissive = policy.permissive !== false;
	const isDisabled = policy.disabled === true;

	return (
		<div
			onClick={() => !isDeleting && onEdit()}
			className={cn(
				'group relative cursor-pointer rounded-xl border p-4 transition-all duration-200',
				'border-border/60 hover:border-border/80 hover:bg-muted/30',
				isDeleting && 'pointer-events-none opacity-50',
			)}
		>
			{/* Row 1: Name + Privilege Badge + Disabled + Delete */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Shield className='text-muted-foreground h-4 w-4' />
					<p className='truncate text-sm font-semibold'>{policy.name || 'Unnamed policy'}</p>
					<span
						className={cn(
							'rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
							privilegeStyle.bg,
							privilegeStyle.text,
							privilegeStyle.border,
						)}
					>
						{privilege}
					</span>
					{isDisabled && (
						<span
							className={cn(
								'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
								'border border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
							)}
						>
							Disabled
						</span>
					)}
				</div>
				<Button
					variant='ghost'
					size='sm'
					className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 mr-2 h-8 w-8 shrink-0 p-0'
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					disabled={isDeleting}
				>
					{isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
				</Button>
			</div>

			{/* Row 2: Policy Type + Role + Mode */}
			<div className='mt-2 flex items-center gap-2'>
				<span className='text-muted-foreground text-xs'>{policyTypeLabel}</span>
				<span className='text-muted-foreground/40'>·</span>
				<span className='text-muted-foreground text-xs'>{roleLabel}</span>
				<span className='text-muted-foreground/40'>·</span>
				<span className='text-muted-foreground text-xs'>{isPermissive ? 'Permissive' : 'Restrictive'}</span>
			</div>
		</div>
	);
}
