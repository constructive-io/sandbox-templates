'use client';

import { useState } from 'react';
import { ArrowRight, Database, MoreHorizontal, Pencil, Plug, Table2, Trash2 } from 'lucide-react';

import type { AccessibleDatabase } from '@/lib/gql/hooks/schema-builder';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { Skeleton } from '@constructive-io/ui/skeleton';
import { TableCell, TableRow } from '@constructive-io/ui/table';

export interface DatabaseCardProps {
  database: AccessibleDatabase;
  onClick: () => void;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DatabaseCard({ database, onClick, index, onEdit, onDelete }: DatabaseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = database.label || database.name || 'Unnamed Database';
  const tableCount = database.tables?.totalCount ?? 0;
  const apiCount = database.apis?.nodes?.length ?? 0;
  const showActions = onEdit || onDelete;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ animationDelay: `${100 + index * 50}ms` }}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-xl border p-5 text-left',
        'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-300',
        'transition-all duration-200',
        'hover:-translate-y-0.5',
        'hover:[box-shadow:0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.02)]',
        'dark:hover:[box-shadow:0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.08)]',
        'border-border/50 bg-card hover:border-border/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      data-testid='dbs-card'
      data-db-id={database.id}
    >
      {/* Action menu - top right */}
      {showActions && (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={cn(
                'absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                menuOpen && 'bg-muted opacity-100',
                !menuOpen && 'hover:bg-muted',
              )}
            >
              <MoreHorizontal className='h-4 w-4 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
            )}
            {/* TODO: Unhide when backend delete is fixed */}
            {onDelete && (
              <DropdownMenuItem
                className='hidden text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive'
                onClick={onDelete}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Content - name and details at top */}
      <div className='mb-4 flex-1'>
        <h3 className='text-foreground group-hover:text-foreground text-base font-semibold tracking-tight'>
          {displayName}
        </h3>
        <p className='text-muted-foreground mt-1 text-xs'>{database.schemaName || 'No schema'}</p>
        <div className='text-muted-foreground mt-3 flex items-center gap-4 text-xs'>
          <span className='flex items-center gap-1.5'>
            <Table2 className='h-3.5 w-3.5' />
            {tableCount} {tableCount === 1 ? 'table' : 'tables'}
          </span>
          <span className='flex items-center gap-1.5'>
            <Plug className='h-3.5 w-3.5' />
            {apiCount} {apiCount === 1 ? 'API' : 'APIs'}
          </span>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className='border-border/30 flex items-center justify-between border-t pt-4'>
        <span className='text-muted-foreground text-[11px] font-medium'>Manage</span>
        <ArrowRight
          className={cn(
            'text-muted-foreground/50 h-4 w-4 transition-all duration-200',
            'group-hover:text-primary group-hover:translate-x-0.5',
          )}
        />
      </div>
    </div>
  );
}

export function DatabaseCardSkeleton({ index }: { index: number }) {
  return (
    <div
      style={{ animationDelay: `${100 + index * 50}ms` }}
      className={cn(
        'border-border/50 bg-card relative flex flex-col rounded-xl border p-5',
        'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-300',
      )}
    >
      <div className='mb-4 flex-1 space-y-2'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-3 w-24' />
        <div className='mt-3 flex gap-4'>
          <Skeleton className='h-3.5 w-20' />
          <Skeleton className='h-3.5 w-14' />
        </div>
      </div>
      <div className='border-border/30 flex items-center justify-between border-t pt-4'>
        <Skeleton className='h-3 w-14' />
        <Skeleton className='h-4 w-4' />
      </div>
    </div>
  );
}

export interface DatabaseListRowProps {
  database: AccessibleDatabase;
  onClick: () => void;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DatabaseListRow({ database, onClick, index, onEdit, onDelete }: DatabaseListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = database.label || database.name || 'Unnamed Database';
  const tableCount = database.tables?.totalCount ?? 0;
  const apiCount = database.apis?.nodes?.length ?? 0;
  const showActions = onEdit || onDelete;

  return (
    <TableRow
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        'group hover:bg-muted/50 cursor-pointer transition-colors',
        'animate-in fade-in-0 fill-mode-backwards duration-200',
      )}
      onClick={onClick}
      data-testid='dbs-row'
      data-db-id={database.id}
    >
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='bg-muted/60 flex h-9 w-9 items-center justify-center rounded-lg'>
            <Database className='text-muted-foreground h-4 w-4' />
          </div>
          <div>
            <p className='text-foreground font-medium'>{displayName}</p>
            <p className='text-muted-foreground text-xs'>{database.schemaName || 'No schema'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className='text-muted-foreground text-right tabular-nums'>{tableCount}</TableCell>
      <TableCell className='text-muted-foreground text-right tabular-nums'>{apiCount}</TableCell>
      {showActions && (
        <TableCell className='w-12'>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100',
                  menuOpen && 'bg-muted opacity-100',
                  !menuOpen && 'hover:bg-muted',
                )}
              >
                <MoreHorizontal className='h-4 w-4 text-muted-foreground' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
              )}
              {/* TODO: Unhide when backend delete is fixed */}
              {onDelete && (
                <DropdownMenuItem
                  className='hidden text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive'
                  onClick={onDelete}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
}

export function DatabaseListRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-9 w-9 rounded-lg' />
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className='ml-auto h-4 w-8' />
      </TableCell>
      <TableCell>
        <Skeleton className='ml-auto h-4 w-6' />
      </TableCell>
      <TableCell className='w-12' />
    </TableRow>
  );
}
