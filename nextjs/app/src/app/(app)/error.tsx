'use client';

import { CircleAlertIcon } from 'lucide-react';

import { AppErrorState } from '@/components/app-error';
import { ViewFrame } from '@/components/ui/workspace-kit';

/** A page under (app) that crashed: the error inside the shell, so the sidebar still works. */
export default function AppPageError({ error, retry }: { error: unknown; retry: () => void }) {
	return (
		<ViewFrame icon={CircleAlertIcon} title='Something went wrong' maxWidth='max-w-2xl'>
			<AppErrorState error={error} retry={retry} />
		</ViewFrame>
	);
}
