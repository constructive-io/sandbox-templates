'use client';

import { RiFileList3Line } from '@remixicon/react';

import { cn } from '@/lib/utils';

interface NoTableSelectedViewProps {
	className?: string;
}

export function NoTableSelectedView({ className }: NoTableSelectedViewProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center text-center', className)}>
			<div className='bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
				<RiFileList3Line className='text-muted-foreground h-8 w-8' />
			</div>
			<h3 className='text-foreground mb-2 text-lg font-semibold'>No Table Selected</h3>
			<p className='text-muted-foreground max-w-sm text-sm'>
				Select a table from the sidebar to start building your form. The form will be based on the table&apos;s
				schema.
			</p>
		</div>
	);
}
