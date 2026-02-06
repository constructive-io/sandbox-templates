'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import type { CardComponent } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { Database, Loader2Icon } from 'lucide-react';

import {
	useCreatePolicyField,
	type PolicyFieldType,
} from '@/lib/gql/hooks/schema-builder/policies/use-create-policy-field';
import type { TableField } from '@/lib/gql/hooks/schema-builder/policies/use-database-policies';

export type CreateFieldCardProps = {
	databaseId: string;
	tableId: string;
	tableName: string;
	fieldType: PolicyFieldType;
	existingFields?: TableField[];
	onFieldCreated?: (fieldName: string) => void;
};

export const CreateFieldCard: CardComponent<CreateFieldCardProps> = ({
	databaseId,
	tableId,
	tableName,
	fieldType,
	existingFields = [],
	onFieldCreated,
	card,
}) => {
	const [fieldName, setFieldName] = useState('');
	const createFieldMutation = useCreatePolicyField();
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			inputRef.current?.focus();
		}, 200);
		return () => clearTimeout(timeoutId);
	}, []);

	const isFormValid = fieldName.trim().length > 0;
	const fieldTypeLabel = fieldType === 'uuid[]' ? 'UUID Array' : 'UUID';
	const fieldExample = fieldType === 'uuid[]' ? 'member_ids' : 'owner_id';

	// Group existing fields by type
	const fieldsByType = useMemo(() => {
		const uuidFields = existingFields.filter((f) => f.type === 'uuid');
		const uuidArrayFields = existingFields.filter((f) => f.type === 'uuid[]');
		const otherFields = existingFields.filter((f) => f.type !== 'uuid' && f.type !== 'uuid[]');
		return { uuidFields, uuidArrayFields, otherFields };
	}, [existingFields]);

	const handleSubmit = async () => {
		if (!isFormValid || !databaseId || !tableId) return;

		try {
			const result = await createFieldMutation.mutateAsync({
				name: fieldName.trim(),
				tableId,
				databaseId,
				fieldType,
			});

			showSuccessToast({
				message: 'Field created successfully!',
				description: `Field "${result.name}" has been created on table "${tableName}".`,
			});

			onFieldCreated?.(result.name);
			card.close();
		} catch (error) {
			showErrorToast({
				message: 'Failed to create field',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			{/* Content */}
			<form onSubmit={handleSubmit} className='flex-1 overflow-y-auto px-4 py-4'>
				<div className='space-y-6'>
					{/* Field Name Input */}
					<div className='space-y-1.5'>
						<Label htmlFor='field-name'>Field name</Label>
						<Input
							ref={inputRef}
							id='field-name'
							placeholder={`e.g., ${fieldExample}`}
							autoComplete='off'
							value={fieldName}
							onChange={(e) => setFieldName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && isFormValid) {
									void handleSubmit();
								}
							}}
							className='font-mono'
						/>
					</div>

					{/* Field Type Info */}
					<div className='bg-muted/30 rounded-lg border p-3'>
						<div className='flex items-center gap-2'>
							<Database className='text-muted-foreground h-4 w-4' />
							<div className='flex-1'>
								<p className='text-sm font-medium'>Field Type</p>
								<p className='text-muted-foreground text-xs'>{fieldTypeLabel}</p>
							</div>
						</div>
					</div>

					{/* Existing Fields */}
					{existingFields.length > 0 && (
						<div className='space-y-2'>
							<Label className='text-xs'>Existing fields in {tableName}</Label>
							<div className='rounded-lg border p-2'>
								<div className='scrollbar-neutral-thin max-h-[150px] space-y-1 overflow-y-auto'>
									{fieldType === 'uuid' && fieldsByType.uuidFields.length > 0 && (
										<>
											<p className='text-muted-foreground px-2 py-1 text-xs font-medium'>UUID fields</p>
											{fieldsByType.uuidFields.map((field) => (
												<div key={field.name} className='hover:bg-muted rounded px-2 py-1 font-mono text-xs'>
													{field.name}
												</div>
											))}
										</>
									)}
									{fieldType === 'uuid[]' && fieldsByType.uuidArrayFields.length > 0 && (
										<>
											<p className='text-muted-foreground px-2 py-1 text-xs font-medium'>UUID[] fields</p>
											{fieldsByType.uuidArrayFields.map((field) => (
												<div key={field.name} className='hover:bg-muted rounded px-2 py-1 font-mono text-xs'>
													{field.name}
												</div>
											))}
										</>
									)}
									{(fieldType === 'uuid' ? fieldsByType.uuidFields : fieldsByType.uuidArrayFields).length === 0 && (
										<p className='text-muted-foreground px-2 py-1 text-xs italic'>
											No {fieldTypeLabel.toLowerCase()} fields yet
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</form>

			{/* Footer */}
			<div className='flex justify-end gap-2 border-t px-4 py-3'>
				<Button variant='outline' onClick={() => card.close()} disabled={createFieldMutation.isPending}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} disabled={createFieldMutation.isPending || !isFormValid}>
					{createFieldMutation.isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
					{createFieldMutation.isPending ? 'Creating...' : 'Create Field'}
				</Button>
			</div>
		</div>
	);
};
