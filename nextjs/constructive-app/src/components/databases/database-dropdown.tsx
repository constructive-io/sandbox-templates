'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MoreVertical, Network, Pencil, Plus, Trash2 } from 'lucide-react';

import { useCardStack } from '@constructive-io/ui/stack';

import { buildOrgDatabaseRoute } from '@/app-routes';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateDatabaseProvision } from '@/lib/gql/hooks/schema-builder/use-create-database-provision';
import { useDeleteDatabase } from '@/lib/gql/hooks/schema-builder/use-delete-database';
import { useUpdateDatabase } from '@/lib/gql/hooks/schema-builder/use-update-database';
import { getDatabaseRouteKeyFromSection, getDatabaseSectionFromPathname, useEntityParams } from '@/lib/navigation';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from '@constructive-io/ui/combobox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';

import type { CreateDatabaseParams } from './create-database-card';
import { CreateDatabaseCard } from './create-database-card';
import { DeleteDatabaseDialog } from './delete-database-dialog';
import { EditDatabaseCard } from './edit-database-card';

interface DatabaseItem {
  key: string;
  name: string;
  label?: string;
  id: string;
}

export function DatabaseDropdown({ className }: { className?: string }) {
	const stack = useCardStack();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { orgId } = useEntityParams();


  // Dialog states (only for destructive operations)
  const [deleteDatabaseDialog, setDeleteDatabaseDialog] = useState<{
    isOpen: boolean;
    databaseId: string | null;
    databaseName: string | null;
  }>({
    isOpen: false,
    databaseId: null,
    databaseName: null,
  });

  const createDatabaseProvision = useCreateDatabaseProvision();
  const updateDatabaseMutation = useUpdateDatabase();
  const deleteDatabaseMutation = useDeleteDatabase();

	// Schema-related state from selectors (derived from React Query)
	const { availableSchemas, selectedSchemaKey } = useSchemaBuilderSelectors();


  const databases: DatabaseItem[] = availableSchemas
    .filter((schema) => schema.source === 'database')
    .map((schema) => ({
      key: schema.key,
      name: schema.databaseInfo?.name ?? schema.name,
      label: schema.databaseInfo?.label ?? undefined,
      id: schema.databaseInfo?.id ?? schema.dbSchema?.id ?? '',
    }));

	const selectedDatabaseKey = selectedSchemaKey;
	const currentSection = useMemo(() => getDatabaseSectionFromPathname(pathname), [pathname]);

	const onDatabaseChange = (key: string) => {
		const schemaInfo = availableSchemas.find((schema) => schema.key === key);
		const databaseId = schemaInfo?.databaseInfo?.id;
		if (!orgId || !databaseId) {
			return;
		}

		const queryString = searchParams?.toString() ?? '';
		const nextSearchParams = new URLSearchParams(queryString);
		nextSearchParams.delete('table');
		nextSearchParams.delete('tableName');
		const nextQueryString = nextSearchParams.toString();

		const routeKey = getDatabaseRouteKeyFromSection(currentSection, 'schemas');
		const base = buildOrgDatabaseRoute(routeKey, orgId, databaseId);
		router.push((nextQueryString ? `${base}?${nextQueryString}` : base) as typeof base);
	};


  type DatabaseOption = {
    value: string;
    label: string;
    database: DatabaseItem;
  };

  const databaseOptions: DatabaseOption[] = databases.map((db) => ({
    value: db.key,
    label: db.label || db.name,
    database: db,
  }));

  const selectedDatabaseOption = databaseOptions.find((o) => o.value === selectedDatabaseKey) ?? null;

  // Simplified handler - just calls provision mutation
  const handleCreateDatabase = async (params: CreateDatabaseParams) => {
    await createDatabaseProvision.mutateAsync({
      name: params.name,
      domain: params.domain,
      subdomain: params.subdomain,
    });
  };

  const handleUpdateDatabase = async (id: string, name: string, label: string | null) => {
    await updateDatabaseMutation.mutateAsync({ id, name, label });
  };

  const handleDeleteDatabase = async (id: string) => {
    await deleteDatabaseMutation.mutateAsync({ id });
  };

  return (
    <>
      <Combobox
        items={databaseOptions}
        value={selectedDatabaseOption}
        onValueChange={(next) => {
          if (next) onDatabaseChange(next.value);
        }}
        filter={(item: DatabaseOption, query: string) => {
          const q = query.toLowerCase();
          return (
            item.label.toLowerCase().includes(q) ||
            item.database.name.toLowerCase().includes(q) ||
            (item.database.label ?? '').toLowerCase().includes(q)
          );
        }}
      >
        <ComboboxInput
          className={cn('w-full', className)}
          placeholder='Select database...'
          startAddon={<Network className='size-3.5' />}
          showClear={false}
        />
        <ComboboxPopup>
          <ComboboxEmpty>No databases found</ComboboxEmpty>
          <ComboboxList>
            {(option: DatabaseOption) => (
              <DatabaseItemRow
                key={option.value}
                option={option}
                onEdit={(db) =>
                  stack.push({
                    id: `edit-database-${db.id}`,
                    title: 'Edit Database',
                    Component: EditDatabaseCard,
                    props: {
                      databaseId: db.id,
                      databaseName: db.name,
                      databaseLabel: db.label ?? null,
                      updateDatabase: handleUpdateDatabase,
                    },
                    width: CARD_WIDTHS.narrow,
                  })
                }
                onDelete={(db) =>
                  setDeleteDatabaseDialog({
                    isOpen: true,
                    databaseId: db.id,
                    databaseName: db.name,
                  })
                }
              />
            )}
          </ComboboxList>
          <div className='border-border/60 border-t'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start rounded-none'
              onClick={(e) => {
                e.stopPropagation();
                stack.push({
                  id: 'create-database',
                  title: 'Create Database',
                  Component: CreateDatabaseCard,
                  props: { createDatabase: handleCreateDatabase },
                  width: CARD_WIDTHS.medium,
                });
              }}
            >
              <Plus className='h-4 w-4' />
              Create a new database
            </Button>
          </div>
        </ComboboxPopup>
      </Combobox>

      <DeleteDatabaseDialog
        isOpen={deleteDatabaseDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDatabaseDialog({ isOpen: false, databaseId: null, databaseName: null })
        }
        databaseId={deleteDatabaseDialog.databaseId}
        databaseName={deleteDatabaseDialog.databaseName}
        deleteDatabase={handleDeleteDatabase}
        isLoading={deleteDatabaseMutation.isPending}
      />
    </>
  );
}

interface DatabaseItemRowProps {
  option: {
    value: string;
    label: string;
    database: DatabaseItem;
  };
  onEdit: (database: DatabaseItem) => void;
  onDelete: (database: DatabaseItem) => void;
}

function DatabaseItemRow({ option, onEdit, onDelete }: DatabaseItemRowProps) {
  const { database } = option;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ComboboxItem
      value={option}
      className='group relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex w-full items-center justify-between gap-2'>
        <span className='min-w-0 flex-1 truncate'>{database.label || database.name}</span>
        <div className='h-6 w-6'>
          {(isHovered || isMenuOpen) && (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant='ghost'
                  size='sm'
                  className={cn(
                    'hover:bg-muted-foreground/10 h-6 w-6 rounded-lg p-0 transition-colors',
                    isMenuOpen && 'bg-muted-foreground/10',
                  )}
                >
                  <MoreVertical className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onEdit(database);
                  }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive
										focus:text-destructive data-[disabled=true]:text-muted-foreground'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete(database);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </ComboboxItem>
  );
}
