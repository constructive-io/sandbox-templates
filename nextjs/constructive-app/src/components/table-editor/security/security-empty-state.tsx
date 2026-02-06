'use client';

import { Lock, Shield, ShieldCheck } from 'lucide-react';

import { Button } from '@constructive-io/ui/button';

interface SecurityEmptyStateProps {
	onCreateClick: () => void;
	tableName?: string;
}

export function SecurityEmptyState({ onCreateClick, tableName }: SecurityEmptyStateProps) {
	return (
		<div className='flex items-center justify-center py-12'>
			<div className='bg-card border-border max-w-2xl rounded-lg border p-8'>
				<div className='flex flex-col items-center text-center'>
					<div className='border-primary/20 bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border'>
						<Shield className='text-primary h-10 w-10' />
					</div>

					<h2 className='mb-2 text-xl font-semibold'>
						{tableName ? (
							<>No policies for <span className='capitalize'>{tableName}</span></>
						) : (
							'Create your first policy'
						)}
					</h2>

					<p className='text-muted-foreground mb-6 max-w-md text-sm'>
						{tableName
							? `Add a row-level security policy to control access to ${tableName}. Policies determine who can read, create, update, or delete rows.`
							: 'Create policies to control data access. Row-level security ensures users only see the data they are authorized to access.'}
					</p>

					<Button onClick={onCreateClick}>
						<Shield className='mr-2 h-4 w-4' />
						Create Policy
					</Button>
				</div>

				<div className='border-border mt-8 grid grid-cols-3 gap-4 border-t pt-6'>
					<div className='flex flex-col items-center text-center'>
						<div className='bg-emerald-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<ShieldCheck className='h-5 w-5 text-emerald-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Row-Level Access</h3>
						<p className='text-muted-foreground text-xs'>Control who can see each row</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-purple-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Lock className='h-5 w-5 text-purple-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Secure by Default</h3>
						<p className='text-muted-foreground text-xs'>Deny access unless explicitly allowed</p>
					</div>

					<div className='flex flex-col items-center text-center'>
						<div className='bg-amber-500/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg'>
							<Shield className='h-5 w-5 text-amber-500' />
						</div>
						<h3 className='mb-1 text-sm font-medium'>Role-Based Rules</h3>
						<p className='text-muted-foreground text-xs'>Different access for different roles</p>
					</div>
				</div>
			</div>
		</div>
	);
}
