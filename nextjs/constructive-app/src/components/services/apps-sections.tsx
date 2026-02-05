import { useMemo } from 'react';
import { MoreVertical, Pencil, Smartphone, Trash2 } from 'lucide-react';

import { useCardStack } from '@constructive-io/ui/stack';

import type { DatabaseApp, DatabaseSite } from '@/lib/gql/hooks/schema-builder/sites';
import { useDeleteAppMutation } from '@sdk/app-public';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { Badge } from '@constructive-io/ui/badge';
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
import { AppCard } from './app-card';
import { CollapsibleSection } from './collapsible-section';
import { ServiceTableView, type ServiceTableColumn } from './service-table-view';
import { ServicesSectionState } from './services-section-state';
import { formatAppPlatform } from './services.utils';

export interface AppsSectionProps extends BaseSectionProps {
  apps: DatabaseApp[];
  sites: DatabaseSite[];
  databaseId: string;
}

export function AppsSection({
  apps,
  sites,
  databaseId,
  isLoading,
  error,
  onRetry,
  isSectionLoading,
  open,
  onOpenChange,
  renderAsPanel,
}: AppsSectionProps & { renderAsPanel?: boolean }) {
  const stack = useCardStack();
  const deleteApp = useDeleteAppMutation();

  const openAppCard = (editingApp: DatabaseApp | null) => {
    stack.push({
      id: editingApp ? `app-edit-${editingApp.id}` : 'app-create',
      title: editingApp ? 'Edit App' : 'Create New App',
      Component: AppCard,
      props: {
        databaseId,
        sites,
        editingApp,
        onSuccess: () => onRetry?.(),
      },
      width: CARD_WIDTHS.medium,
    });
  };

  const handleEdit = (app: DatabaseApp) => {
    openAppCard(app);
  };

  const handleDelete = async (app: DatabaseApp) => {
    if (!app.id) return;

    try {
      await deleteApp.mutateAsync({
        input: { id: app.id },
      });

      showSuccessToast({
        message: 'App deleted successfully',
        description: `${app.name} has been deleted.`,
      });

      onRetry?.();
    } catch (error) {
      console.error('Failed to delete app:', error);
      showErrorToast({
        message: 'Failed to delete app',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const columns: ServiceTableColumn[] = useMemo(
    () => [
      { label: 'Name', className: 'min-w-[180px]' },
      { label: 'Site' },
      { label: 'Store ID' },
      { label: 'Platform' },
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
        emptyMessage='No sites or apps associated with this database yet.'
      >
        <ServiceTableView columns={columns}>
          {sortedSites.flatMap((site) => {
            const siteApps = appsBySiteId[site.id] ?? [];
            return siteApps.map((app) => (
              <TableRow key={app.id} className='group hover:bg-muted/40 transition-colors'>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Smartphone className='text-primary h-3.5 w-3.5' />
                    <span className='text-foreground truncate text-sm font-medium'>{app.name}</span>
                  </div>
                </TableCell>
                <TableCell className='text-foreground truncate text-sm'>{site.title ?? '—'}</TableCell>
                <TableCell className='text-muted-foreground truncate font-mono text-xs'>
                  {app.appStoreId ?? app.playStoreLink ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant='secondary' className='h-5 px-2 text-xs'>
                    {formatAppPlatform(app)}
                  </Badge>
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
                          handleEdit(app);
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
                          handleDelete(app);
                        }}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ));
          })}
        </ServiceTableView>
    </ServicesSectionState>
  );

  if (renderAsPanel) return content;

  return (
    <CollapsibleSection
      title='Apps'
      count={apps.length}
      icon={<Smartphone className='text-muted-foreground h-4 w-4' />}
      open={open}
      onOpenChange={onOpenChange}
      actionLabel='New App'
      onAction={() => openAppCard(null)}
    >
      {content}
    </CollapsibleSection>
  );
}
