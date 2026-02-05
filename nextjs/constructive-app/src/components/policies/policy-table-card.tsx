import { RiAddLine, RiShieldCheckLine, RiTableLine } from '@remixicon/react';
import { Pencil, Trash2 } from 'lucide-react';

import type { DatabasePolicy } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { cn } from '@/lib/utils';
import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@constructive-io/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@constructive-io/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@constructive-io/ui/tooltip';

import type { Policy, PolicyTable } from './policies.types';
import { getPrivilegeLabel, getRoleLabel } from './policies.utils';
import { getPolicyTypeLabel } from './template-schema';

type PolicyTableCardProps = {
	table: PolicyTable;
	showRlsBadge?: boolean;
	onCreatePolicy?: (tableId: string) => void;
	onEditPolicy?: (policy: DatabasePolicy, tableId: string) => void;
	onDeletePolicy?: (policy: DatabasePolicy, tableId: string) => void;
};

export function PolicyTableCard({
	table,
	showRlsBadge = false,
	onCreatePolicy,
	onEditPolicy,
	onDeletePolicy,
}: PolicyTableCardProps) {
	const hasPolicies = table.policies.length > 0;
	const activePoliciesCount = table.policies.filter((p) => p.status === 'active').length;

	return (
		<Card className='shadow-none'>
			<CardHeader className='flex flex-col items-start justify-between gap-4 pb-2 sm:flex-row sm:items-center'>
				<div className='flex items-center gap-4'>
					<div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg'>
						<RiTableLine className='size-5' />
					</div>
					<div className='space-y-1'>
						<div className='flex items-center gap-2'>
							<CardTitle className='text-base font-bold'>{table.name}</CardTitle>
							{showRlsBadge && (
								<Badge
									variant={table.useRls ? 'default' : 'secondary'}
									className={cn('text-[10px] font-semibold', table.useRls && 'text-background')}
								>
									RLS {table.useRls ? 'ON' : 'OFF'}
								</Badge>
							)}
						</div>
						{hasPolicies ? (
							<p className='text-muted-foreground text-xs'>
								{activePoliciesCount} active {activePoliciesCount === 1 ? 'policy' : 'policies'}
							</p>
						) : (
							<p className='text-muted-foreground text-xs'>No policies yet</p>
						)}
					</div>
				</div>
				<Button
					variant='outline'
					size='sm'
					className='rounded-lg text-xs font-medium'
					onClick={() => onCreatePolicy?.(table.id)}
				>
					<RiAddLine className='size-4' />
					<span className='font-medium'>New policy</span>
				</Button>
			</CardHeader>
			<CardContent className='border-border/60 border-t p-0'>
				{hasPolicies ? (
					<div className='w-full overflow-x-auto'>
						<Table className='min-w-[800px]'>
							<TableHeader>
								<TableRow className='bg-muted/30 hover:bg-muted/30'>
									<TableHead className='w-[20%] pl-7 text-xs font-semibold'>POLICY NAME</TableHead>
									<TableHead className='w-[20%] text-xs font-semibold'>TYPE</TableHead>
									<TableHead className='w-[15%] text-xs font-semibold'>TARGET ROLE</TableHead>
									<TableHead className='w-[12%] text-xs font-semibold'>PRIVILEGE</TableHead>
									<TableHead className='w-[13%] text-xs font-semibold'>STATUS</TableHead>
									<TableHead className='w-[10%] pr-6 text-right text-xs font-semibold'>ACTIONS</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{table.policies.map((policy) => (
									<PolicyTableRow
										key={policy.id}
										policy={policy}
										tableId={table.id}
										onEditPolicy={onEditPolicy}
										onDeletePolicy={onDeletePolicy}
									/>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className='text-muted-foreground flex flex-col items-center justify-center gap-3 px-8 py-10 text-center'>
						<div
							className='bg-muted/20 text-muted-foreground/70 border-border/40 flex size-14 items-center justify-center
								rounded-full border-2 border-dashed shadow-sm'
						>
							<RiShieldCheckLine className='size-6' />
						</div>
						<div className='space-y-1.5'>
							<p className='text-foreground text-sm font-semibold'>No policies yet for this table</p>
							<p className='text-muted-foreground max-w-xs text-xs leading-relaxed'>
								Create a policy to control row-level access for roles.
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

type PolicyTableRowProps = {
	policy: Policy & { rawPolicy?: DatabasePolicy };
	tableId: string;
	onEditPolicy?: (policy: DatabasePolicy, tableId: string) => void;
	onDeletePolicy?: (policy: DatabasePolicy, tableId: string) => void;
};

function PolicyTableRow({ policy, tableId, onEditPolicy, onDeletePolicy }: PolicyTableRowProps) {
	return (
		<TableRow className='hover:bg-muted/40 transition-colors'>
			<TableCell className='pl-7 font-semibold'>{policy.name}</TableCell>
			<TableCell>
				{policy.policyType ? (
					<span className='bg-muted/80 text-foreground rounded-lg px-2 py-1 text-xs font-medium'>
						{getPolicyTypeLabel(
							policy.policyType,
							(policy.rawPolicy?.data as Record<string, unknown> | null | undefined) ?? null,
						)}
					</span>
				) : (
					<span className='text-muted-foreground text-xs'>—</span>
				)}
			</TableCell>
			<TableCell>
				<span className='bg-muted/80 text-foreground rounded-lg px-2 py-1 text-xs font-medium'>
					{getRoleLabel(policy.targetRole)}
				</span>
			</TableCell>
			<TableCell>
				<span className='bg-muted/80 text-foreground rounded-lg px-2 py-1 text-xs font-medium'>
					{getPrivilegeLabel(policy.privilege)}
				</span>
			</TableCell>
			<TableCell>
				<Badge
					variant={policy.status === 'active' ? 'default' : 'secondary'}
					className={cn(
						'flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
						policy.status === 'active'
							? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
							: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
					)}
				>
					<span
						className={cn(
							'inline-block size-1.5 rounded-full',
							policy.status === 'active' ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-600 dark:bg-gray-400',
						)}
					/>
					<span className='capitalize'>{policy.status}</span>
				</Badge>
			</TableCell>
			<TableCell className='pr-6 text-right'>
				<TooltipProvider>
					<div className='flex items-center justify-end gap-1'>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									aria-label='Edit policy'
									className='text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg'
									onClick={() => policy.rawPolicy && onEditPolicy?.(policy.rawPolicy, tableId)}
								>
									<Pencil className='h-4 w-4' />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Edit policy</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									aria-label='Delete policy'
									className='text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg'
									onClick={() => policy.rawPolicy && onDeletePolicy?.(policy.rawPolicy, tableId)}
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Delete policy</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}
