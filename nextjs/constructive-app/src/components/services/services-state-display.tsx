'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { RiDatabase2Line } from '@remixicon/react';

import { cn } from '@/lib/utils';
import type { DataError } from '@/lib/gql/error-handler';
import { Button } from '@constructive-io/ui/button';
import {
  BaseSkeleton,
  type BaseStateConfig,
  ErrorBanner,
  InfoBanner,
} from '@/components/shared/base-state-display';

// ============================================================================
// Types
// ============================================================================

export type ServicesStateType = 'loading' | 'error' | 'no-database';

export interface ServicesStateConfig {
  type: ServicesStateType;
  message?: string;
  onRetry?: () => void;
  /** Original error object for auth error detection */
  error?: Error | DataError | null;
}

// ============================================================================
// Skeleton Components (matching services layout)
// ============================================================================

/**
 * Section card skeleton - mimics a collapsible section
 */
function SectionSkeleton({ rows = 3, delay = 0 }: { rows?: number; delay?: number }) {
  return (
    <div
      className='rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-card overflow-hidden'
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Section header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50'>
        <div className='flex items-center gap-3'>
          <BaseSkeleton className='h-5 w-5 rounded' />
          <BaseSkeleton className='h-4 w-24 rounded' />
          <BaseSkeleton className='h-5 w-8 rounded-full' />
        </div>
        <BaseSkeleton className='h-8 w-24 rounded-md' />
      </div>

      {/* Section content - rows */}
      <div className='divide-y divide-zinc-100 dark:divide-zinc-800/50'>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-4 px-4 py-3'
            style={{ opacity: 1 - i * 0.15 }}
          >
            <BaseSkeleton className='h-9 w-9 rounded-lg' />
            <div className='flex-1 space-y-1.5'>
              <BaseSkeleton className='h-4 w-32 rounded' />
              <BaseSkeleton className='h-3 w-48 rounded' />
            </div>
            <BaseSkeleton className='h-6 w-16 rounded-full' />
            <BaseSkeleton className='h-8 w-8 rounded-md' />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full loading skeleton with multiple sections
 */
function LoadingSkeleton({ message }: { message?: string }) {
  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='mx-auto max-w-6xl space-y-6 px-4 pt-4 pb-8 md:px-6 lg:px-8'>
        {message && (
          <div className='px-1 py-2'>
            <span className='text-xs text-muted-foreground font-medium tracking-wide uppercase'>
              {message}
            </span>
          </div>
        )}

        {/* Domains section */}
        <SectionSkeleton rows={2} delay={0} />

        {/* APIs section */}
        <SectionSkeleton rows={3} delay={100} />

        {/* Sites section */}
        <SectionSkeleton rows={2} delay={200} />

        {/* Apps section */}
        <SectionSkeleton rows={2} delay={300} />
      </div>
    </div>
  );
}

/**
 * Services skeleton for background display
 */
function ServicesSkeleton() {
  return (
    <div className='space-y-6'>
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={2} />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface ServicesStateDisplayProps {
  config: ServicesStateConfig;
  className?: string;
}

/**
 * Services route state display component
 *
 * Features:
 * - Loading states show skeleton UI mimicking services layout
 * - Error states display as horizontal banners with auth error detection
 * - No database state shows info with link to schemas
 * - Works in both light and dark modes
 */
export const ServicesStateDisplay = memo(function ServicesStateDisplay({
  config,
  className,
}: ServicesStateDisplayProps) {
  // Loading state - show full skeleton
  if (config.type === 'loading') {
    return (
      <div className={cn('flex flex-1 flex-col min-h-0', className)}>
        <LoadingSkeleton message={config.message} />
      </div>
    );
  }

  // Error state - horizontal banner with skeleton background
  if (config.type === 'error') {
    return (
      <div className={cn('flex flex-1 flex-col min-h-0', className)}>
        <div className='flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-6xl space-y-6 px-4 pt-4 pb-8 md:px-6 lg:px-8'>
            <ErrorBanner
              config={config as BaseStateConfig}
              title='Failed to load databases'
              skeleton={<ServicesSkeleton />}
            />
          </div>
        </div>
      </div>
    );
  }

  // No database selected
  if (config.type === 'no-database') {
    return (
      <div className={cn('flex flex-1 flex-col min-h-0', className)}>
        <div className='flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-6xl space-y-6 px-4 pt-4 pb-8 md:px-6 lg:px-8'>
            <InfoBanner
              icon={RiDatabase2Line}
              title='No database selected'
              description='Select a database from the topbar to view services, domains, and apps'
              action={
                <Button variant='outline' size='sm' asChild className='h-8 px-3 text-xs shrink-0'>
                  <Link href={'/' as Route}>Go to Organizations</Link>
                </Button>
              }
              skeleton={
                <div className='space-y-6'>
                  <SectionSkeleton rows={2} />
                  <SectionSkeleton rows={3} />
                  <SectionSkeleton rows={2} />
                </div>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
});

// Export skeleton for reuse
export { BaseSkeleton as ServicesSkeleton, SectionSkeleton, LoadingSkeleton };
