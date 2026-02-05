import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@constructive-io/ui/avatar';
import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { RiLink, RiLogoutBoxLine, RiSettingsLine, RiToolsLine, RiUserLine } from '@remixicon/react';

import { FeatureFlag } from '@/lib/feature-flags';
import { useLogout } from '@/lib/gql/hooks/auth';
import { useAccountEmail } from '@/lib/gql/hooks/schema-builder/account/use-account-email';
import { useCurrentUser } from '@/lib/gql/hooks/schema-builder/app';
import { useSchemaBuilderAuth } from '@/store/app-store';
import { DirectConnectDialog } from '@/components/runtime/direct-connect-dialog';
import { RuntimeEndpointsDialog } from '@/components/runtime/runtime-endpoints-dialog';

function getAvatarFallback(text: string | null | undefined): string {
	const trimmed = (text ?? '').trim();
	if (!trimmed) return 'U';
	return trimmed[0]?.toUpperCase() ?? 'U';
}

function toUserHandle(username: string | null | undefined): string | null {
	const trimmed = (username ?? '').trim();
	if (!trimmed) return null;
	return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function UserDropdown() {
	const router = useRouter();
	const logoutMutation = useLogout();
	const { isAuthenticated, user: authUser } = useSchemaBuilderAuth();
	const { user: currentUser } = useCurrentUser({ enabled: isAuthenticated });
	const [runtimeEndpointsOpen, setRuntimeEndpointsOpen] = useState(false);
	const [directConnectOpen, setDirectConnectOpen] = useState(false);

	const inferredUsername = authUser?.email?.split('@')[0] || null;

	const handle = toUserHandle(currentUser?.displayName || currentUser?.username || inferredUsername || null);
	const { email } = useAccountEmail({ userId: currentUser?.id ?? '', enabled: isAuthenticated });
	const avatarFallback = getAvatarFallback(currentUser?.displayName || inferredUsername || authUser?.email);

	const handleLogout = () => {
		// Schema-builder logout cascades to clear all dashboard tokens
		logoutMutation.mutate();
	};

	const handleProfile = () => {
		router.push('/account/profile');
	};

	const handleAccountSettings = () => {
		router.push('/account/settings');
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='h-auto p-0 hover:bg-transparent'>
						<Avatar className='size-8'>
							{/* <AvatarImage src='https://via.placeholder.com/32x32' width={32} height={32} alt='Profile image' /> */}
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-52' align='end'>
					<DropdownMenuGroup>
						<DropdownMenuLabel className='flex min-w-0 flex-col space-y-1'>
							<span className='text-foreground truncate text-sm font-medium'>Account</span>
							{(handle || email) && (
								<span className='text-muted-foreground truncate text-xs font-medium'>{handle || email}</span>
							)}
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={handleProfile}>
							<RiUserLine size={16} className='opacity-60' aria-hidden='true' />
							<span>Profile</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleAccountSettings}>
							<RiSettingsLine size={16} className='opacity-60' aria-hidden='true' />
							<span>Account settings</span>
						</DropdownMenuItem>
						<FeatureFlag flag='devMode'>
							<DropdownMenuSeparator />
							<DropdownMenuItem className='items-start gap-3 py-2' onSelect={() => setRuntimeEndpointsOpen(true)}>
								<RiToolsLine size={16} className='mt-0.5 opacity-60' aria-hidden='true' />
								<div className='flex min-w-0 flex-1 flex-col'>
									<div className='flex items-center gap-2'>
										<span className='truncate'>Dev mode</span>
										<Badge
											variant='outline'
											className='border-dashed border-amber-500/60 bg-amber-500/10 px-1.5 py-0 text-[10px]
												text-amber-700 dark:text-amber-400'
										>
											Dev
										</Badge>
									</div>
									<span className='text-muted-foreground text-xs'>Schema Builder endpoint</span>
								</div>
							</DropdownMenuItem>
							<FeatureFlag flag='directConnect'>
								<DropdownMenuItem className='items-start gap-3 py-2' onSelect={() => setDirectConnectOpen(true)}>
									<RiLink size={16} className='mt-0.5 opacity-60' aria-hidden='true' />
									<div className='flex min-w-0 flex-1 flex-col'>
										<div className='flex items-center gap-2'>
											<span className='truncate'>Direct Connect</span>
											<Badge
												variant='outline'
												className='border-dashed border-amber-500/60 bg-amber-500/10 px-1.5 py-0 text-[10px]
													text-amber-700 dark:text-amber-400'
											>
												Dev{' '}
											</Badge>
										</div>
										<span className='text-muted-foreground text-xs'>Dashboard endpoint override</span>
									</div>
								</DropdownMenuItem>
							</FeatureFlag>
						</FeatureFlag>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
						<RiLogoutBoxLine size={16} className='opacity-60' aria-hidden='true' />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<FeatureFlag flag='devMode'>
				<RuntimeEndpointsDialog open={runtimeEndpointsOpen} onOpenChange={setRuntimeEndpointsOpen} trigger={null} />
				<FeatureFlag flag='directConnect'>
					<DirectConnectDialog open={directConnectOpen} onOpenChange={setDirectConnectOpen} trigger={null} />
				</FeatureFlag>
			</FeatureFlag>
		</>
	);
}
