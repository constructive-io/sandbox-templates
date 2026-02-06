'use client';

import { memo, useCallback, useState } from 'react';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { CardComponent } from '@constructive-io/ui/stack';

import { getHumanReadableError } from '@/lib/gql/error-handler';
import { getRuntimeConfig } from '@/lib/runtime/get-runtime-config';
import { getSubdomainError, isValidSubdomain } from '@/lib/validation/hostname';
import { useDeferredMutation } from '@/hooks/use-deferred-mutation';
import { Alert, AlertDescription } from '@constructive-io/ui/alert';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';

export interface CreateDatabaseParams {
  name: string;
  domain: string;
  subdomain?: string;
}

export type CreateDatabaseCardProps = {
  createDatabase: (params: CreateDatabaseParams) => Promise<void>;
};

/** Get default domain from runtime config or fallback to 'localhost' */
function getDefaultDomain(): string {
  return getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN') || 'localhost';
}

// ============================================================================
// Memoized Form Fields - Completely isolated from status state changes
// ============================================================================

interface FormFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  domain: string;
  onDomainChange: (value: string) => void;
  subdomain: string;
  onSubdomainChange: (value: string) => void;
  onSubdomainBlur: () => void;
  subdomainError: string | null;
}

/**
 * Form fields component - memoized to prevent re-renders from status changes.
 * Does NOT receive isLoading/error - those don't affect form field rendering.
 * Disabled state is handled via CSS at the form level, not via prop.
 */
const FormFields = memo(function FormFields({
  name,
  onNameChange,
  domain,
  onDomainChange,
  subdomain,
  onSubdomainChange,
  onSubdomainBlur,
  subdomainError,
}: FormFieldsProps) {
  return (
    <>
      {/* Database Name */}
      <div className='grid gap-2'>
        <Label htmlFor='name'>
          Name <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='name'
          placeholder='my_database'
          value={name}
          autoComplete='off'
          autoFocus
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
          required
          data-testid='db-name-input'
        />
        <p className='text-muted-foreground text-xs'>Use lowercase letters, numbers, and underscores.</p>
      </div>

      {/* Subdomain + Domain */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor='subdomain'>Subdomain</Label>
          <Input
            id='subdomain'
            placeholder='auto'
            value={subdomain}
            autoComplete='off'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubdomainChange(e.target.value)}
            onBlur={onSubdomainBlur}
            data-testid='db-subdomain-input'
            aria-invalid={!!subdomainError}
            aria-describedby={subdomainError ? 'subdomain-error' : undefined}
            className={subdomainError ? 'border-destructive' : ''}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='domain'>
            Domain <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='domain'
            placeholder='example.com'
            value={domain}
            autoComplete='off'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDomainChange(e.target.value)}
            required
            data-testid='db-domain-input'
          />
        </div>
      </div>
      {subdomainError ? (
        <p id='subdomain-error' className='text-destructive -mt-3 text-xs'>
          {subdomainError}
        </p>
      ) : (
        <p className='text-muted-foreground -mt-3 text-xs'>
          {subdomain.trim() && domain.trim() ? (
            <>
              API endpoint:{' '}
              <code className='bg-muted rounded px-1'>
                {subdomain.trim()}.{domain.trim()}
              </code>
            </>
          ) : domain.trim() ? (
            <>
              API endpoint: <code className='bg-muted rounded px-1'>&lt;auto&gt;.{domain.trim()}</code>
            </>
          ) : (
            <>Leave empty to auto-generate subdomain</>
          )}
        </p>
      )}
    </>
  );
});

// ============================================================================
// Status Area - Animated, isolated from form fields
// ============================================================================

interface StatusAreaProps {
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
}

/**
 * Status area with smooth animations.
 * Memoized to only re-render when status actually changes.
 */
