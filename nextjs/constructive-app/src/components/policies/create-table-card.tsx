'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import type { CardComponent } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Loader2Icon } from 'lucide-react';

import { useCreatePolicyTable } from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-table';

export type CreateTableCardProps = {
	databaseId: string;
	schemaId: string;
	onTableCreated?: (tableName: string) => void;
};

export const CreateTableCard: CardComponent<CreateTableCardProps> = ({
	databaseId,
	schemaId,
	onTableCreated,
	card,
}) => {
	const [tableName, setTableName] = useState('');
	const createTableMutation = useCreatePolicyTable();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	const isFormValid = tableName.trim().length > 0;

	const handleSubmit = async () => {
		if (!isFormValid || !databaseId) return;

		try {
			const result = await createTableMutation.mutateAsync({
				name: tableName.trim(),
				databaseId,
				schemaId,
			});

			showSuccessToast({
				message: 'Table created successfully!',
				description: `Table "${result.name}" has been created.`,
			});

			onTableCreated?.(result.name);
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to create table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			{/* Content */}
			<form onSubmit={handleSubmit} className='flex flex-1 flex-col'>
				<div className='flex-1 space-y-4 p-4'>
					<div className='space-y-1.5'>
						<Label htmlFor='table-name'>Table name</Label>
						<Input
							ref={inputRef}
							id='table-name'
							placeholder='Enter table name'
							autoComplete='off'
							value={tableName}
							onChange={(e) => setTableName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && isFormValid) {
									void handleSubmit();
								}
							}}
						/>
					</div>
				</div>
			</form>

			{/* Footer */}
			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button variant='outline' onClick={() => card.close()} disabled={createTableMutation.isPending}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={createTableMutation.isPending || !isFormValid}>
					{createTableMutation.isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
					{createTableMutation.isPending ? 'Creating...' : 'Create Table'}
				</Button>
			</div>
		</div>
	);
};
