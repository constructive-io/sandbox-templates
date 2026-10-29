'use client';

import * as React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { CircleAlertIcon, DatabaseIcon, type LucideIcon } from 'lucide-react';

import { describeError, errorKind, type FailureKind } from '@/lib/graphql/errors';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/workspace-kit';

const CARD_CLASS = 'rounded-xl bg-card shadow-card';

const ICONS: Partial<Record<FailureKind, LucideIcon>> = { unavailable: DatabaseIcon, outdated: DatabaseIcon };

/**
 * What an error boundary shows: the resource-kit failure card with one sentence
 * and a retry. The root carries `data-app-error` with the failure's kind, so the
 * desktop's render check fails a page that crashed into a boundary.
 */
export function AppErrorState({ error, retry, className }: { error: unknown; retry?: () => void; className?: string }) {
	const kind = errorKind(error);
	const { reset } = useQueryErrorResetBoundary();

	React.useEffect(() => {
		console.error(error);
	}, [error]);

	const onRetry = () => {
		// A query that threw into the boundary keeps its error until it is reset, and would throw again.
		reset();
		retry?.();
	};

	return (
		<div data-app-error={kind} className={className}>
			<EmptyState
				className={CARD_CLASS}
				icon={ICONS[kind] ?? CircleAlertIcon}
				title='Couldn’t show this page'
				description={<span className='[overflow-wrap:anywhere]'>{describeError(error)}</span>}
				action={
					retry ? (
						<Button size='sm' variant='outline' onClick={onRetry}>
							Try again
						</Button>
					) : undefined
				}
			/>
		</div>
	);
}