const StatusArea = memo(function StatusArea({ error, isLoading, onRetry }: StatusAreaProps) {
  const showError = error && !isLoading;
  const showLoading = isLoading;

  if (!showError && !showLoading) {
    return null;
  }

  return (
    <div className='pt-2'>
      <AnimatePresence mode='wait' initial={false}>
        {showError && (
          <motion.div
            key='error-state'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Alert variant='destructive'>
              <AlertCircleIcon className='h-4 w-4' />
              <AlertDescription className='flex items-center justify-between gap-2'>
                <span className='flex-1'>{error}</span>
                <Button type='button' variant='outline' size='sm' onClick={onRetry}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {showLoading && (
          <motion.div
            key='loading-state'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='bg-muted/50 flex items-center gap-3 rounded-lg border p-4'
          >
            <Loader2Icon className='text-primary h-5 w-5 animate-spin' />
            <div className='flex-1'>
              <p className='text-sm font-medium'>Setting up your database...</p>
              <p className='text-muted-foreground text-xs'>
                Creating API, domain, and installing modules. This may take a few seconds.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const CreateDatabaseCard: CardComponent<CreateDatabaseCardProps> = ({ createDatabase, card }) => {
  // Form state
  const [name, setName] = useState('');
  const [domain, setDomain] = useState(getDefaultDomain);
  const [subdomain, setSubdomain] = useState('');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  // Mutation state with deferred loading (skips flash for fast operations)
  const mutation = useDeferredMutation({ loadingDelayMs: 150, minLoadingMs: 400 });

  // Stable callback references - these never change, preventing child re-renders
  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleDomainChange = useCallback((value: string) => {
    setDomain(value);
  }, []);

  const handleSubdomainChange = useCallback((value: string) => {
    setSubdomain(value);
    setSubdomainError(null);
  }, []);

  // Blur handler uses functional update to access current subdomain value
  const onSubdomainBlur = useCallback(() => {
    // Use functional update to avoid stale closure
    setSubdomain((currentSubdomain) => {
      const validationError = getSubdomainError(currentSubdomain.trim());
      setSubdomainError(validationError);
      return currentSubdomain; // Don't change the value
    });
  }, []);

  const isSubdomainValid = isValidSubdomain(subdomain.trim());

  const doCreate = useCallback(async () => {
    const currentName = name.trim();
    const currentDomain = domain.trim();
    const currentSubdomain = subdomain.trim();

    await createDatabase({
      name: currentName,
      domain: currentDomain,
      subdomain: currentSubdomain || undefined,
    });
    card.close();
  }, [name, domain, subdomain, createDatabase, card]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation - access current state values
      const currentName = name.trim();
      const currentDomain = domain.trim();
      const currentSubdomain = subdomain.trim();

      if (!currentName) {
        mutation.setError('Database name is required.');
        return;
      }

      if (!currentDomain) {
        mutation.setError('Domain is required.');
        return;
      }

      const subdomainValidationError = getSubdomainError(currentSubdomain);
      if (subdomainValidationError) {
        setSubdomainError(subdomainValidationError);
        return;
      }

      // Execute with deferred loading state
      await mutation.execute(doCreate, getHumanReadableError);
    },
    [name, domain, subdomain, mutation, doCreate]
  );

  // Retry handler - stable reference
  const handleRetry = useCallback(() => {
    mutation.execute(doCreate, getHumanReadableError);
  }, [mutation, doCreate]);

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        {/*
          Form element handles disabled state via CSS, not via prop on each input.
          This prevents Input re-renders when isLoading changes.
        */}
        <form
          id='create-database-form'
          onSubmit={handleSubmit}
          className='space-y-5 p-6 transition-opacity duration-150'
          style={{ opacity: mutation.isLoading ? 0.6 : 1 }}
          inert={mutation.isLoading ? true : undefined}
        >
          {/*
            FormFields is memoized and receives stable callbacks.
            It will NOT re-render when isLoading or error changes.
          */}
          <FormFields
            name={name}
            onNameChange={handleNameChange}
            domain={domain}
            onDomainChange={handleDomainChange}
            subdomain={subdomain}
            onSubdomainChange={handleSubdomainChange}
            onSubdomainBlur={onSubdomainBlur}
            subdomainError={subdomainError}
          />

          {/*
            StatusArea is memoized and only re-renders when error/isLoading change.
            It's completely isolated from form field state.
          */}
          <StatusArea error={mutation.error} isLoading={mutation.isLoading} onRetry={handleRetry} />
        </form>
      </ScrollArea>

      {/* Footer actions */}
      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' disabled={mutation.isLoading} onClick={() => card.close()}>
          Cancel
        </Button>
        <Button
          type='submit'
          form='create-database-form'
          disabled={mutation.isLoading || !name.trim() || !domain.trim() || !isSubdomainValid}
          data-testid='db-create-submit'
          className='min-w-32.5'
        >
          {mutation.isLoading ? (
            <span className='flex items-center gap-2'>
              <Loader2Icon className='h-4 w-4 animate-spin' />
              Creating...
            </span>
          ) : (
            'Create Database'
          )}
        </Button>
      </div>
    </div>
  );
};
