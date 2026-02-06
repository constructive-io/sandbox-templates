import type { ReactNode } from 'react';

import { Alert, AlertDescription } from '@constructive-io/ui/alert';
import { Button } from '@constructive-io/ui/button';
import { Skeleton } from '@constructive-io/ui/skeleton';

interface ServicesSectionStateProps {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
}

export function ServicesSectionState({
  isLoading,
  error,
  onRetry,
  empty,
  emptyMessage,
  children,
}: ServicesSectionStateProps) {
  if (isLoading) {
    return <SkeletonTable />;
  }

  if (error) {
    return (
      <Alert variant='destructive' className='mt-3'>
        <AlertDescription className='flex items-center justify-between gap-3 text-sm'>
          <span>{error.message}</span>
          <Button size='sm' variant='outline' onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (empty) {
    return (
      <div
        className='border-border/60 text-muted-foreground bg-card mt-3 rounded-lg border border-dashed px-4 py-6 text-center text-sm'
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}

function SkeletonTable() {
  return (
    <div className='border-border/60 bg-card mt-3 space-y-2 rounded-lg border p-3'>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className='grid grid-cols-6 items-center gap-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-12 justify-self-end' />
        </div>
      ))}
    </div>
  );
}
