'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiExpandUpDownLine,
  RiMore2Line,
  RiPencilLine,
  RiSearchLine,
} from '@remixicon/react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateDatabaseProvision } from '@/lib/gql/hooks/schema-builder/use-create-database-provision';
import { useDeleteDatabase } from '@/lib/gql/hooks/schema-builder/use-delete-database';
import { useUpdateDatabase } from '@/lib/gql/hooks/schema-builder/use-update-database';
import { getDatabaseRouteKeyFromSection, getDatabaseSectionFromPathname, useEntityParams } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { ProgressiveBlur } from '@constructive-io/ui/progressive-blur';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { useCardStack } from '@constructive-io/ui/stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import {
  CreateDatabaseCard,
  DeleteDatabaseDialog,
  EditDatabaseCard,
  type CreateDatabaseParams,
} from '@/components/databases';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { buildOrgDatabaseRoute, buildOrgRoute } from '@/app-routes';

// Threshold for when to enable virtualization with scroll area
const VIRTUALIZATION_THRESHOLD = 15;

interface DatabaseItem {
  key: string;
  name: string;
  label?: string;
  id: string;
}

interface DatabaseEntitySwitcherProps {
  size?: 'sm' | 'md';
  className?: string;
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <div className={cn('text-muted-foreground flex items-center justify-center', className)}>
      <RiDatabase2Line className='h-4 w-4' />
    </div>
  );
}

function LetterAvatar({ name, className }: { name: string; className?: string }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground flex items-center justify-center rounded-md text-[10px] font-medium',
        className,
      )}
    >
      {initial}
    </div>
  );
}

function useEntitySwitcherScrollState(isOpen: boolean, itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showBottomBlur, setShowBottomBlur] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const getViewport = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return null;
    return root.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement | null;
  }, []);

  const updateScrollBlur = useCallback(() => {
    const el = getViewport();
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setShowBottomBlur(!(atBottom || el.scrollHeight <= el.clientHeight));
  }, [getViewport]);

  const markScrolling = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const resetScrolling = useCallback(() => {
    setIsScrolling(false);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const viewport = getViewport();
    if (!viewport) return;

    const onScroll = () => {
      updateScrollBlur();
      markScrolling();
    };

    updateScrollBlur();
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
    };
  }, [getViewport, isOpen, itemCount, markScrolling, updateScrollBlur]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { scrollRef, showBottomBlur, isScrolling, resetScrolling };
}

interface DatabaseMenuItemProps {
  database: DatabaseItem;
  isSelected: boolean;
  isMenuOpen: boolean;
  disableTooltip?: boolean;
  onSelect: () => void;
  onMenuOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DatabaseMenuItem({
  database,
  isSelected,
  isMenuOpen,
  disableTooltip = false,
  onSelect,
  onMenuOpenChange,
  onEdit,
  onDelete,
}: DatabaseMenuItemProps) {
  const displayName = database.label || database.name;
  const label = <span className='min-w-0 flex-1 truncate'>{displayName}</span>;

  return (
    <DropdownMenuItem onClick={onSelect} className='group gap-2 py-2 pr-1'>
      <LetterAvatar name={displayName} className='h-5 w-5 shrink-0 text-xs' />
      {disableTooltip ? (
        label
      ) : (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>{label}</TooltipTrigger>
          <TooltipContent side='top' align='start'>
            {displayName}
          </TooltipContent>
        </Tooltip>
      )}
      {/* Always reserve space for checkmark to prevent layout shift */}
      <div className='w-4 shrink-0'>
        {isSelected && <RiCheckLine className='text-primary h-4 w-4' aria-hidden='true' />}
      </div>
      {/* Action button - always rendered but visibility controlled via opacity */}
      <DropdownMenu open={isMenuOpen} onOpenChange={onMenuOpenChange}>
        <DropdownMenuTrigger
          asChild
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
              'opacity-0 group-hover:opacity-100',
              isMenuOpen && 'bg-muted-foreground/10 opacity-100',
              !isMenuOpen && 'hover:bg-muted-foreground/10',
            )}
          >
            <RiMore2Line className='h-3.5 w-3.5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <RiPencilLine className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive
							focus:text-destructive'
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <RiDeleteBinLine className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuItem>
  );
}

