'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOutIcon, UserRoundIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { fetchCurrentUser, signOut } from '@/lib/auth/auth-api';
import { useSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { AppearanceRow, KeyValueList, Panel, ViewFrame, type WorkspaceTheme } from '@/components/ui/workspace-kit';

export default function AccountPage() {
	const session = useSession();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { theme, setTheme } = useTheme();
	const { data: user, isPending } = useQuery({
		queryKey: ['current-user', session.userId],
		queryFn: fetchCurrentUser,
		enabled: session.status === 'authenticated',
	});

	const onSignOut = async () => {
		await signOut();
		queryClient.clear();
		router.replace('/sign-in');
	};

	const pending = isPending ? 'Loading…' : '—';

	return (
		<ViewFrame icon={UserRoundIcon} title='Account' maxWidth='max-w-2xl'>
			<Panel title='Profile' description='The account you are signed in with.' bodyClassName='pb-2'>
				<KeyValueList
					items={[
						{ key: 'email', label: 'Email', value: user?.email || pending },
						{ key: 'name', label: 'Name', value: user?.displayName || pending },
						{ key: 'username', label: 'Username', value: user?.username || pending },
						{ key: 'id', label: 'User ID', value: <code className='font-mono text-xs'>{session.userId}</code> },
					]}
				/>
			</Panel>
			<Panel title='Appearance' description='Light, dark, or follow the system.' bodyClassName='px-2 pb-3'>
				<AppearanceRow value={(theme as WorkspaceTheme | undefined) ?? 'system'} onChange={setTheme} />
			</Panel>
			<Panel
				title='Session'
				description='Signing out ends this session on this device.'
				actions={
					<Button variant='outline' size='sm' onClick={onSignOut}>
						<LogOutIcon aria-hidden='true' />
						Sign out
					</Button>
				}
			/>
		</ViewFrame>
	);
}
