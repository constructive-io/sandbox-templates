'use client';

import { Loader2Icon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@constructive-io/ui/alert-dialog';
import { Button } from '@constructive-io/ui/button';
import { showErrorToast } from '@constructive-io/ui/toast';
import { showSuccessToast } from '@constructive-io/ui/toast';

interface DeleteDatabaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  databaseId: string | null;
  databaseName: string | null;
  deleteDatabase: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteDatabaseDialog({
  isOpen,
  onOpenChange,
  databaseId,
  databaseName,
  deleteDatabase,
  isLoading = false,
}: DeleteDatabaseDialogProps) {
  const handleConfirmDelete = async () => {
    if (!databaseId || !databaseName) return;

    try {
      await deleteDatabase(databaseId);

      onOpenChange(false);

      showSuccessToast({
        message: 'Database deleted successfully!',
        description: `Database "${databaseName}" has been removed.`,
      });
    } catch (error) {
      console.error('Failed to delete database:', error);
      showErrorToast({
        message: 'Failed to delete database',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Database</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete database <strong>&quot;{databaseName}&quot;</strong>? This action cannot be
            undone and will permanently remove the database, all its schemas, tables, and data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <Button variant='destructive' onClick={handleConfirmDelete} disabled={isLoading || !databaseId}>
            {isLoading && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Deleting...' : 'Delete Database'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
