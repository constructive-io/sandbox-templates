'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2Icon, Server } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CardComponent } from '@constructive-io/ui/stack';

import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import {
	invalidate,
	useCreateDomainMutation,
	useUpdateDomainMutation,
} from '@sdk/app-public';
import { getSubdomainError, isValidSubdomain } from '@/lib/validation/hostname';
import { Button } from '@constructive-io/ui/button';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from '@constructive-io/ui/combobox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import type { DomainItem } from './services.utils';

export type DomainCardProps = {
  databaseId: string;
  services: DatabaseService[];
  editingDomain: DomainItem | null;
  onSuccess: () => void;
};

export const DomainCard: CardComponent<DomainCardProps> = ({
  databaseId,
  services,
  editingDomain,
  onSuccess,
  card,
}) => {
  const [subdomain, setSubdomain] = useState('');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [selectedApiId, setSelectedApiId] = useState<string>('');

  const queryClient = useQueryClient();
  const createDomain = useCreateDomainMutation({
    onSuccess: () => invalidate.domain.lists(queryClient),
  });
  const updateDomain = useUpdateDomainMutation({
    onSuccess: () => invalidate.domain.lists(queryClient),
  });

  const isEditMode = !!editingDomain;

  const apiOptions = useMemo(
    () =>
      services.map((service) => ({
        label: service.name,
        value: service.id,
      })),
    [services],
  );

  const selectedApiOption = apiOptions.find((o) => o.value === selectedApiId) ?? null;

  const handleSubdomainBlur = () => {
    const error = getSubdomainError(subdomain.trim());
    setSubdomainError(error);
  };

  const isSubdomainValid = subdomain.trim() !== '' && isValidSubdomain(subdomain.trim());
  const isValid = isSubdomainValid && domain.trim() !== '';
  const isLoading = createDomain.isPending || updateDomain.isPending;

  useEffect(() => {
    if (editingDomain) {
      setSubdomain(editingDomain.subdomain || '');
      setDomain(editingDomain.domain || '');
      setSelectedApiId(editingDomain.apiId || '');
    }
  }, [editingDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const subdomainValidationError = getSubdomainError(subdomain.trim());
    if (subdomain.trim() && subdomainValidationError) {
      setSubdomainError(subdomainValidationError);
      showErrorToast({
        message: 'Invalid subdomain',
        description: subdomainValidationError,
      });
      return;
    }

    if (!isValid) {
      showErrorToast({
        message: 'Invalid input',
        description: 'Both subdomain and domain are required.',
      });
      return;
    }

    try {
      if (isEditMode && editingDomain && editingDomain.id) {
        await updateDomain.mutateAsync({
          input: {
            id: editingDomain.id,
            patch: {
              domain: domain.trim(),
              subdomain: subdomain.trim(),
              apiId: selectedApiId || null,
            },
          },
        });

        showSuccessToast({
          message: 'Domain updated successfully',
          description: `${subdomain.trim()}.${domain.trim()} has been updated.`,
        });
      } else {
        await createDomain.mutateAsync({
          input: {
            domain: {
              databaseId,
              domain: domain.trim(),
              subdomain: subdomain.trim(),
              apiId: selectedApiId || null,
            },
          },
        });

        showSuccessToast({
          message: 'Domain created successfully',
          description: `${subdomain.trim()}.${domain.trim()} has been created.`,
        });
      }

      onSuccess();
      card.close();
    } catch (error) {
      console.error('Failed to save domain:', error);
      showErrorToast({
        message: isEditMode ? 'Failed to update domain' : 'Failed to create domain',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <form id='domain-form' onSubmit={handleSubmit} className='space-y-6 p-6'>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <div className='grid grid-cols-2 gap-2'>
                <Label htmlFor='subdomain'>
                  Subdomain <span className='text-destructive'>*</span>
                </Label>
                <Label htmlFor='domain'>
                  Domain <span className='text-destructive'>*</span>
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  id='subdomain'
                  placeholder='e.g. api'
                  value={subdomain}
                  onChange={(e) => {
                    setSubdomain(e.target.value);
                    if (subdomainError) setSubdomainError(null);
                  }}
                  onBlur={handleSubdomainBlur}
                  required
                  autoComplete='off'
                  disabled={isLoading}
                  aria-invalid={!!subdomainError}
                  aria-describedby={subdomainError ? 'subdomain-error' : undefined}
                  className={`flex-1 ${subdomainError ? 'border-destructive' : ''}`}
                />
                <span className='text-muted-foreground self-end text-sm'>.</span>
                <Input
                  id='domain'
                  placeholder='e.g. example.com'
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  autoComplete='off'
                  disabled={isLoading}
                  className='flex-1'
                />
              </div>
              {subdomainError && (
                <p id='subdomain-error' className='text-destructive text-xs'>
                  {subdomainError}
                </p>
              )}
            </div>
          </div>

          <div className='border-border/80 border-t pt-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Server className='text-muted-foreground h-4 w-4' />
                <Label className='text-sm font-medium'>Linked API</Label>
              </div>

              {apiOptions.length > 0 ? (
                <Combobox
                  items={apiOptions}
                  value={selectedApiOption}
                  onValueChange={(next) => setSelectedApiId(next?.value ?? '')}
                >
                  <ComboboxInput placeholder='Search APIs...' disabled={isLoading} />
                  <ComboboxPopup>
                    <ComboboxEmpty>No APIs found</ComboboxEmpty>
                    <ComboboxList>
                      {(option: (typeof apiOptions)[number]) => (
                        <ComboboxItem key={option.value} value={option}>
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxPopup>
                </Combobox>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  No APIs available. Create an API first to link it to this domain.
                </p>
              )}

              {apiOptions.length > 0 && !selectedApiId && (
                <p className='text-muted-foreground text-xs'>No API is currently linked to this domain.</p>
              )}
            </div>
          </div>
        </form>
      </ScrollArea>

      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' disabled={isLoading} onClick={() => card.close()}>
          Cancel
        </Button>
        <Button type='submit' form='domain-form' disabled={isLoading || !isValid}>
          {isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
