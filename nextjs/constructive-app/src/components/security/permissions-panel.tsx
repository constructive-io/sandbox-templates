'use client';

import { useMemo, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Card, CardContent, CardHeader } from '@constructive-io/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@constructive-io/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { useCardStack } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { RiAddLine } from '@remixicon/react';
import { ChevronDown, MoreVertical, Pencil, Shield, Trash2, Users } from 'lucide-react';

import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';
import {
	useDeleteAppPermissionMutation,
	useDeleteOrgPermissionMutation,
} from '@sdk/admin';

import { PermissionCard } from '../permissions/permission-card';
import { PermissionItem, PermissionType } from '../permissions/permissions.types';

interface PermissionsPanelProps {
	permissionsData?: {
		appPermissions?: Array<{ id?: string | null; name?: string | null; description?: string | null }>;
		membershipPermissions?: Array<{ id?: string | null; name?: string | null; description?: string | null }>;
	};
	isLoading: boolean;
	onRefetch: () => void;
}

export function PermissionsPanel({ permissionsData, isLoading, onRefetch }: PermissionsPanelProps) {
	const stack = useCardStack();
	const [appExpanded, setAppExpanded] = useState(true);
	const [membershipExpanded, setMembershipExpanded] = useState(true);

	const deleteAppPermission = useDeleteAppPermissionMutation();
	const deleteMembershipPermission = useDeleteOrgPermissionMutation();

	const appPermissions: PermissionItem[] = useMemo(() => {
		return (permissionsData?.appPermissions ?? [])
			.filter((p): p is typeof p & { id: string; name: string } => Boolean(p.id && p.name))
			.map((p) => ({ id: p.id, name: p.name, description: p.description }));
	}, [permissionsData?.appPermissions]);

	const membershipPermissions: PermissionItem[] = useMemo(() => {
		return (permissionsData?.membershipPermissions ?? [])
			.filter((p): p is typeof p & { id: string; name: string } => Boolean(p.id && p.name))
			.map((p) => ({ id: p.id, name: p.name, description: p.description }));
	}, [permissionsData?.membershipPermissions]);

	const handleOpenCard = (type: PermissionType, permission?: PermissionItem) => {
		const isEditMode = !!permission;
		const typeLabel = type === 'app' ? 'App' : 'Membership';
		stack.push({
			id: permission ? `permission-edit-${permission.id}` : `permission-create-${type}`,
			title: isEditMode ? `Edit ${typeLabel} Permission` : `Create ${typeLabel} Permission`,
			description: isEditMode
				? `Update the ${typeLabel.toLowerCase()} permission details.`
				: `Add a new ${typeLabel.toLowerCase()} permission.`,
			Component: PermissionCard,
			props: {
				type,
				editingPermission: permission ?? null,
				onSuccess: onRefetch,
			},
			width: CARD_WIDTHS.medium,
		});
	};

	const handleDeleteApp = async (permission: PermissionItem) => {
		try {
			await deleteAppPermission.mutateAsync({ input: { id: permission.id } });
			showSuccessToast({
				message: 'App permission deleted',
				description: `"${permission.name}" has been deleted.`,
			});
			onRefetch();
		} catch (err) {
			showErrorToast({
				message: 'Failed to delete app permission',
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

	const handleDeleteMembership = async (permission: PermissionItem) => {
		try {
			await deleteMembershipPermission.mutateAsync({ input: { id: permission.id } });
			showSuccessToast({
				message: 'Membership permission deleted',
				description: `"${permission.name}" has been deleted.`,
			});
			onRefetch();
		} catch (err) {
			showErrorToast({
				message: 'Failed to delete membership permission',
				description: err instanceof Error ? err.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='space-y-5'>
			<Collapsible open={appExpanded} onOpenChange={setAppExpanded}>
				<Card className='gap-3 py-3 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between px-4'>
						<CollapsibleTrigger className='flex flex-1 cursor-pointer items-center justify-start gap-2'>
							<ChevronDown
								className={cn(
									'text-muted-foreground h-4 w-4 transition-transform duration-200',
									!appExpanded && '-rotate-90',
								)}
							/>
							<Shield className='h-4 w-4 rotate-0! text-sky-500' />
							<span className='text-sm font-semibold'>App Permissions</span>
							<span className='text-muted-foreground text-sm'>{appPermissions.length}</span>
						</CollapsibleTrigger>
						<Button
							variant='ghost'
							size='sm'
							className='h-7 gap-1 text-xs text-sky-500 hover:text-sky-600'
							onClick={() => handleOpenCard('app')}
						>
							<RiAddLine className='h-3.5 w-3.5' />
							Add
						</Button>
					</CardHeader>
					<CollapsibleContent innerClassName='pb-0'>
						<CardContent className='px-4'>
							{isLoading ? (
								<p className='text-muted-foreground py-2 text-xs'>Loading...</p>
							) : appPermissions.length === 0 ? (
								<p className='text-muted-foreground py-2 text-xs'>No app permissions defined.</p>
							) : (
								<div className='divide-y'>
									{appPermissions.map((permission) => (
										<PermissionRow
											key={permission.id}
											permission={permission}
											icon={<Shield className='h-4 w-4 text-sky-500' />}
											onEdit={() => handleOpenCard('app', permission)}
											onDelete={() => handleDeleteApp(permission)}
										/>
									))}
								</div>
							)}
						</CardContent>
					</CollapsibleContent>
				</Card>
			</Collapsible>

			<Collapsible open={membershipExpanded} onOpenChange={setMembershipExpanded}>
				<Card className='gap-3 py-3 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between px-4'>
						<CollapsibleTrigger className='flex flex-1 cursor-pointer items-center justify-start gap-2'>
							<ChevronDown
								className={cn(
									'text-muted-foreground h-4 w-4 transition-transform duration-200',
									!membershipExpanded && '-rotate-90',
								)}
							/>
							<Users className='h-4 w-4 rotate-0! text-amber-500' />
							<span className='text-sm font-semibold'>Membership Permissions</span>
							<span className='text-muted-foreground text-sm'>{membershipPermissions.length}</span>
						</CollapsibleTrigger>
						<Button
							variant='ghost'
							size='sm'
							className='h-7 gap-1 text-xs text-sky-500 hover:text-sky-600'
							onClick={() => handleOpenCard('membership')}
						>
							<RiAddLine className='h-3.5 w-3.5' />
							Add
						</Button>
					</CardHeader>
					<CollapsibleContent innerClassName='pb-0'>
						<CardContent className='px-4'>
							{isLoading ? (
								<p className='text-muted-foreground py-2 text-xs'>Loading...</p>
							) : membershipPermissions.length === 0 ? (
								<p className='text-muted-foreground py-2 text-xs'>No membership permissions defined.</p>
							) : (
								<div className='divide-y'>
									{membershipPermissions.map((permission) => (
										<PermissionRow
											key={permission.id}
											permission={permission}
											icon={<Users className='h-4 w-4 text-amber-500' />}
											onEdit={() => handleOpenCard('membership', permission)}
											onDelete={() => handleDeleteMembership(permission)}
										/>
									))}
								</div>
							)}
						</CardContent>
					</CollapsibleContent>
				</Card>
			</Collapsible>
		</div>
	);
}

interface PermissionRowProps {
	permission: PermissionItem;
	icon: React.ReactNode;
	onEdit: () => void;
	onDelete: () => void;
}

function PermissionRow({ permission, icon, onEdit, onDelete }: PermissionRowProps) {
	return (
		<div className='hover:bg-muted/40 group flex items-center justify-between px-1 py-3 transition-colors'>
			<div className='flex min-w-0 flex-1 items-center gap-3'>
				{icon}
				<div className='min-w-0 flex-1'>
					<p className='text-foreground text-sm font-medium'>{permission.name}</p>
					{permission.description && <p className='text-muted-foreground text-xs'>{permission.description}</p>}
				</div>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='icon' className='h-6 w-6 shrink-0' onClick={(e) => e.stopPropagation()}>
						<MoreVertical className='text-muted-foreground h-3.5 w-3.5' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuItem onClick={onEdit}>
						<Pencil className='mr-2 h-4 w-4' />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className='text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive
							focus:text-destructive'
						onClick={onDelete}
					>
						<Trash2 className='mr-2 h-4 w-4' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
