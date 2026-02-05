import { useMemo, useState } from 'react';
import { Lock, MoreVertical, Pencil, Server as ServerIcon, Trash2, Unlock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useCardStack } from '@constructive-io/ui/stack';

import { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { apiQueryKeys } from '@/lib/gql/hooks/schema-builder/apis/use-apis';
import { useDeleteApiMutation } from '@sdk/app-public';
import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
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

import { ApiCard } from './api-card';
import { CollapsibleSection } from './collapsible-section';
import { ServiceTableView, type ServiceTableColumn } from './service-table-view';
import { ServicesSectionState } from './services-section-state';
import type { DomainItem } from './services.utils';

export const actionsHeader = <span className='sr-only'>Actions</span>;

export interface BaseSectionProps {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isSectionLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, renders content without the CollapsibleSection wrapper (for tabbed layout) */
  renderAsPanel?: boolean;
}

export interface ApisSectionProps extends BaseSectionProps {
  services: DatabaseService[];
  totalCount: number;
  domains: DomainItem[];
  schemas: DatabaseSchema[];
  databaseId: string;
}

export function ApisSection({
  services,
  totalCount,
  domains,
  schemas,
  databaseId,
  isLoading,
  error,
  onRetry,
  isSectionLoading,
  open,
  onOpenChange,
  renderAsPanel,
}: ApisSectionProps) {
  const stack = useCardStack();
  const queryClient = useQueryClient();
  const deleteApi = useDeleteApiMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.byDatabase(databaseId) });
    },
  });

  const openApiCard = (editingApi: DatabaseService | null) => {
    stack.push({
      id: editingApi ? `api-edit-${editingApi.id}` : 'api-create',
      title: editingApi ? 'Edit API' : 'Create New API',
      Component: ApiCard,
      props: {
        databaseId,
        domains,
        schemas,
        editingApi,
        onSuccess: () => onRetry?.(),
      },
      width: CARD_WIDTHS.wide,
    });
  };

  const handleEdit = (api: DatabaseService) => {
    openApiCard(api);
  };

  const handleDelete = async (api: DatabaseService) => {
    if (!api.id) return;

    try {
      await deleteApi.mutateAsync({
        input: { id: api.id },
      });

      showSuccessToast({
        message: 'API deleted successfully',
        description: `${api.name} has been deleted.`,
      });

      onRetry?.();
    } catch (error) {
      console.error('Failed to delete API:', error);
      showErrorToast({
        message: 'Failed to delete API',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const columns: ServiceTableColumn[] = useMemo(
    () => [
      { label: 'Name', className: 'min-w-[200px]' },
      { label: 'Role Name' },
      { label: 'Anon Role' },
      { label: 'Access' },
      { label: 'Linked Schemas' },
      { label: actionsHeader, className: 'w-[72px] text-right' },
    ],
    [],
  );

  const content = (
    <ServicesSectionState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      empty={!isSectionLoading && services.length === 0}
      emptyMessage='No APIs have been created for this database yet.'
    >
      <ServiceTableView columns={columns}>
        {services.map((service) => (
          <TableRow key={service.id} className='group hover:bg-muted/40 transition-colors'>
            <TableCell>
              <div className='flex items-center gap-2'>
                <ServerIcon className='text-primary h-3.5 w-3.5' />
                <span className='text-foreground truncate text-sm font-medium'>{service.name}</span>
              </div>
            </TableCell>
            <TableCell className='text-foreground truncate text-sm'>{service.roleName ?? '—'}</TableCell>
            <TableCell className='text-muted-foreground truncate text-sm'>{service.anonRole ?? '—'}</TableCell>
            <TableCell>
              {service.isPublic ? (
                <Badge variant='secondary' className='h-5 gap-1 px-2 text-xs'>
                  <Unlock className='h-3 w-3' />
                  Public
                </Badge>
              ) : (
                <Badge variant='outline' className='h-5 gap-1 px-2 text-xs'>
                  <Lock className='h-3 w-3' />
                  Private
                </Badge>
              )}
            </TableCell>
            <TableCell className='text-muted-foreground text-sm'>
              {service.apiSchemas?.totalCount ?? 0} schemas
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
                      handleEdit(service);
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
                      handleDelete(service);
                    }}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </ServiceTableView>
    </ServicesSectionState>
  );

  if (renderAsPanel) return content;

  return (
    <CollapsibleSection
      title='APIs'
      count={totalCount}
      icon={<ServerIcon className='text-muted-foreground h-4 w-4' />}
      open={open}
      onOpenChange={onOpenChange}
      actionLabel='New API'
      onAction={() => openApiCard(null)}
    >
      {content}
    </CollapsibleSection>
  );
}
