'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@constructive-io/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { Switch } from '@constructive-io/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { RiShieldCheckLine } from '@remixicon/react';
import { AlertTriangle, ArrowRight, CheckCircle, ChevronDown, LockKeyhole, ShieldOff, Table2 } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useDatabasePolicies } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';
import { usePermissions } from '@/lib/gql/hooks/schema-builder/policies/use-permissions';
import { useEntityParams } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { usePolicyFilters } from '@/store/app-store';

import { isSystemTable } from '../policies/policies.utils';
import { PermissionsPanel } from './permissions-panel';
import { SecurityStats } from './security-stats';

// Operation definitions with colors
const OPERATIONS = ['INSERT', 'SELECT', 'UPDATE', 'DELETE'] as const;
type Operation = (typeof OPERATIONS)[number];

const OPERATION_COLORS: Record<Operation, { active: string; label: string }> = {
	SELECT: { active: 'bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/30', label: 'R' },
	INSERT: { active: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30', label: 'C' },
	UPDATE: { active: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30', label: 'U' },
	DELETE: { active: 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30', label: 'D' },
};

// Get covered operations from policies
function getCoveredOperations(policies: { privilege: string | null; disabled: boolean | null }[]): Set<Operation> {
	const covered = new Set<Operation>();
	policies
		.filter((p) => !p.disabled)
		.forEach((p) => {
			if (p.privilege === 'ALL') {
				OPERATIONS.forEach((op) => covered.add(op));
			} else if (p.privilege && OPERATIONS.includes(p.privilege as Operation)) {
				covered.add(p.privilege as Operation);
			}
		});
	return covered;
}

// Status types
type StatusKey = 'all-configured' | 'needs-review' | 'no-protection';

const STATUS_OPTIONS: { key: StatusKey; text: string; iconColor: string; bgColor: string; icon: typeof CheckCircle }[] =
	[
		{
			key: 'all-configured',
			text: 'All Configured',
			iconColor: 'text-emerald-600',
			bgColor: 'bg-emerald-500/10',
			icon: CheckCircle,
		},
		{
			key: 'needs-review',
			text: 'Needs Review',
			iconColor: 'text-amber-600',
			bgColor: 'bg-amber-500/10',
			icon: AlertTriangle,
		},
		{
			key: 'no-protection',
			text: 'No Protection',
			iconColor: 'text-rose-500',
			bgColor: 'bg-rose-500/10',
			icon: ShieldOff,
		},
	];

// Get status info based on coverage
function getStatusInfo(coveredCount: number): {
	key: StatusKey;
	text: string;
	iconColor: string;
	icon: typeof CheckCircle;
} {
	if (coveredCount === 4) return STATUS_OPTIONS[0];
	if (coveredCount > 0) return STATUS_OPTIONS[1];
	return STATUS_OPTIONS[2];
}

export function SecurityRoute() {
	const router = useRouter();
	const { orgId, databaseId: urlDatabaseId } = useEntityParams();

	const { currentDatabase } = useSchemaBuilderSelectors();
	const { showSystemTables, setShowSystemTables } = usePolicyFilters();
	const [statusFilter, setStatusFilter] = useState<StatusKey | null>(null);
	const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

	const databaseId = currentDatabase?.databaseId ?? '';
	const hasDatabase = Boolean(databaseId);

	const { data: permissionsData, isLoading: isPermissionsLoading, refetch: refetchPermissions } = usePermissions();

	const {
		data: tablesData = [],
		isLoading: isPoliciesLoading,
		error: policiesError,
	} = useDatabasePolicies(databaseId, { enabled: hasDatabase });

	// Compute stats and filter tables
	const { tablesProtected, totalTables, activePoliciesCount, filteredTables } = useMemo(() => {
		const systemFiltered = tablesData.filter((table) => showSystemTables || !isSystemTable(table.category));

		let protected_ = 0;
		let active = 0;

		systemFiltered.forEach((table) => {
			const activePolicies = table.policies.filter((p) => !p.disabled);
			if (activePolicies.length > 0) {
				protected_++;
			}
			active += activePolicies.length;
		});

		// Apply status filter
		const statusFiltered = statusFilter
			? systemFiltered.filter((table) => {
					const coveredOps = getCoveredOperations(table.policies);
					const status = getStatusInfo(coveredOps.size);
					return status.key === statusFilter;
				})
			: systemFiltered;

		return {
			tablesProtected: protected_,
			totalTables: systemFiltered.length,
			activePoliciesCount: active,
			filteredTables: statusFiltered,
		};
	}, [tablesData, showSystemTables, statusFilter]);

	const appPermissionsCount = permissionsData?.appPermissions?.length ?? 0;
	const membershipPermissionsCount = permissionsData?.membershipPermissions?.length ?? 0;
	const totalPermissions = appPermissionsCount + membershipPermissionsCount;

	const handleEditTable = (tableName: string) => {
		router.push(`/orgs/${orgId}/databases/${urlDatabaseId}/schemas?table=${tableName}&tab=security`);
	};

	const activeFilterOption = statusFilter ? STATUS_OPTIONS.find((o) => o.key === statusFilter) : null;

	return (
		<div className='from-background via-background to-muted/20 flex h-full flex-col overflow-y-auto bg-linear-to-br'>
			{/* Fixed header section */}
			<div className='shrink-0 px-4 pt-6 md:px-6 lg:px-8'>
				<div className='mx-auto max-w-350'>
					<div className='space-y-2'>
						<h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>Security</h1>
						<p className='text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base'>
							Manage data access rules and app capabilities.
						</p>
					</div>
				</div>
			</div>

			{/* Stats section */}
			<div className='mb-6 shrink-0 px-4 pt-6 md:px-6 lg:px-8'>
				<div className='mx-auto max-w-350'>
					<SecurityStats
						tablesProtected={tablesProtected}
						totalTables={totalTables}
						activePolicies={activePoliciesCount}
						totalPermissions={totalPermissions}
					/>
				</div>
			</div>

			{/* Two-column content area */}
			<div className='flex flex-1 flex-col px-4 pt-6 pb-6 md:px-6 lg:px-8'>
				<div className='mx-auto flex w-full max-w-350 flex-1 flex-col gap-8 xl:flex-row'>
					{/* Tables column */}
					<div className='order-2 flex flex-1 flex-col xl:order-1 xl:basis-2/3'>
						<div className='flex shrink-0 items-center justify-between pb-4'>
							<div className='flex items-center gap-2'>
								<LockKeyhole className='h-5 w-5 text-sky-500' />
								<h2 className='text-foreground text-base font-semibold'>Tables with RLS</h2>
								<span className='text-muted-foreground text-sm'>Click to edit policies</span>
							</div>
							<label className='flex items-center gap-2 text-sm'>
								<Switch checked={showSystemTables} onCheckedChange={setShowSystemTables} />
								<span className='text-muted-foreground'>System tables</span>
							</label>
						</div>

						{/* Content */}
						<div>
							{!hasDatabase ? (
								<div
									className='border-border/60 text-muted-foreground bg-card flex flex-col items-center justify-center
										rounded-xl border border-dashed py-16 text-center'
								>
									<p className='text-sm'>Select a database to view its security settings.</p>
								</div>
							) : isPoliciesLoading ? (
								<div className='flex items-center justify-center py-16'>
									<p className='text-muted-foreground text-sm'>Loading tables...</p>
								</div>
							) : policiesError ? (
								<div className='border-destructive/50 bg-destructive/10 rounded-xl border p-6'>
									<p className='text-destructive text-sm'>
										Failed to load tables: {policiesError instanceof Error ? policiesError.message : 'Unknown error'}
									</p>
								</div>
							) : filteredTables.length === 0 ? (
								<div
									className='border-border/60 text-muted-foreground bg-card flex flex-col items-center justify-center
										rounded-xl border border-dashed py-16 text-center'
								>
									<p className='text-sm'>No tables found.</p>
								</div>
							) : (
								<div className='border-border/60 overflow-x-auto rounded-xl border'>
									<table className='w-full min-w-[640px]'>
										<thead className='bg-muted/50'>
											<tr>
												<th
													className='text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider
														uppercase'
												>
													Table
												</th>
												<th
													className='text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider
														uppercase'
												>
													Policies
												</th>
												<th
													className='text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider
														uppercase'
												>
													Coverage
												</th>
												<th className='px-4 py-3 text-center text-xs font-medium tracking-wider uppercase'>
													<Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
														<PopoverTrigger asChild>
															<button
																className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
															>
																{activeFilterOption ? (
																	<>
																		<activeFilterOption.icon
																			className={cn('h-3.5 w-3.5', activeFilterOption.iconColor)}
																		/>
																		<span className='normal-case'>{activeFilterOption.text}</span>
																	</>
																) : (
																	<span className='uppercase'>Status</span>
																)}
																<ChevronDown className='h-3 w-3' />
															</button>
														</PopoverTrigger>
														<PopoverContent align='end' className='w-48 p-2'>
															<div className='flex flex-col gap-1'>
																{STATUS_OPTIONS.map((option) => {
																	const Icon = option.icon;
																	const isActive = statusFilter === option.key;
																	return (
																		<button
																			key={option.key}
																			className={cn(
																				'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left',
																				isActive ? 'bg-muted' : 'hover:bg-muted/50',
																			)}
																			onClick={() => {
																				setStatusFilter(option.key);
																				setStatusPopoverOpen(false);
																			}}
																		>
																			<Icon className={cn('h-3.5 w-3.5', option.iconColor)} />
																			<span className='text-sm'>{option.text}</span>
																		</button>
																	);
																})}
															</div>
															{statusFilter && (
																<button
																	className='text-muted-foreground hover:text-foreground mt-2 w-full border-t pt-2
																		text-xs'
																	onClick={() => {
																		setStatusFilter(null);
																		setStatusPopoverOpen(false);
																	}}
																>
																	Clear filter
																</button>
															)}
														</PopoverContent>
													</Popover>
												</th>
												<th
													className='text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider
														uppercase'
												>
													Action
												</th>
											</tr>
										</thead>
										<tbody className='divide-border/60 divide-y'>
											{filteredTables.map((table) => {
												const activePolicies = table.policies.filter((p) => !p.disabled);
												const isSystem = isSystemTable(table.category);
												const coveredOps = getCoveredOperations(table.policies);
												const statusInfo = getStatusInfo(coveredOps.size);
												const StatusIcon = statusInfo.icon;

												return (
													<tr
														key={table.id}
														className='hover:bg-muted/30 cursor-pointer transition-colors'
														onClick={() => handleEditTable(table.name)}
													>
														<td className='px-4 py-3'>
															<div className='flex items-center gap-2'>
																<Table2 className='text-muted-foreground h-4 w-4' />
																<span className='text-sm font-medium'>{table.name}</span>
																{isSystem && (
																	<span className='text-muted-foreground/60 text-[10px] uppercase'>system</span>
																)}
															</div>
														</td>
														<td className='px-4 py-3'>
															<span className='text-sm'>
																{activePolicies.length} active
																{table.policies.length > activePolicies.length && (
																	<span className='text-muted-foreground'> / {table.policies.length} total</span>
																)}
															</span>
														</td>
														<td className='px-4 py-3'>
															<div className='flex gap-1'>
																{OPERATIONS.map((op) => (
																	<span
																		key={op}
																		className={cn(
																			'flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold',
																			coveredOps.has(op)
																				? OPERATION_COLORS[op].active
																				: 'bg-muted/50 text-muted-foreground/40',
																		)}
																		title={op}
																	>
																		{OPERATION_COLORS[op].label}
																	</span>
																))}
															</div>
														</td>
														<td className='px-4 py-3'>
															<div className='flex justify-center'>
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<span className='cursor-default'>
																				<StatusIcon className={cn('h-4 w-4', statusInfo.iconColor)} />
																			</span>
																		</TooltipTrigger>
																		<TooltipContent>
																			<p>{statusInfo.text}</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															</div>
														</td>
														<td className='px-4 py-3 text-right'>
															<Button
																variant='ghost'
																size='sm'
																className='text-muted-foreground hover:text-foreground'
																onClick={(e) => {
																	e.stopPropagation();
																	handleEditTable(table.name);
																}}
															>
																Edit
																<ArrowRight className='ml-1 h-3 w-3' />
															</Button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
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
		</div>
	);
}
