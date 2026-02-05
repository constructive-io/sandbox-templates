'use client';

import { useMemo } from 'react';
import { Button } from '@constructive-io/ui/button';

import { createEmptySchema, parseFromSmartTags, type UISchema } from '@/lib/form-builder';
import { FormRenderer } from '@/lib/form-renderer';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';

interface FormPreviewProps {
	formSchema?: UISchema;
	mode?: 'preview' | 'edit';
}

export function FormPreview({ formSchema, mode = 'preview' }: FormPreviewProps) {
	const { currentTable } = useSchemaBuilderSelectors();

	const effectiveSchema = useMemo((): UISchema | null => {
		if (formSchema) return formSchema;
		if (!currentTable) return null;
		const smartTags = currentTable.smartTags as Record<string, unknown> | undefined;
		if (!smartTags) return null;
		return parseFromSmartTags(smartTags, currentTable.fields ?? [], currentTable.id);
	}, [formSchema, currentTable]);

	const schemaWithMeta = useMemo((): UISchema => {
		if (!effectiveSchema) return createEmptySchema();

		const title = currentTable?.label || currentTable?.name;
		const description = currentTable?.description;

		if (!title && !description) return effectiveSchema;

		return {
			...effectiveSchema,
			meta: {
				...effectiveSchema.meta,
				title: effectiveSchema.meta?.title ?? title,
				description: effectiveSchema.meta?.description ?? description,
			},
		};
	}, [effectiveSchema, currentTable]);

	const hasContent = schemaWithMeta.page.children.length > 0;

	if (!currentTable) {
		return (
			<div className='flex items-center justify-center py-16'>
				<p className='text-muted-foreground'>Select a table to preview the form</p>
			</div>
		);
	}

	if (!hasContent) {
		return (
			<div className='py-4'>
				<div className='mb-8'>
					<h1 className='text-2xl font-bold tracking-tight'>
						{currentTable.label || currentTable.name || 'Untitled Form'}
					</h1>
					{currentTable.description && <p className='text-muted-foreground mt-2'>{currentTable.description}</p>}
				</div>
				<div className='rounded-lg border border-dashed p-8 text-center'>
					<p className='text-muted-foreground'>No elements to display</p>
					<p className='text-muted-foreground mt-1 text-sm'>Add elements in the Form Builder to see them here</p>
				</div>
			</div>
		);
	}

	return (
		<div className='py-4'>
			<FormRenderer
				schema={schemaWithMeta}
				mode={mode}
				onSubmit={(values) => {
					console.log('Form submitted:', values);
				}}
			/>
			<div className='mt-8 pb-4'>
				<Button type='submit' form={schemaWithMeta.id} className='w-full sm:w-auto'>
					Submit
				</Button>
			</div>
		</div>
	);
}
