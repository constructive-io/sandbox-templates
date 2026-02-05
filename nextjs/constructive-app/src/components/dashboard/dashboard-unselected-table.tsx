import { RiDatabaseLine } from '@remixicon/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@constructive-io/ui/card';
import { MotionGrid } from '@constructive-io/ui/motion-grid';
import { Skeleton } from '@constructive-io/ui/skeleton';

export function DashboardUnselectedTable() {
	return (
		<div className='border-muted/60 bg-muted/5 relative flex flex-1 items-center justify-center rounded-lg border border-dashed'>
			<div className='pointer-events-none absolute inset-0 opacity-[0.06]'>
				<MotionGrid gridSize={[10, 8]} duration={140} className='size-full' cellClassName='size-1' />
			</div>
			<Card className='border-border/70 relative z-10 w-full max-w-2xl shadow-sm'>
				<CardHeader className='text-center'>
					<div className='from-primary/15 to-primary/5 ring-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-gradient-to-br ring-1'>
						<RiDatabaseLine size={20} className='text-primary' />
					</div>
					<CardTitle className='text-lg'>No table selected</CardTitle>
					<CardDescription>Select a table from the left to view data.</CardDescription>
				</CardHeader>
				<CardContent className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Skeleton className='h-6 w-28' />
						<Skeleton className='h-6 w-24' />
						<Skeleton className='h-6 w-36' />
					</div>
					<div className='space-y-2'>
						{[0, 1, 2, 3, 4].map((i) => (
							<div key={i} className='grid grid-cols-4 gap-2'>
								<Skeleton className='h-8' />
								<Skeleton className='h-8' />
								<Skeleton className='h-8' />
								<Skeleton className='h-8' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
