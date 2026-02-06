import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@constructive-io/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel: string;
  onAction?: () => void;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  icon,
  open,
  onOpenChange,
  actionLabel,
  onAction,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className='flex items-center justify-between gap-3'>
        <CollapsibleTrigger asChild>
          <button
            type='button'
            className='group text-foreground hover:bg-muted/40 focus-visible:ring-ring
							focus-visible:ring-offset-background flex items-center justify-start gap-2 rounded-md px-2 py-1 text-left
							text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2
							focus-visible:outline-none'
          >
            <span className='text-muted-foreground flex h-5 w-5 items-center justify-center'>
              {open ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
            </span>

            <span className='text-muted-foreground flex h-6 w-6 items-center justify-center'>{icon}</span>
            <span className='min-w-0 grow-0 truncate text-sm font-medium'>{title}</span>

            <Badge variant='secondary' className='h-5 justify-self-end px-2 text-xs'>
              {count}
            </Badge>
          </button>
        </CollapsibleTrigger>
        <Button size='sm' className='h-8 gap-1.5 px-3 text-xs' onClick={onAction} disabled={!onAction}>
          <Plus className='h-3.5 w-3.5' />
          {actionLabel}
        </Button>
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
