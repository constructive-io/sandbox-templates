'use client';

import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { RiTableLine } from '@remixicon/react';
import { Plus } from 'lucide-react';

import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { cn } from '@/lib/utils';
import { AccessModelSelectorCard } from '@/components/tables';

interface NoTableSelectedViewProps {
	className?: string;
}

export function NoTableSelectedView({ className }: NoTableSelectedViewProps) {
	const { selectTable } = useSchemaBuilderSelectors();
	const stack = useCardStack();

	const handleCreateTable = () => {
		stack.push({
			id: 'create-table-select-model',
			title: 'Create Table',
			description: 'Securely create a new table based on its access model',
			Component: AccessModelSelectorCard,
			props: {
				onTableCreated: (table: { id: string; name: string }) => {
					selectTable(table.id, table.name);
				},
			},
			width: CARD_WIDTHS.extraWide,
		});
	};

	return (
		<div className={cn('flex flex-1 items-center justify-center p-6', className)}>
			<div className='text-center'>
				<div className='bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
					<RiTableLine className='text-muted-foreground h-8 w-8' />
				</div>
				<h3 className='mb-2 text-lg font-medium'>No Table Selected</h3>
				<p className='text-muted-foreground mb-6 max-w-md text-sm'>
					Select a table from the sidebar to start editing its structure, or create a new table to get started.
				</p>
				<Button onClick={handleCreateTable}>
					<Plus className='h-4 w-4' />
					Create Table
				</Button>
			</div>
		</div>
	);
}
