import { useMemo, useState } from 'react';
import { Database, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useCardStack } from '@constructive-io/ui/stack';

import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
import { databaseSchemasQueryKeys } from '@/lib/gql/hooks/schema-builder/schemas';
import { useDeleteSchemaMutation } from '@sdk/app-public';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@constructive-io/ui/alert-dialog';

import type { BaseSectionProps } from './apis-section';
import { actionsHeader } from './apis-section';
import { CollapsibleSection } from './collapsible-section';
import { SchemaCard } from './schema-card';
import { ServiceTableView, type ServiceTableColumn } from './service-table-view';
import { ServicesSectionState } from './services-section-state';

export interface SchemasSectionProps extends BaseSectionProps {
  schemas: DatabaseSchema[];
  totalCount: number;
  services: DatabaseService[];
  databaseId: string;
}

export function SchemasSection({
  schemas,
  totalCount,
  services,
  databaseId,
  isLoading,
  error,
  onRetry,
  isSectionLoading,
  open,
  onOpenChange,
  renderAsPanel,
}: SchemasSectionProps & { renderAsPanel?: boolean }) {
  const stack = useCardStack();
  const queryClient = useQueryClient();
  const [schemaToDelete, setSchemaToDelete] = useState<DatabaseSchema | null>(null);
  const deleteSchema = useDeleteSchemaMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseSchemasQueryKeys.byDatabase(databaseId) });
    },
  });

  const openSchemaCard = (editingSchema: DatabaseSchema | null) => {
    stack.push({
      id: editingSchema ? `schema-edit-${editingSchema.id}` : 'schema-create',
      title: editingSchema ? 'Edit Schema' : 'Create New Schema',
      Component: SchemaCard,
      props: {
        databaseId,
        services,
        editingSchema,
        onSuccess: () => onRetry?.(),
      },
      width: CARD_WIDTHS.wide,
    });
  };

  const handleCreate = () => {
    openSchemaCard(null);
  };

  const handleEdit = (schema: DatabaseSchema) => {
    openSchemaCard(schema);
  };

  const handleDeleteClick = (schema: DatabaseSchema) => {
    setSchemaToDelete(schema);
  };

  const handleDeleteConfirm = async () => {
    if (!schemaToDelete) return;

    try {
      await deleteSchema.mutateAsync({
        input: { id: schemaToDelete.id },
      });

      showSuccessToast({
        message: 'Schema deleted successfully',
        description: `${schemaToDelete.name} has been deleted.`,
      });

      onRetry?.();
    } catch (error) {
      console.error('Failed to delete schema:', error);
      showErrorToast({
        message: 'Failed to delete schema',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setSchemaToDelete(null);
    }
  };

  const columns: ServiceTableColumn[] = useMemo(
    () => [
      { label: 'Name', className: 'min-w-[150px]' },
      { label: 'Schema Name', className: 'min-w-[120px]' },
      { label: 'Label' },
      { label: 'Linked APIs' },
      { label: actionsHeader, className: 'w-[72px] text-right' },
    ],
    [],
  );

  const deleteDialog = (
    <AlertDialog open={!!schemaToDelete} onOpenChange={() => setSchemaToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Schema</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the schema &quot;{schemaToDelete?.name}&quot;? This action cannot be
            undone and will remove all tables and data within this schema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteSchema.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const content = (
    <ServicesSectionState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      empty={!isSectionLoading && schemas.length === 0}
      emptyMessage='No schemas have been created for this database yet.'
    >
      <ServiceTableView columns={columns}>
        {schemas.map((schema) => (
          <SchemaRow
            key={schema.id}
            schema={schema}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        ))}
      </ServiceTableView>
    </ServicesSectionState>
  );

  if (renderAsPanel) {
    return (
      <>
        {deleteDialog}
        {content}
      </>
    );
  }

  return (
    <>
      {deleteDialog}
      <CollapsibleSection
        title='Schemas'
        count={totalCount}
        icon={<Database className='text-muted-foreground h-4 w-4' />}
        open={open}
        onOpenChange={onOpenChange}
        actionLabel='New Schema'
        onAction={handleCreate}
      >
        {content}
      </CollapsibleSection>
    </>
  );
}

interface SchemaRowProps {
  schema: DatabaseSchema;
  onEdit: (schema: DatabaseSchema) => void;
  onDelete: (schema: DatabaseSchema) => void;
}

function SchemaRow({ schema, onEdit, onDelete }: SchemaRowProps) {
  const linkedApis = schema.apiSchemas?.nodes || [];

  return (
    <TableRow className='group hover:bg-muted/40 transition-colors'>
      <TableCell>
        <div className='flex items-center gap-2'>
          <Database className='text-primary h-3.5 w-3.5' />
          <span className='text-foreground truncate text-sm font-medium'>{schema.name}</span>
        </div>
      </TableCell>
      <TableCell className='text-muted-foreground truncate font-mono text-sm'>{schema.schemaName}</TableCell>
      <TableCell className='text-muted-foreground truncate text-sm'>{schema.label || '—'}</TableCell>
      <TableCell>
        {linkedApis.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {linkedApis.slice(0, 3).map((link) => (
              <Badge key={link.id} variant='secondary' className='h-5 px-2 text-xs'>
                {link.api?.name || 'Unknown API'}
              </Badge>
            ))}
            {linkedApis.length > 3 && (
              <Badge variant='outline' className='h-5 px-2 text-xs'>
                +{linkedApis.length - 3} more
              </Badge>
            )}
          </div>
        ) : (
          <span className='text-muted-foreground text-sm'>No linked APIs</span>
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
                onEdit(schema);
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
                onDelete(schema);
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
}