export function DatabaseEntitySwitcher({ size = 'sm', className }: DatabaseEntitySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stack = useCardStack();

  // Get org context from URL params for context-aware navigation
  const { orgId } = useEntityParams();

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [, startTransition] = useTransition();
  const pendingRouteRef = useRef<Route | null>(null);

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

  // Track which database's action menu is open
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const createDatabaseProvision = useCreateDatabaseProvision();
  const updateDatabaseMutation = useUpdateDatabase();
  const deleteDatabaseMutation = useDeleteDatabase();

  // Schema-related state from selectors (derived from React Query)
  const { availableSchemas, selectedSchemaKey, isLoading: isSchemasLoading } = useSchemaBuilderSelectors();

  // Filter databases by org if in org context
  const databases: DatabaseItem[] = availableSchemas
    .filter((schema) => schema.source === 'database')
    .filter((schema) => !orgId || schema.databaseInfo?.ownerId === orgId)
    .map((schema) => ({
      key: schema.key,
      name: schema.databaseInfo?.name ?? schema.name,
      label: schema.databaseInfo?.label ?? undefined,
      id: schema.databaseInfo?.id ?? '',
    }));

  // Filter databases based on search
  const filteredDatabases = useMemo(() => {
    if (!searchValue.trim()) return databases;
    return databases.filter((db) => (db.label || db.name).toLowerCase().includes(searchValue.toLowerCase()));
  }, [databases, searchValue]);

  const { scrollRef, showBottomBlur, isScrolling, resetScrolling } = useEntitySwitcherScrollState(
    open,
    filteredDatabases.length,
  );

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue('');
      resetScrolling();
    }
  }, [open, resetScrolling]);

  useEffect(() => {
    if (open) return;
    if (!pendingRouteRef.current) return;
    const nextRoute = pendingRouteRef.current;
    pendingRouteRef.current = null;
    startTransition(() => {
      router.push(nextRoute);
    });
  }, [open, router, startTransition]);

  const selectedDatabaseKey = selectedSchemaKey;
  const selectedDatabase = databases.find((db) => db.key === selectedDatabaseKey);
  const currentSection = useMemo(() => getDatabaseSectionFromPathname(pathname ?? ''), [pathname]);
  const queryString = searchParams?.toString() ?? '';


  const handleDatabaseChange = (key: string) => {
    // Find schema info for routing
    const schemaInfo = availableSchemas.find((s) => s.key === key);
    const databaseId = schemaInfo?.databaseInfo?.id;

    // Prepare target route (URL is source of truth)
    const targetSection = currentSection ?? 'schemas';
    const nextSearchParams = new URLSearchParams(queryString);
    nextSearchParams.delete('table');
    nextSearchParams.delete('tableName');
    const nextQueryString = nextSearchParams.toString();
    const querySuffix = nextQueryString ? `?${nextQueryString}` : '';

    let targetRoute: Route | null = null;

    if (orgId && databaseId) {
      const routeKey = getDatabaseRouteKeyFromSection(targetSection, 'schemas');
      const base = buildOrgDatabaseRoute(routeKey, orgId, databaseId);
      targetRoute = (base + querySuffix) as Route;
    } else {
      // No org context - redirect to root
      targetRoute = '/' as Route;
    }

    pendingRouteRef.current = targetRoute;
    setOpenMenuKey(null);
    setOpen(false);
  };

  // Simplified handler - just calls provision mutation
  const handleCreateDatabase = async (params: CreateDatabaseParams) => {
    // Create database with organization as owner if in org context
    await createDatabaseProvision.mutateAsync({
      name: params.name,
      domain: params.domain,
      subdomain: params.subdomain,
      ownerId: orgId ?? undefined,
    });
  };

  const handleUpdateDatabase = async (id: string, name: string, label: string | null) => {
    await updateDatabaseMutation.mutateAsync({ id, name, label });
  };

  const handleDeleteDatabase = async (id: string) => {
    await deleteDatabaseMutation.mutateAsync({ id });
  };

  const databaseItems = filteredDatabases.length > 0 ? (
    filteredDatabases.map((database) => (
      <DatabaseMenuItem
        key={database.key}
        database={database}
        isSelected={database.key === selectedDatabaseKey}
        isMenuOpen={openMenuKey === database.key}
        disableTooltip={isScrolling}
        onSelect={() => handleDatabaseChange(database.key)}
        onMenuOpenChange={(nextOpen) => {
          setOpenMenuKey(nextOpen ? database.key : null);
        }}
        onEdit={() => {
          setOpenMenuKey(null);
          setOpen(false);
          stack.push({
            id: `edit-database-${database.id}`,
            title: 'Edit Database',
            Component: EditDatabaseCard,
            props: {
              databaseId: database.id,
              databaseName: database.name,
              databaseLabel: database.label ?? null,
              updateDatabase: handleUpdateDatabase,
            },
            width: CARD_WIDTHS.narrow,
          });
        }}
        onDelete={() => {
          setOpenMenuKey(null);
          setDeleteDatabaseDialog({
            isOpen: true,
            databaseId: database.id,
            databaseName: database.name,
          });
        }}
      />
    ))
  ) : (
    <div className='text-muted-foreground px-2 py-4 text-center text-sm'>No databases found</div>
  );

  const sizeClasses = size === 'sm' ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-sm';

  // Check if virtualization should be enabled
  const shouldVirtualize = databases.length >= VIRTUALIZATION_THRESHOLD;


  if (isSchemasLoading && !databases.length) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium',
          'text-muted-foreground',
          size === 'sm' && 'px-1.5 py-1 text-xs',
          className,
        )}
      >
        <span>Loading databases...</span>
      </div>
    );
  }

  if (!databases.length) {
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium',
              'transition-colors duration-200',
              'hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              size === 'sm' && 'px-1.5 py-1 text-sm',
              className,
            )}
          >
            <span className='text-muted-foreground'>Select Database</span>
            <RiExpandUpDownLine
              className={cn('text-muted-foreground/60 shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
              aria-hidden='true'
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent align='start' className='min-w-55 p-0'>
            {/* Search input at the top */}
            <div className='border-b p-2'>
              <InputGroup>
                <InputGroupAddon>
                  <RiSearchLine />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder='Find database...'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  size='sm'
                  autoFocus
                />
              </InputGroup>
            </div>

            {/* Empty state */}
            <div className='p-1'>
              <div className='text-muted-foreground px-2 py-4 text-center text-sm'>No databases found</div>
            </div>

            {/* "View Databases" / "View Organizations" link - context aware */}
            <DropdownMenuSeparator className='my-0' />
            <div className='p-1'>
              <DropdownMenuItem asChild className='gap-2 py-2'>
                <Link href={orgId ? buildOrgRoute('ORG_DATABASES', orgId) : ('/' as Route)}>
                  <span className='flex-1'>{orgId ? 'View Databases' : 'View Organizations'}</span>
                  <RiArrowRightLine className='text-muted-foreground h-4 w-4' aria-hidden='true' />
                </Link>
              </DropdownMenuItem>
            </div>

            {/* "New database" at the bottom */}
            <DropdownMenuSeparator className='my-0' />
            <div className='p-1'>
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  stack.push({
                    id: 'create-database',
                    title: 'Create Database',
                    Component: CreateDatabaseCard,
                    props: { createDatabase: handleCreateDatabase },
                    width: CARD_WIDTHS.medium,
                  });
                }}
                className='gap-2 py-2'
              >
                <RiAddLine className='h-4 w-4 opacity-60' aria-hidden='true' />
                <span>New database</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium',
            'transition-colors duration-200',
            'hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            size === 'sm' && 'px-1.5 py-1 text-sm',
            className,
          )}
        >
          {selectedDatabase ? (
            <>
              <DatabaseIcon className={sizeClasses} />
              <span className='max-w-30 truncate'>{selectedDatabase.label || selectedDatabase.name}</span>
            </>
          ) : (
            <span className='text-muted-foreground'>Select Database</span>
          )}
          <RiExpandUpDownLine
            className={cn('text-muted-foreground/60 shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
            aria-hidden='true'
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' className='w-65 p-0'>
          {/* Search input at the top */}
          <div className='border-b p-2'>
            <InputGroup>
              <InputGroupAddon>
                <RiSearchLine />
              </InputGroupAddon>
              <InputGroupInput
                placeholder='Find database...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                size='sm'
                autoFocus
              />
            </InputGroup>
          </div>

          {/* Database list */}
          {shouldVirtualize ? (
            <div className='relative'>
              <ScrollArea ref={scrollRef} className='scrollbar-neutral-thin max-h-60 [&>div]:max-h-[inherit]'>
                <div className='space-y-0.5 p-1'>{databaseItems}</div>
              </ScrollArea>
              {showBottomBlur && <ProgressiveBlur position='bottom' height='18%' blurPx={6} />}
            </div>
          ) : (
            <ScrollArea ref={scrollRef} className='scrollbar-neutral-thin max-h-60 [&>div]:max-h-[inherit]'>
              <div className='space-y-0.5 p-1'>{databaseItems}</div>
            </ScrollArea>
          )}

          {/* "View Databases" / "View Organizations" link - context aware */}
          <DropdownMenuSeparator className='my-0' />
          <div className='p-1'>
            <DropdownMenuItem asChild className='gap-2 py-2'>
              <Link href={orgId ? buildOrgRoute('ORG_DATABASES', orgId) : ('/' as Route)}>
                <span className='flex-1'>{orgId ? 'View Databases' : 'View Organizations'}</span>
                <RiArrowRightLine className='text-muted-foreground h-4 w-4' aria-hidden='true' />
              </Link>
            </DropdownMenuItem>
          </div>

          {/* "New database" at the bottom */}
          <DropdownMenuSeparator className='my-0' />
          <div className='p-1'>
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                stack.push({
                  id: 'create-database',
                  title: 'Create Database',
                  Component: CreateDatabaseCard,
                  props: { createDatabase: handleCreateDatabase },
                  width: CARD_WIDTHS.medium,
                });
              }}
              className='gap-2 py-2'
            >
              <RiAddLine className='h-4 w-4 opacity-60' aria-hidden='true' />
              <span>New database</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

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
