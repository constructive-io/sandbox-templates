'use client';

import { useMemo, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { RiInformationLine } from '@remixicon/react';
import { toast } from 'sonner';

import type { CardComponent } from '@constructive-io/ui/stack';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { useCreateTable, type CreateTableData } from '@/lib/gql/hooks/schema-builder/use-create-table';
import { useEntityParams } from '@/lib/navigation';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Switch } from '@constructive-io/ui/switch';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import { buildOrgDatabaseRoute } from '@/app-routes';

export type CreateTableCardProps = {
	onTableCreated?: (table: { id: string; name: string }) => void;
};

interface CreateTableFormData {
	name: string;
	useRls: boolean;
}

export const CreateTableCard: CardComponent<CreateTableCardProps> = ({ onTableCreated, card }) => {
	const router = useRouter();
	const { orgId, databaseId } = useEntityParams();
	const [formData, setFormData] = useState<CreateTableFormData>({
		name: '',
		useRls: false,
	});

	const createTableMutation = useCreateTable();
	const { selectedSchemaKey, availableSchemas, currentSchema, currentDatabase } = useSchemaBuilderSelectors();

	const existingTableNames = useMemo(
		() => new Set((currentSchema?.tables || []).map((table) => table.name.toLowerCase())),
		[currentSchema?.tables],
	);
	const trimmedName = formData.name.trim();
	const isDuplicate = trimmedName && existingTableNames.has(trimmedName.toLowerCase());
	const isValidName = trimmedName && !isDuplicate;

	const handleInputChange = (field: keyof CreateTableFormData, value: string | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			showErrorToast({
				message: 'Table name is required',
				description: 'Please enter a name for the table.',
			});
			return;
		}

		const selectedSchema = availableSchemas.find((schema) => schema.key === selectedSchemaKey) || null;

		const currentDatabaseId =
			currentDatabase?.databaseId ?? selectedSchema?.databaseInfo?.id ?? selectedSchema?.dbSchema?.id ?? null;

		if (!currentDatabaseId) {
			showErrorToast({
				message: 'No database selected',
				description: 'Please ensure you have selected a database schema.',
			});
			return;
		}

		const inferredSchemaId =
			currentDatabase?.schemaId ??
			selectedSchema?.databaseInfo?.schemaId ??
			selectedSchema?.dbSchema?.metadata?.schemaId ??
			null;

		if (!inferredSchemaId) {
			const servicesRoute =
				orgId && currentDatabaseId
					? buildOrgDatabaseRoute('ORG_DATABASE_SERVICES', orgId, currentDatabaseId)
					: null;

			toast.error('No public schema found', {
				description:
					'This database requires a schema named "public" to create tables. Please create one in Services → Schemas.',
				duration: Infinity,
				action: servicesRoute
					? {
							label: 'Go to Services',
							onClick: () => {
								toast.dismiss();
								router.push(servicesRoute as Route);
							},
						}
					: undefined,
			});
			return;
		}

		const tableInput: CreateTableData = {
			name: formData.name.trim(),
			useRls: formData.useRls || false,
			databaseId: currentDatabaseId,
			schemaId: inferredSchemaId,
		};

		try {
			const result = await createTableMutation.mutateAsync(tableInput);

			showSuccessToast({
				message: 'Table created successfully!',
				description: `Table "${formData.name}" has been created.`,
			});

			if (onTableCreated && result) {
				onTableCreated(result);
			}

			card.close();
		} catch (error) {
			console.error('Failed to create table:', error);
			showErrorToast({
				message: 'Failed to create table',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<div className='flex h-full flex-col'>
			<ScrollArea className='min-h-0 flex-1'>
				<form id='create-table-form' onSubmit={handleSubmit} className='space-y-6 p-6'>
					<div className='grid gap-4'>
						{/* Table Name - Required */}
						<div className='grid gap-2'>
							<Label htmlFor='name'>
								Table Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='name'
								placeholder='users'
								value={formData.name}
								onChange={(e) => handleInputChange('name', e.target.value)}
								required
								autoComplete='off'
								autoFocus
								className={isDuplicate ? 'border-destructive' : ''}
							/>
							{isDuplicate && <p className='text-destructive text-xs'>A table with this name already exists</p>}
							<p className='text-muted-foreground flex items-center gap-1 text-xs'>
								<RiInformationLine className='size-4' />
								Choose your table name carefully.
							</p>
						</div>

						{/* Use RLS */}
						<div className='flex items-center justify-between'>
							<div className='grid gap-1'>
								<Label htmlFor='useRls'>Enable Row Level Security (RLS)</Label>
								<p className='text-muted-foreground text-xs'>
									Restrict access to individual rows based on the current user
								</p>
							</div>
							<Switch
								id='useRls'
								checked={formData.useRls}
								onCheckedChange={(checked) => handleInputChange('useRls', checked)}
							/>
						</div>
					</div>
				</form>
			</ScrollArea>

			<div className='flex justify-end gap-2 border-t p-4'>
				<Button type='button' variant='outline' disabled={createTableMutation.isPending} onClick={() => card.close()}>
					Cancel
				</Button>
				<Button type='submit' form='create-table-form' disabled={createTableMutation.isPending || !isValidName}>
					{createTableMutation.isPending && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
					{createTableMutation.isPending ? 'Creating...' : 'Create Table'}
				</Button>
			</div>
		</div>
	);
};
