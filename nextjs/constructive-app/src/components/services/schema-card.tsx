'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CardComponent } from '@constructive-io/ui/stack';

import type { DatabaseSchema } from '@/lib/gql/hooks/schema-builder/schemas';
import { databaseSchemasQueryKeys } from '@/lib/gql/hooks/schema-builder/schemas';
import {
	useCreateSchemaMutation,
	useUpdateSchemaMutation,
} from '@sdk/app-public';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Textarea } from '@constructive-io/ui/textarea';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import { SchemaApiLinker, type SchemaApiLinkerRef } from './schema-api-linker';

export type SchemaCardProps = {
  databaseId: string;
  services: DatabaseService[];
  editingSchema: DatabaseSchema | null;
  onSuccess: () => void;
};

export const SchemaCard: CardComponent<SchemaCardProps> = ({
  databaseId,
  services,
  editingSchema,
  onSuccess,
  card,
}) => {
  const isEditing = !!editingSchema;

  const [name, setName] = useState('');
  const [schemaName, setSchemaName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkerRef = useRef<SchemaApiLinkerRef>(null);
  const queryClient = useQueryClient();

  const createSchema = useCreateSchemaMutation({
    onSuccess: (result) => {
      const dbId = result.createSchema?.schema?.databaseId;
      if (dbId) {
        queryClient.invalidateQueries({ queryKey: databaseSchemasQueryKeys.byDatabase(dbId) });
      }
    },
  });
  const updateSchema = useUpdateSchemaMutation({
    onSuccess: (result) => {
      const dbId = result.updateSchema?.schema?.databaseId;
      if (dbId) {
        queryClient.invalidateQueries({ queryKey: databaseSchemasQueryKeys.byDatabase(dbId) });
      }
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingSchema) {
      setName(editingSchema.name || '');
      setSchemaName(editingSchema.schemaName || '');
      setLabel(editingSchema.label || '');
      setDescription(editingSchema.description || '');
    } else {
      setName('');
      setSchemaName('');
      setLabel('');
      setDescription('');
    }
  }, [editingSchema]);

  const isValid = name.trim() !== '' && (isEditing || schemaName.trim() !== '');
  const isLoading = isSubmitting || createSchema.isPending || updateSchema.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      showErrorToast({
        message: 'Invalid input',
        description: isEditing ? 'Schema name is required.' : 'Schema name and schema identifier are required.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateSchema.mutateAsync({
          input: {
            id: editingSchema.id,
            patch: {
              // name is not editable after creation
              label: label.trim() || null,
              description: description.trim() || null,
            },
          },
        });

        // Submit API link changes if any
        if (linkerRef.current) {
          const linkSuccess = await linkerRef.current.submit();
          if (!linkSuccess) {
            // Link changes failed but schema update succeeded
            // Don't close so user can retry
            setIsSubmitting(false);
            return;
          }
        }

        showSuccessToast({
          message: 'Schema updated successfully',
          description: `${name.trim()} has been updated.`,
        });
      } else {
        await createSchema.mutateAsync({
          input: {
            schema: {
              databaseId,
              name: name.trim(),
              schemaName: schemaName.trim(),
              label: label.trim() || null,
              description: description.trim() || null,
            },
          },
        });

        showSuccessToast({
          message: 'Schema created successfully',
          description: `${name.trim()} has been created.`,
        });
      }

      onSuccess();
      card.close();
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} schema:`, error);
      showErrorToast({
        message: `Failed to ${isEditing ? 'update' : 'create'} schema`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <form id='schema-form' onSubmit={handleSubmit} className='space-y-4 p-6'>
          <div className='grid gap-2'>
            <Label htmlFor='schema-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='schema-name'
              placeholder='e.g., User Data Schema'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete='off'
              disabled={isLoading || isEditing}
              className={isEditing ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className='text-muted-foreground text-xs'>
              {isEditing ? 'The schema name cannot be changed after creation.' : 'A friendly name for this schema.'}
            </p>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='schema-identifier'>
              Schema Identifier <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='schema-identifier'
              placeholder='e.g., user_data'
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              required={!isEditing}
              autoComplete='off'
              disabled={isLoading || isEditing}
              className={isEditing ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className='text-muted-foreground text-xs'>
              {isEditing
                ? 'The PostgreSQL schema identifier cannot be changed after creation.'
                : 'The PostgreSQL schema name (e.g., "public", "app_data"). Use lowercase with underscores.'}
            </p>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='schema-label'>Label</Label>
            <Input
              id='schema-label'
              placeholder='e.g., User Data'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoComplete='off'
              disabled={isLoading}
            />
            <p className='text-muted-foreground text-xs'>Optional display label for the schema.</p>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='schema-description'>Description</Label>
            <Textarea
              id='schema-description'
              placeholder='Describe what this schema is used for...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* API Linking Section - only show when editing */}
          {isEditing && editingSchema && (
            <div className='border-border/80 border-t pt-6'>
              <SchemaApiLinker
                ref={linkerRef}
                schema={editingSchema}
                services={services}
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
        <Button type='submit' form='schema-form' disabled={isLoading || !isValid}>
          {isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
