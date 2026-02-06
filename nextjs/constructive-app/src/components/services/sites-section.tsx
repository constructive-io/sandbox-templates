import { useMemo } from 'react';
import { Globe, LayoutTemplate, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { useCardStack } from '@constructive-io/ui/stack';

import type { DatabaseApp, DatabaseSite } from '@/lib/gql/hooks/schema-builder/sites';
import {
	useDeleteSiteModuleMutation,
	useDeleteSiteMutation,
	useDeleteSiteThemeMutation,
} from '@sdk/api';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { Button } from '@constructive-io/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { TableCell, TableRow } from '@constructive-io/ui/table';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import { actionsHeader, BaseSectionProps } from './apis-section';
import { CollapsibleSection } from './collapsible-section';
import { ServiceTableView, type ServiceTableColumn } from './service-table-view';
import { ServicesSectionState } from './services-section-state';
import { SiteCard } from './site-card';

export interface SitesSectionProps extends BaseSectionProps {
	sites: DatabaseSite[];
	apps: DatabaseApp[];
	databaseId: string;
}

export function SitesSection({
	sites,
	apps,
	databaseId,
	isLoading,
	error,
	onRetry,
	isSectionLoading,
	open,
	onOpenChange,
	renderAsPanel,
}: SitesSectionProps & { renderAsPanel?: boolean }) {
	const stack = useCardStack();
	const deleteSite = useDeleteSiteMutation();
	const deleteSiteModule = useDeleteSiteModuleMutation();
	const deleteSiteTheme = useDeleteSiteThemeMutation();

	const openSiteCard = (editingSite: DatabaseSite | null) => {
		stack.push({
			id: editingSite ? `site-edit-${editingSite.id}` : 'site-create',
			title: editingSite ? 'Edit Site' : 'Create New Site',
			Component: SiteCard,
			props: {
				databaseId,
				editingSite,
				onSuccess: () => onRetry?.(),
			},
			width: CARD_WIDTHS.wide,
		});
	};

	const handleEdit = (site: DatabaseSite) => {
		openSiteCard(site);
	};

	const handleDelete = async (site: DatabaseSite) => {
		if (!site.id) return;

		try {
			if (site.modules && site.modules.length > 0) {
				for (const siteModule of site.modules) {
					await deleteSiteModule.mutateAsync({
						input: { id: siteModule.id },
					});
				}
			}

			if (site.theme) {
				await deleteSiteTheme.mutateAsync({
					input: { id: site.theme.id },
				});
			}

			await deleteSite.mutateAsync({
				input: { id: site.id },
			});

			showSuccessToast({
				message: 'Site deleted successfully',
				description: `${site.title} has been deleted.`,
			});

			onRetry?.();
		} catch (error) {
			console.error('Failed to delete site:', error);
			showErrorToast({
				message: 'Failed to delete site',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	const columns: ServiceTableColumn[] = useMemo(
		() => [
			{ label: 'Title', className: 'min-w-[180px]' },
			{ label: 'Description' },
			{ label: 'Linked App' },
			{ label: actionsHeader, className: 'w-[72px] text-right' },
		],
		[],
	);

	const sortedSites = useMemo(() => {
		return [...sites].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
	}, [sites]);

	const appsBySiteId = useMemo(() => {
		return apps.reduce<Record<string, DatabaseApp[]>>((acc, app) => {
			if (!acc[app.siteId]) {
				acc[app.siteId] = [];
			}
			acc[app.siteId].push(app);
			return acc;
		}, {});
	}, [apps]);

	const content = (
		<ServicesSectionState
				isLoading={isLoading}
				error={error}
				onRetry={onRetry}
				empty={!isSectionLoading && sortedSites.length === 0}
				emptyMessage='No sites associated with this database yet.'
			>
				<ServiceTableView columns={columns}>
					{sortedSites.map((site) => {
						const siteApps = appsBySiteId[site.id] ?? [];
						const linkedApp = siteApps.length > 0 ? siteApps[0] : null;

						return (
							<TableRow key={site.id} className='group hover:bg-muted/40 transition-colors'>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Globe className='text-primary h-3.5 w-3.5' />
										<span className='text-foreground truncate text-sm font-medium'>
											{site.title ?? 'Untitled Site'}
										</span>
									</div>
								</TableCell>
								<TableCell className='text-foreground max-w-[300px] truncate text-sm'>
									{site.description ?? '—'}
								</TableCell>
								<TableCell className='text-sm'>
									{linkedApp ? (
										<span className='text-primary truncate'>{linkedApp.name}</span>
									) : (
										<span className='text-muted-foreground'>Not linked</span>
									)}
								</TableCell>
								<TableCell className='text-right'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='icon' className='h-7 w-7' onClick={(e) => e.stopPropagation()}>
												<MoreVertical className='text-muted-foreground h-3.5 w-3.5' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													handleEdit(site);
												}}
											>
												<Pencil className='mr-2 h-4 w-4' />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												className='text-destructive hover:bg-destructive/10 focus:bg-destructive/10
													hover:text-destructive focus:text-destructive'
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(site);
												}}
											>
												<Trash2 className='mr-2 h-4 w-4' />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</ServiceTableView>
		</ServicesSectionState>
	);

	if (renderAsPanel) return content;

	return (
		<CollapsibleSection
			title='Sites'
			count={sites.length}
			icon={<LayoutTemplate className='text-muted-foreground h-4 w-4' />}
			open={open}
			onOpenChange={onOpenChange}
			actionLabel='New Site'
			onAction={() => openSiteCard(null)}
		>
			{content}
		</CollapsibleSection>
	);
}
