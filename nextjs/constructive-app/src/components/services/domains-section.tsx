import { useMemo } from 'react';
import { Copy as CopyIcon, ExternalLink, Globe, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { useCardStack } from '@constructive-io/ui/stack';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import {
	invalidate,
	useDeleteDomainMutation,
} from '@sdk/app-public';
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
import { DomainCard } from './domain-card';
import { ServiceTableView, type ServiceTableColumn } from './service-table-view';
import { ServicesSectionState } from './services-section-state';
import { buildDomainHref, buildDomainLabel, type DomainItem } from './services.utils';

export interface DomainsSectionProps extends BaseSectionProps {
  domains: DomainItem[];
  services: DatabaseService[];
  databaseId: string;
}

export function DomainsSection({
  domains,
  services,
  databaseId,
  isLoading,
  error,
  onRetry,
  isSectionLoading,
  open,
  onOpenChange,
  renderAsPanel,
}: DomainsSectionProps & { renderAsPanel?: boolean }) {
  const stack = useCardStack();
  const queryClient = useQueryClient();
  const deleteDomain = useDeleteDomainMutation({
    onSuccess: () => invalidate.domain.lists(queryClient),
  });

  const openDomainCard = (editingDomain: DomainItem | null) => {
    stack.push({
      id: editingDomain ? `domain-edit-${editingDomain.id}` : 'domain-create',
      title: editingDomain ? 'Edit Domain' : 'Create New Domain',
      Component: DomainCard,
      props: {
        databaseId,
        services,
        editingDomain,
        onSuccess: () => onRetry?.(),
      },
      width: CARD_WIDTHS.medium,
    });
  };

  const handleEdit = (domain: DomainItem) => {
    openDomainCard(domain);
  };

  const handleDelete = async (domain: DomainItem) => {
    if (!domain.id) return;

    try {
      await deleteDomain.mutateAsync({
        input: { id: domain.id },
      });

      showSuccessToast({
        message: 'Domain deleted successfully',
        description: `${buildDomainLabel(domain)} has been deleted.`,
      });

      onRetry?.();
    } catch (error) {
      console.error('Failed to delete domain:', error);
      showErrorToast({
        message: 'Failed to delete domain',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const columns: ServiceTableColumn[] = useMemo(
    () => [
      { label: 'Domain', className: 'min-w-[220px]' },
      { label: 'Subdomain' },
      { label: 'Linked API' },
      { label: actionsHeader, className: 'w-[72px] text-right' },
    ],
    [],
  );

  const sortedDomains = useMemo(() => {
    return [...domains].sort((a, b) => buildDomainLabel(a).localeCompare(buildDomainLabel(b)));
  }, [domains]);

  const servicesById = useMemo(() => {
    return services.reduce<Record<string, DatabaseService>>((acc, service) => {
      acc[service.id] = service;
      return acc;
    }, {});
  }, [services]);

  const content = (
    <ServicesSectionState
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        empty={!isSectionLoading && sortedDomains.length === 0}
        emptyMessage='No domains linked to this database yet.'
      >
        <ServiceTableView columns={columns}>
          {sortedDomains.map((domain) => {
            const api = domain.apiId ? servicesById[domain.apiId] : null;
            const baseDomainHref = buildDomainHref(domain.domain, domain.subdomain);
            const graphqlUrl = baseDomainHref ? `${baseDomainHref}/graphql` : null;
            const graphiqlUrl = baseDomainHref ? `${baseDomainHref}/graphiql` : null;

            return (
              <TableRow
                key={`${domain.domain ?? 'domain'}-${domain.subdomain ?? 'subdomain'}-${domain.id ?? ''}`}
                className='group hover:bg-muted/40 transition-colors'
              >
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Globe className='text-primary h-3.5 w-3.5' />
                    <span className='text-foreground truncate text-sm font-medium'>{buildDomainLabel(domain)}</span>
                    {(graphqlUrl || graphiqlUrl) && (
                      <div
                        className='text-muted-foreground flex items-center gap-2 opacity-0 transition-opacity
													group-hover:opacity-100'
                      >
                        {graphqlUrl && (
                          <button
                            type='button'
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(graphqlUrl);
                                toast.success('Copied GraphQL endpoint');
                              } catch (err) {
                                toast.error('Failed to copy');
                              }
                            }}
                            className='hover:text-foreground focus-visible:outline-none'
                            aria-label='Copy GraphQL endpoint'
                          >
                            <CopyIcon className='h-3 w-3' />
                            <span className='sr-only'>Copy GraphQL endpoint</span>
                          </button>
                        )}
                        {graphiqlUrl && (
                          <a
                            href={graphiqlUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='hover:text-foreground'
                            aria-label='Open GraphiQL'
                          >
                            <ExternalLink className='h-3 w-3' />
                            <span className='sr-only'>Open GraphiQL</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-foreground truncate text-sm'>{domain.subdomain ?? '—'}</TableCell>
                <TableCell className='text-sm'>
                  {api ? (
                    <span className='text-primary truncate'>{api.name}</span>
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
                          handleEdit(domain);
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
                          handleDelete(domain);
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
      title='Domains'
      count={sortedDomains.length}
      icon={<Globe className='text-muted-foreground h-4 w-4' />}
      open={open}
      onOpenChange={onOpenChange}
      actionLabel='New Domain'
      onAction={() => openDomainCard(null)}
    >
      {content}
    </CollapsibleSection>
  );
}
