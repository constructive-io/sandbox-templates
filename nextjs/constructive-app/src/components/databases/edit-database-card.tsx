'use client';

import { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';

import type { CardComponent } from '@constructive-io/ui/stack';

import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

export type EditDatabaseCardProps = {
  databaseId: string;
  databaseName: string;
  databaseLabel?: string | null;
  updateDatabase: (id: string, name: string, label: string | null) => Promise<void>;
};

export const EditDatabaseCard: CardComponent<EditDatabaseCardProps> = ({
  databaseId,
  databaseName,
  databaseLabel,
  updateDatabase,
  card,
}) => {
  const [name, setName] = useState(databaseName);
  const [label, setLabel] = useState(databaseLabel ?? '');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if props change (e.g., card re-opened with different database)
  useEffect(() => {
    setName(databaseName);
    setLabel(databaseLabel ?? '');
  }, [databaseName, databaseLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showErrorToast({
        message: 'Database name is required',
        description: 'Please enter a name for the database.',
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateDatabase(databaseId, name.trim(), label.trim() || null);

      showSuccessToast({
        message: 'Database updated successfully!',
        description: label.trim() ? `Database "${label}" has been updated.` : `Database "${name}" has been updated.`,
      });

      card.close();
    } catch (error) {
      console.error('Failed to update database:', error);
      showErrorToast({
        message: 'Failed to update database',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <form id='edit-database-form' onSubmit={handleSubmit} className='flex-1 space-y-4 p-6'>
        <div className='grid gap-2'>
          <Label htmlFor='label'>Display name</Label>
          <Input
            id='label'
            placeholder='My Database'
            value={label}
            autoFocus
            autoComplete='off'
            onChange={(e) => setLabel(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='name'>
            Name <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='name'
            placeholder='my_database'
            value={name}
            autoComplete='off'
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </form>

      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' onClick={() => card.close()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type='submit' form='edit-database-form' disabled={isLoading || !name.trim()}>
          {isLoading && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
