'use client';

import { ListChecks, Search, Shield, Zap } from 'lucide-react';

import { Button } from '@constructive-io/ui/button';

interface IndexEmptyStateProps {
	onCreateClick: () => void;
	tableName?: string;
}

export function IndexEmptyState({ onCreateClick, tableName }: IndexEmptyStateProps) {
	return (
		<div className='flex items-center justify-center py-12'>
			<div className='bg-card border-border max-w-2xl rounded-lg border p-8'>
				<div className='flex flex-col items-center text-center'>
					<div className='border-primary/20 bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border'>
						<ListChecks className='text-primary h-10 w-10' />
					</div>

					<h2 className='mb-2 text-xl font-semibold'>
						{tableName ? (
							<>No indexes for <span className='capitalize'>{tableName}</span></>
						) : (
							'Create your first index'
						)}
					</h2>

					<p className='text-muted-foreground mb-6 max-w-md text-sm'>
						{tableName
							? `Add an index to improve query performance on ${tableName}. Indexes speed up data retrieval by creating efficient lookup structures.`
							: 'Create indexes to optimize query performance. Indexes help the database find and retrieve data faster.'}
					</p>

					<Button onClick={onCreateClick}>
						<ListChecks className='mr-2 h-4 w-4' />
						Create Index
					</Button>
				</div>

				<div className='border-border mt-8 grid grid-cols-3 gap-4 border-t pt-6'>
					<div className='flex flex-col items-center text-center'>
						<div className='bg-emerald-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Zap className='h-5 w-5 text-emerald-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Faster Queries</h3>
						<p className='text-muted-foreground text-xs'>Speed up data retrieval operations</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-purple-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Search className='h-5 w-5 text-purple-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Efficient Lookups</h3>
						<p className='text-muted-foreground text-xs'>Quick access to specific rows</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-amber-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Shield className='h-5 w-5 text-amber-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Unique Constraints</h3>
						<p className='text-muted-foreground text-xs'>Enforce data uniqueness rules</p>
					</div>
				</div>
			</div>
		</div>
	);
}
