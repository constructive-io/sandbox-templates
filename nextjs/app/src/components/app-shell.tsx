'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { fetchCurrentUser, signOut } from '@/lib/auth/auth-api';
import { useSession } from '@/lib/auth/session';
import { initials } from '@/lib/initials';
import { cn } from '@/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResourceNav } from '@/components/ui/resource-kit';
import {
	AppearanceRow,
	focusRingClass,
	MiddleTruncate,
	NavIcon,
	NavRow,
	NavSection,
	SidebarFrame,
	WorkspaceShell,
	type NavRowLinkProps,
	type WorkspaceSidebarRenderProps,
	type WorkspaceTheme,
} from '@/components/ui/workspace-kit';
import { appConfig } from '@/config/app';
import { customNav, homeNav } from '@/config/nav';
import { nav } from '@/resources';

const MONOGRAM_CLASS =
	'grid size-5 shrink-0 place-items-center rounded-md bg-foreground text-[0.5625rem] font-semibold text-background';

function renderLink(props: NavRowLinkProps) {
	return <Link {...props} />;
}

function isActive(pathname: string, href: string) {
	return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
	return (
		<Link
			href='/'
			className={cn(
				'flex h-8 min-w-0 items-center gap-2 rounded-md px-1.5 hover:bg-overlay-hover',
				collapsed ? 'w-8 justify-center px-0' : 'flex-1',
				focusRingClass,
			)}
		>
			<span aria-hidden='true' className={MONOGRAM_CLASS}>
				{initials(appConfig.name) ?? 'A'}
			</span>
			{collapsed ? (
				<span className='sr-only'>{appConfig.name}</span>
			) : (
				<span className='min-w-0 flex-1 truncate text-sm font-medium text-foreground'>{appConfig.name}</span>
			)}
		</Link>
	);
}

/** An email that gives up its middle, never its domain. */
function AccountEmail({ email }: { email: string }) {
	const at = email.lastIndexOf('@');
	return (
		<MiddleTruncate
			text={email}
			tail={at > 0 ? email.length - at : undefined}
			className='text-xs text-muted-foreground'
		/>
	);
}

function AccountMenu({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
	const session = useSession();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { theme, setTheme } = useTheme();
	const { data: user } = useQuery({
		queryKey: ['current-user', session.userId],
		queryFn: fetchCurrentUser,
		enabled: session.status === 'authenticated',
	});
	const email = user?.email ?? null;
	const name = user?.displayName || email || user?.username || 'Account';
	const avatar = (
		<span aria-hidden='true' className={cn(MONOGRAM_CLASS, 'size-6 rounded-full bg-muted text-[0.625rem] text-foreground')}>
			{initials(name) ?? <UserRoundIcon className='size-3' />}
		</span>
	);
	const person = (
		<span className='min-w-0 flex-1 text-start'>
			<span className='block truncate text-[13px] font-medium text-foreground'>{name}</span>
			{email && email !== name ? <AccountEmail email={email} /> : null}
		</span>
	);

	const onSignOut = async () => {
		await signOut();
		queryClient.clear();
		router.replace('/sign-in');
	};

	return (
		<div className='border-t border-sidebar-border p-2'>
			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label={`Account: ${email ?? name}`}
					className={cn(
						'flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-overlay-hover data-[popup-open]:bg-overlay-hover',
						collapsed && 'justify-center',
						focusRingClass,
					)}
				>
					{avatar}
					{collapsed ? null : (
						<>
							{person}
							<ChevronsUpDownIcon aria-hidden='true' className='size-3.5 shrink-0 text-muted-foreground' />
						</>
					)}
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start' side={collapsed ? 'right' : 'top'} className='w-64'>
					<DropdownMenuLabel className='flex items-center gap-2.5 py-2 font-normal'>
						{avatar}
						{person}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<AppearanceRow value={(theme as WorkspaceTheme | undefined) ?? 'system'} onChange={setTheme} />
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem className='gap-2' render={<Link href='/account' onClick={onNavigate} />}>
							<UserRoundIcon aria-hidden='true' className='size-3.5' />
							Account
						</DropdownMenuItem>
						<DropdownMenuItem className='gap-2' variant='destructive' onClick={onSignOut}>
							<LogOutIcon aria-hidden='true' className='size-3.5' />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

/** The signed-in frame: the app's resources in the sidebar, the account at its foot. */
export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname() ?? '/';
	const sidebar = ({ mode, collapsed, onCollapsedChange, onNavigate }: WorkspaceSidebarRenderProps) => {
		const railCollapsed = mode === 'rail' && collapsed;
		return (
			<SidebarFrame
				label={appConfig.name}
				menu={<BrandMark collapsed={railCollapsed} />}
				collapsed={collapsed}
				drawer={mode === 'drawer'}
				onCollapsedChange={onCollapsedChange}
				onClose={onNavigate}
				footer={<AccountMenu collapsed={railCollapsed} onNavigate={onNavigate} />}
			>
				{/* The app's own screens first: home, then hand-written pages. Generated table pages follow. */}
				<NavSection collapsed={railCollapsed}>
					{[{ ...homeNav, href: '/' }, ...customNav].map((entry) => {
						const active = isActive(pathname, entry.href);
						return (
							<NavRow
								key={entry.href}
								label={entry.label}
								href={entry.href}
								active={active}
								collapsed={railCollapsed}
								leading={<NavIcon icon={entry.icon} active={active} />}
								onClick={onNavigate}
								renderLink={renderLink}
							/>
						);
					})}
				</NavSection>
				{nav.length ? (
					<ResourceNav
						title='Data'
						resources={nav}
						activeHref={pathname}
						collapsed={railCollapsed}
						onNavigate={onNavigate}
					/>
				) : null}
			</SidebarFrame>
		);
	};

	return (
		<WorkspaceShell sidebar={sidebar} className='h-dvh'>
			{children}
		</WorkspaceShell>
	);
}
