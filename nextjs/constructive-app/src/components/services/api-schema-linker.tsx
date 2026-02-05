'use client';

import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
import { databaseSchemasQueryKeys } from '@/lib/gql/hooks/schema-builder/schemas';
import {
	useCreateApiSchemaMutation,
	useDeleteApiSchemaByApiIdAndSchemaIdMutation,
} from '@sdk/app-public';
import { apiSchemaQueryKeys } from '@/lib/gql/hooks/schema-builder/apis/use-api-schemas';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { Label } from '@constructive-io/ui/label';
import { MultiSelect } from '@constructive-io/ui/multi-select';
import { showErrorToast } from '@constructive-io/ui/toast';
import { showSuccessToast } from '@constructive-io/ui/toast';

export interface ApiSchemaLinkerProps {
  api: DatabaseService;
  schemas: DatabaseSchema[];
  databaseId: string;
  onSuccess: () => void;
}

export interface ApiSchemaLinkerRef {
  /** Submit pending link/unlink changes. Returns true if successful. */
  submit: () => Promise<boolean>;
  /** Check if there are pending changes */
  hasPendingChanges: () => boolean;
  /** Check if currently submitting */
  isSubmitting: () => boolean;
}

export const ApiSchemaLinker = forwardRef<ApiSchemaLinkerRef, ApiSchemaLinkerProps>(
  function ApiSchemaLinker({ api, schemas, databaseId, onSuccess }, ref) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedSchemaIds, setSelectedSchemaIds] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const queryClient = useQueryClient();

    const createApiSchema = useCreateApiSchemaMutation({
      onSuccess: (result) => {
        const apiId = result.createApiSchema?.apiSchema?.apiId;
        if (apiId) {
          queryClient.invalidateQueries({ queryKey: apiSchemaQueryKeys.byApi(apiId) });
        }
      },
    });
    const unlinkSchemaFromApi = useDeleteApiSchemaByApiIdAndSchemaIdMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: databaseSchemasQueryKeys.byDatabase(databaseId) });
        queryClient.invalidateQueries({ queryKey: ['database-services'] });
      },
    });

    // Get currently linked schema IDs from the API's apiSchemas
    const linkedSchemas = useMemo(() => api.apiSchemas?.nodes || [], [api.apiSchemas?.nodes]);
    const originalLinkedSchemaIds = useMemo(() => linkedSchemas.map((link: any) => link.schemaId), [linkedSchemas]);

    // Initialize selected state from original on first render
    const effectiveSelectedIds = isInitialized ? selectedSchemaIds : originalLinkedSchemaIds;

    // Build options for MultiSelect from all available schemas
    const schemaOptions = useMemo(
      () =>
        schemas.map((schema) => ({
          label: schema.name,
          value: schema.id,
          description: schema.schemaName,
        })),
      [schemas],
    );

    // Check if there are pending changes
    const hasPendingChanges = useCallback(() => {
      const currentSet = new Set(originalLinkedSchemaIds);
      const selectedSet = new Set(effectiveSelectedIds);
      if (currentSet.size !== selectedSet.size) return true;
      for (const id of currentSet) {
        if (!selectedSet.has(id)) return true;
      }
      return false;
    }, [originalLinkedSchemaIds, effectiveSelectedIds]);

    // Handle local selection changes (no mutations yet)
    const handleValueChange = useCallback((newSelectedIds: string[]) => {
      setSelectedSchemaIds(newSelectedIds);
      setIsInitialized(true);
    }, []);

    // Submit pending changes
    const submit = useCallback(async (): Promise<boolean> => {
      const currentIds = new Set(originalLinkedSchemaIds);
      const newIds = new Set(effectiveSelectedIds);

      // Find schemas to link (in new but not in current)
      const toLink = effectiveSelectedIds.filter((id) => !currentIds.has(id));
      // Find schemas to unlink (in current but not in new)
      const toUnlink = originalLinkedSchemaIds.filter((id) => !newIds.has(id));

      // No changes to submit
      if (toLink.length === 0 && toUnlink.length === 0) return true;

      setIsProcessing(true);

      try {
        // Execute all link mutations
        const linkPromises = toLink.map(async (schemaId) => {
          await createApiSchema.mutateAsync({
            input: {
              apiSchema: {
                apiId: api.id,
                databaseId,
                schemaId,
              },
            },
          });
          return schemaId;
        });

        // Execute all unlink mutations
        const unlinkPromises = toUnlink.map(async (schemaId) => {
          await unlinkSchemaFromApi.mutateAsync({
            input: { apiId: api.id, schemaId },
          });
          return schemaId;
        });

        // Wait for all mutations to complete
        const results = await Promise.allSettled([...linkPromises, ...unlinkPromises]);

        // Count successes and failures
        const failed = results.filter((r) => r.status === 'rejected').length;

        if (failed > 0) {
          showErrorToast({
            message: 'Some schema link operations failed',
            description: `${failed} of ${results.length} operations failed.`,
          });
          return false;
        }

        // Show success message for link changes
        const linkedCount = toLink.length;
        const unlinkedCount = toUnlink.length;
        if (linkedCount > 0 || unlinkedCount > 0) {
          const parts = [];
          if (linkedCount > 0) parts.push(`${linkedCount} schema${linkedCount > 1 ? 's' : ''} linked`);
          if (unlinkedCount > 0) parts.push(`${unlinkedCount} schema${unlinkedCount > 1 ? 's' : ''} unlinked`);
          showSuccessToast({
            message: 'Schema links updated',
            description: parts.join(', '),
          });
        }

        onSuccess();
        return true;
      } catch (error) {
        console.error('Failed to update schema links:', error);
        showErrorToast({
          message: 'Failed to update schema links',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
        return false;
      } finally {
        setIsProcessing(false);
      }
    }, [originalLinkedSchemaIds, effectiveSelectedIds, api.id, databaseId, createApiSchema, unlinkSchemaFromApi, onSuccess]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        submit,
        hasPendingChanges,
        isSubmitting: () => isProcessing,
      }),
      [submit, hasPendingChanges, isProcessing],
    );

    const isLoading = isProcessing || createApiSchema.isPending || unlinkSchemaFromApi.isPending;

    return (
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Database className='text-muted-foreground h-4 w-4' />
          <Label className='text-sm font-medium'>Linked Schemas</Label>
          {isLoading && <Loader2 className='text-muted-foreground h-3 w-3 animate-spin' />}
        </div>

        {schemas.length > 0 ? (
          <MultiSelect
            options={schemaOptions}
            defaultValue={originalLinkedSchemaIds}
            onValueChange={handleValueChange}
            placeholder='Select schemas to link...'
            searchable
            disabled={isLoading}
            maxCount={5}
            emptyIndicator='No schemas found'
          />
        ) : (
          <p className='text-muted-foreground text-sm'>
            No schemas available. Create a schema first to link it to this API.
          </p>
        )}

        {schemas.length > 0 && effectiveSelectedIds.length === 0 && (
          <p className='text-muted-foreground text-xs'>No schemas are currently linked to this API.</p>
        )}
      </div>
    );
  },
);
