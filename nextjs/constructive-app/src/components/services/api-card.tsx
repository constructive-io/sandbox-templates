'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Globe, Loader2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CardComponent } from '@constructive-io/ui/stack';

import { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { apiQueryKeys } from '@/lib/gql/hooks/schema-builder/apis/use-apis';
import { apiSchemaQueryKeys } from '@/lib/gql/hooks/schema-builder/apis/use-api-schemas';
import {
	invalidate,
	useCreateApiMutation,
	useCreateApiSchemaMutation,
	useUpdateApiMutation,
	useUpdateDomainMutation,
} from '@sdk/app-public';
import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
import { useUserDatabases } from '@/lib/gql/hooks/schema-builder/use-user-databases';
import { getRuntimeConfig } from '@/lib/runtime/get-runtime-config';
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
import { Switch } from '@constructive-io/ui/switch';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import { ApiSchemaLinker, type ApiSchemaLinkerRef } from './api-schema-linker';
import type { DomainItem } from './services.utils';

// API creation defaults (support Docker runtime injection)
const DEFAULT_DBNAME = getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_DBNAME')?.trim() || 'constructive';
const DEFAULT_ROLE_NAME = getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_ROLE_NAME')?.trim() || 'authenticated';
const DEFAULT_ANON_ROLE = getRuntimeConfig('NEXT_PUBLIC_DATABASE_SETUP_ANON_ROLE')?.trim() || 'anonymous';

export type ApiCardProps = {
  databaseId: string;
  domains: DomainItem[];
  schemas: DatabaseSchema[];
  editingApi: DatabaseService | null;
  onSuccess: () => void;
};

export const ApiCard: CardComponent<ApiCardProps> = ({ databaseId, domains, schemas, editingApi, onSuccess, card }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkerRef = useRef<ApiSchemaLinkerRef>(null);

  const queryClient = useQueryClient();
  const createApi = useCreateApiMutation({
    onSuccess: (result) => {
      const dbId = result.createApi?.api?.databaseId;
      if (dbId) {
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.byDatabase(dbId) });
      }
    },
  });
  const createApiSchema = useCreateApiSchemaMutation({
    onSuccess: (result) => {
      const apiId = result.createApiSchema?.apiSchema?.apiId;
      if (apiId) {
        queryClient.invalidateQueries({ queryKey: apiSchemaQueryKeys.byApi(apiId) });
      }
    },
  });
  const updateApi = useUpdateApiMutation({
    onSuccess: (result) => {
      const dbId = result.updateApi?.api?.databaseId;
      if (dbId) {
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.byDatabase(dbId) });
      }
    },
  });
  const updateDomain = useUpdateDomainMutation({
    onSuccess: () => invalidate.domain.lists(queryClient),
  });

  const { databases } = useUserDatabases({ enabled: Boolean(databaseId) });

  const currentDatabaseRecord = useMemo(() => databases.find((db) => db.id === databaseId), [databases, databaseId]);

  const schemaId = useMemo(() => {
    if (!currentDatabaseRecord) return undefined;

    const schemasNodes = currentDatabaseRecord.schemas?.nodes ?? [];
    return (
      schemasNodes.find((schema: any) => schema.schemaName === currentDatabaseRecord.schemaName)?.id ??
      schemasNodes.find((schema: any) => schema.name === 'public')?.id ??
      schemasNodes[0]?.id
    );
  }, [currentDatabaseRecord]);

  const domainOptions = useMemo(
    () =>
      domains.map((domain) => ({
        label: `${domain.subdomain}.${domain.domain}`,
        value: domain.id || '',
      })),
    [domains],
  );

  const selectedDomainOption = domainOptions.find((o) => o.value === selectedDomainId) ?? null;

  useEffect(() => {
    if (editingApi) {
      setName(editingApi.name || '');
      setIsPublic(editingApi.isPublic ?? false);
      const linkedDomain = domains.find((d) => d.apiId === editingApi.id);
      setSelectedDomainId(linkedDomain?.id || '');
    } else {
      setName('');
      setIsPublic(false);
      setSelectedDomainId('');
    }
  }, [editingApi, domains]);

  const isValid = name.trim() !== '';
  const isLoading =
    isSubmitting || createApi.isPending || createApiSchema.isPending || updateApi.isPending || updateDomain.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      showErrorToast({
        message: 'Invalid input',
        description: 'API name is required.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let apiId: string;

      if (editingApi) {
        const apiResult = await updateApi.mutateAsync({
          input: {
            id: editingApi.id,
            patch: {
              databaseId,
              name: name.trim(),
              roleName: DEFAULT_ROLE_NAME,
              anonRole: DEFAULT_ANON_ROLE,
              isPublic,
              dbname: DEFAULT_DBNAME,
            },
          },
        });
        apiId = apiResult.updateApi?.api?.id ?? editingApi.id;

        const previousDomain = domains.find((d) => d.apiId === editingApi.id);
        if (previousDomain && previousDomain.id && previousDomain.id !== selectedDomainId) {
          await updateDomain.mutateAsync({
            input: { id: previousDomain.id, patch: { apiId: null } },
          });
        }

        if (selectedDomainId && selectedDomainId !== previousDomain?.id) {
          await updateDomain.mutateAsync({
            input: { id: selectedDomainId, patch: { apiId } },
          });
        }

        // Submit schema link changes if any
        if (linkerRef.current) {
          const linkSuccess = await linkerRef.current.submit();
          if (!linkSuccess) {
            // Link changes failed but API update succeeded
            // Don't close so user can retry
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        const apiResult = await createApi.mutateAsync({
          input: {
            api: {
              databaseId,
              name: name.trim(),
              roleName: DEFAULT_ROLE_NAME,
              anonRole: DEFAULT_ANON_ROLE,
              isPublic,
              dbname: DEFAULT_DBNAME,
            },
          },
        });

        apiId = apiResult.createApi?.api?.id ?? '';

        if (apiId && schemaId) {
          await createApiSchema.mutateAsync({
            input: {
              apiSchema: {
                apiId,
                databaseId,
                schemaId,
              },
            },
          });
        }

        if (selectedDomainId && apiId) {
          await updateDomain.mutateAsync({
            input: { id: selectedDomainId, patch: { apiId } },
          });
        }
      }

      showSuccessToast({
        message: editingApi ? 'API updated successfully' : 'API created successfully',
        description: `${name.trim()} has been ${editingApi ? 'updated' : 'created'}.`,
      });

      onSuccess();
      card.close();
    } catch (error) {
      console.error(`Failed to ${editingApi ? 'update' : 'create'} API:`, error);
      showErrorToast({
        message: `Failed to ${editingApi ? 'update' : 'create'} API`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <form id='api-form' onSubmit={handleSubmit} className='space-y-4 p-6'>
          <div className='grid gap-2'>
            <Label htmlFor='api-name'>
              API Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='api-name'
              placeholder='e.g., users-api'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete='off'
              disabled={isLoading}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='domain'>Links to Domain</Label>
            <Combobox
              items={domainOptions}
              value={selectedDomainOption}
              onValueChange={(next) => setSelectedDomainId(next?.value ?? '')}
            >
              <ComboboxInput placeholder='Select a domain...' disabled={isLoading} />
              <ComboboxPopup>
                <ComboboxEmpty>No domains found.</ComboboxEmpty>
                <ComboboxList>
                  {(option: (typeof domainOptions)[number]) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Globe className='text-muted-foreground h-4 w-4' />
                <Label htmlFor='public-api' className='cursor-pointer text-sm font-medium'>
                  Public API
                </Label>
              </div>
              <Switch id='public-api' checked={isPublic} onCheckedChange={setIsPublic} disabled={isLoading} />
            </div>
          </div>

          {/* Schema Linking Section - only show when editing */}
          {editingApi && (
            <div className='border-border/80 border-t pt-6'>
              <ApiSchemaLinker
                ref={linkerRef}
                api={editingApi}
                schemas={schemas}
                databaseId={databaseId}
                onSuccess={onSuccess}
              />
            </div>
          )}
        </form>
      </ScrollArea>

      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' disabled={isLoading} onClick={() => card.close()}>
          Cancel
        </Button>
        <Button type='submit' form='api-form' disabled={isLoading || !isValid}>
          {isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
