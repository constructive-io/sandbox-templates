'use client';

import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
import { databaseSchemasQueryKeys } from '@/lib/gql/hooks/schema-builder/schemas';
import {
	useCreateApiSchemaMutation,
	useDeleteApiSchemaByApiIdAndSchemaIdMutation,
} from '@sdk/api';
import { apiSchemaQueryKeys } from '@/lib/gql/hooks/schema-builder/apis/use-api-schemas';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { Label } from '@constructive-io/ui/label';
import { MultiSelect } from '@constructive-io/ui/multi-select';
import { showErrorToast } from '@constructive-io/ui/toast';
import { showSuccessToast } from '@constructive-io/ui/toast';

export interface SchemaApiLinkerProps {
  schema: DatabaseSchema;
  services: DatabaseService[];
  databaseId: string;
  onSuccess: () => void;
}

export interface SchemaApiLinkerRef {
  /** Submit pending link/unlink changes. Returns true if successful. */
  submit: () => Promise<boolean>;
  /** Check if there are pending changes */
  hasPendingChanges: () => boolean;
  /** Check if currently submitting */
  isSubmitting: () => boolean;
}

export const SchemaApiLinker = forwardRef<SchemaApiLinkerRef, SchemaApiLinkerProps>(
  function SchemaApiLinker({ schema, services, databaseId, onSuccess }, ref) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);
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

    const linkedApis = useMemo(() => schema.apiSchemas?.nodes || [], [schema.apiSchemas?.nodes]);
    const originalLinkedApiIds = useMemo(() => linkedApis.map((link: any) => link.apiId), [linkedApis]);

    // Initialize selected state from original on first render
    const effectiveSelectedIds = isInitialized ? selectedApiIds : originalLinkedApiIds;

    // Build options for MultiSelect from all available APIs
    const apiOptions = useMemo(
      () =>
        services.map((service) => ({
          label: service.name,
          value: service.id,
        })),
      [services],
    );

    // Check if there are pending changes
    const hasPendingChanges = useCallback(() => {
      const currentSet = new Set(originalLinkedApiIds);
      const selectedSet = new Set(effectiveSelectedIds);
      if (currentSet.size !== selectedSet.size) return true;
      for (const id of currentSet) {
        if (!selectedSet.has(id)) return true;
      }
      return false;
    }, [originalLinkedApiIds, effectiveSelectedIds]);

    // Handle local selection changes (no mutations yet)
    const handleValueChange = useCallback((newSelectedIds: string[]) => {
      setSelectedApiIds(newSelectedIds);
      setIsInitialized(true);
    }, []);

    // Submit pending changes
    const submit = useCallback(async (): Promise<boolean> => {
      const currentIds = new Set(originalLinkedApiIds);
      const newIds = new Set(effectiveSelectedIds);

      // Find APIs to link (in new but not in current)
      const toLink = effectiveSelectedIds.filter((id) => !currentIds.has(id));
      // Find APIs to unlink (in current but not in new)
      const toUnlink = originalLinkedApiIds.filter((id) => !newIds.has(id));

      // No changes to submit
      if (toLink.length === 0 && toUnlink.length === 0) return true;

      setIsProcessing(true);

      try {
        // Execute all link mutations
        const linkPromises = toLink.map(async (apiId) => {
          await createApiSchema.mutateAsync({
            input: {
              apiSchema: {
                apiId,
                databaseId,
                schemaId: schema.id,
              },
            },
          });
          return apiId;
        });

        // Execute all unlink mutations
        const unlinkPromises = toUnlink.map(async (apiId) => {
          const link = linkedApis.find((l) => l.apiId === apiId);
          if (!link) return null;

          await unlinkSchemaFromApi.mutateAsync({
            input: { apiId: link.apiId, schemaId: schema.id },
          });
          return apiId;
        });

        // Wait for all mutations to complete
        const results = await Promise.allSettled([...linkPromises, ...unlinkPromises]);

        // Count successes and failures
        const failed = results.filter((r) => r.status === 'rejected').length;

        if (failed > 0) {
          showErrorToast({
            message: 'Some API link operations failed',
            description: `${failed} of ${results.length} operations failed.`,
          });
          return false;
        }

        // Show success message for link changes
        const linkedCount = toLink.length;
        const unlinkedCount = toUnlink.length;
        if (linkedCount > 0 || unlinkedCount > 0) {
          const parts = [];
          if (linkedCount > 0) parts.push(`${linkedCount} API${linkedCount > 1 ? 's' : ''} linked`);
          if (unlinkedCount > 0) parts.push(`${unlinkedCount} API${unlinkedCount > 1 ? 's' : ''} unlinked`);
          showSuccessToast({
            message: 'API links updated',
            description: parts.join(', '),
          });
        }

        onSuccess();
        return true;
      } catch (error) {
        console.error('Failed to update API links:', error);
        showErrorToast({
          message: 'Failed to update API links',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
        return false;
      } finally {
        setIsProcessing(false);
      }
    }, [
      originalLinkedApiIds,
      effectiveSelectedIds,
      linkedApis,
      schema.id,
      databaseId,
      createApiSchema,
      unlinkSchemaFromApi,
      onSuccess,
    ]);

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
          <Link2 className='text-muted-foreground h-4 w-4' />
          <Label className='text-sm font-medium'>Linked APIs</Label>
          {isLoading && <Loader2 className='text-muted-foreground h-3 w-3 animate-spin' />}
        </div>

        {services.length > 0 ? (
          <MultiSelect
            options={apiOptions}
            defaultValue={originalLinkedApiIds}
            onValueChange={handleValueChange}
            placeholder='Select APIs to link...'
            searchable
            disabled={isLoading}
            maxCount={5}
            emptyIndicator='No APIs found'
          />
        ) : (
          <p className='text-muted-foreground text-sm'>
            No APIs available. Create an API first to link it to this schema.
          </p>
        )}

        {services.length > 0 && effectiveSelectedIds.length === 0 && (
          <p className='text-muted-foreground text-xs'>No APIs are currently linked to this schema.</p>
        )}
      </div>
    );
  },
);
