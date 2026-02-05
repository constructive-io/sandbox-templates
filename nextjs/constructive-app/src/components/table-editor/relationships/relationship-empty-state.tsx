'use client';

import { Link2, Shield, Target, Zap } from 'lucide-react';

import { Button } from '@constructive-io/ui/button';

interface RelationshipEmptyStateProps {
	onCreateClick: () => void;
	tableName?: string;
}

export function RelationshipEmptyState({ onCreateClick, tableName }: RelationshipEmptyStateProps) {
	return (
		<div className='flex items-center justify-center py-12'>
			<div className='bg-card border-border max-w-2xl rounded-lg border p-8'>
				<div className='flex flex-col items-center text-center'>
					<div className='border-primary/20 bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border'>
						<Link2 className='text-primary h-10 w-10' />
					</div>

					<h2 className='mb-2 text-xl font-semibold'>
						{tableName ? (
							<>No relationships for <span className='capitalize'>{tableName}</span></>
						) : (
							'Create your first relationship'
						)}
					</h2>

					<p className='text-muted-foreground mb-6 max-w-md text-sm'>
						{tableName
							? `Add a relationship to connect ${tableName} to other tables. This helps organize your data and maintain consistency.`
							: 'Connect your tables to establish relationships. This helps organize your data and maintain consistency.'}
					</p>

					<Button onClick={onCreateClick}>
						<Link2 className='mr-2 h-4 w-4' />
						Create Relationship
					</Button>
				</div>

				<div className='border-border mt-8 grid grid-cols-3 gap-4 border-t pt-6'>
					<div className='flex flex-col items-center text-center'>
						<div className='bg-emerald-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Shield className='h-5 w-5 text-emerald-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Data Integrity</h3>
						<p className='text-muted-foreground text-xs'>Maintain consistency across tables</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-purple-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Target className='h-5 w-5 text-purple-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Referential Actions</h3>
						<p className='text-muted-foreground text-xs'>Control cascade & deletion behavior</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-amber-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Zap className='h-5 w-5 text-amber-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Query Optimization</h3>
						<p className='text-muted-foreground text-xs'>Efficient joins & data retrieval</p>
					</div>
				</div>
			</div>
		</div>
	);
}
