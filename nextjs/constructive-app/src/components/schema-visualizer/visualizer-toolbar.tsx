'use client';

import { Button } from '@constructive-io/ui/button';
import { useCardStack } from '@constructive-io/ui/stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import { RiFullscreenLine, RiLinksLine, RiTableLine } from '@remixicon/react';

import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { RelationshipCard } from '@/components/table-editor/relationships';
import { AccessModelSelectorCard } from '@/components/tables';

interface VisualizerToolbarProps {
	onFitView: () => void;
}

export function VisualizerToolbar({ onFitView }: VisualizerToolbarProps) {
	const stack = useCardStack();

	const handleCreateTable = () => {
		stack.push({
			id: 'create-table-select-model',
			title: 'Create Table',
			description: 'Securely create a new table based on its access model',
			Component: AccessModelSelectorCard,
			props: {},
			width: CARD_WIDTHS.extraWide,
		});
	};

	const handleCreateRelationship = () => {
		stack.push({
			id: 'create-relationship',
			title: 'Create Relationship',
			Component: RelationshipCard,
			props: { editingRelationship: null },
			width: CARD_WIDTHS.medium,
		});
	};

	return (
		<div className='flex items-center gap-1'>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						className='bg-card text-muted-foreground/80 hover:text-muted-foreground size-9 shadow-none'
						onClick={handleCreateTable}
						aria-label='Create table'
					>
						<RiTableLine className='size-4' aria-hidden='true' />
					</Button>
				</TooltipTrigger>
				<TooltipContent side='bottom'>Create Table</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						className='bg-card text-muted-foreground/80 hover:text-muted-foreground size-9 shadow-none'
						onClick={handleCreateRelationship}
						aria-label='Create relationship'
					>
						<RiLinksLine className='size-4' aria-hidden='true' />
					</Button>
				</TooltipTrigger>
				<TooltipContent side='bottom'>Create Relationship</TooltipContent>
			</Tooltip>

			<div className='bg-border mx-1 h-5 w-px' />

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						className='bg-card text-muted-foreground/80 hover:text-muted-foreground size-9 shadow-none'
						onClick={onFitView}
						aria-label='Fit view'
					>
						<RiFullscreenLine className='size-4' aria-hidden='true' />
					</Button>
				</TooltipTrigger>
				<TooltipContent side='bottom'>Fit View</TooltipContent>
			</Tooltip>
		</div>
	);
}
