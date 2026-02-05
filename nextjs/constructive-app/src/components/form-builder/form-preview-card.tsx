'use client';

import { ScrollArea } from '@constructive-io/ui/scroll-area';
import type { CardComponent } from '@constructive-io/ui/stack';

import type { UISchema } from '@/lib/form-builder';

import { NoTableSelectedView } from './no-table-selected-view';
import { FormPreview } from './preview';

export type FormPreviewCardProps = {
	hasTable: boolean;
	formSchema?: UISchema;
};

export const FormPreviewCard: CardComponent<FormPreviewCardProps> = ({ hasTable, formSchema }) => {
	return (
		<div className='flex h-full min-h-0 flex-col'>
			<ScrollArea className='min-h-0 flex-1 px-4'>
				<div className='px-2'>
					{hasTable ? (
						<FormPreview formSchema={formSchema} />
					) : (
						<div className='flex min-h-full items-start justify-center pt-20'>
							<NoTableSelectedView />
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};
