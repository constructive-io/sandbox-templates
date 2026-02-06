'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { RemixiconComponentType } from '@remixicon/react';

import { SidebarMenuButton, SidebarMenuItem } from '@constructive-io/ui/sidebar';

interface SidebarNavItemProps {
	title: string;
	href: Route;
	icon?: RemixiconComponentType;
	isActive?: boolean;
	testId?: string;
}

export function SidebarNavItem({ title, href, icon: Icon, isActive = false, testId }: SidebarNavItemProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				className='group/menu-button cursor-pointer gap-3 rounded-md font-medium transition-all duration-300 ease-in-out
					bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/40 hover:bg-transparent
					pl-5
					data-[active=true]:from-primary/20 data-[active=true]:to-primary/5
					group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center
					group-data-[collapsible=icon]:mx-auto
					group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:gap-0
					group-data-[collapsible=icon]:hover:bg-sidebar-accent/50
					group-data-[collapsible=icon]:data-[active=true]:bg-primary/15
					[&>svg]:size-5'
				isActive={isActive}
				asChild
				data-testid={testId}
			>
				<Link href={href} replace>
					{Icon && (
						<Icon
							className='shrink-0 text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary'
							aria-hidden={true}
						/>
					)}
					<span className='truncate whitespace-nowrap transition-[width,opacity] duration-300 ease-in-out overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0'>
						{title}
					</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

interface SidebarNavButtonProps {
	title: string;
	icon?: RemixiconComponentType;
	onClick?: () => void;
	disabled?: boolean;
	testId?: string;
}

export function SidebarNavButton({ title, icon: Icon, onClick, disabled, testId }: SidebarNavButtonProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				className='group/menu-button cursor-pointer gap-3 rounded-md font-medium transition-all duration-300 ease-in-out
					bg-gradient-to-r hover:from-sidebar-accent hover:to-sidebar-accent/40 hover:bg-transparent
					pl-5
					group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center
					group-data-[collapsible=icon]:mx-auto
					group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:gap-0
					group-data-[collapsible=icon]:hover:bg-sidebar-accent/50
					[&>svg]:size-5'
				onClick={onClick}
				disabled={disabled}
				data-testid={testId}
			>
				{Icon && <Icon className='shrink-0 text-muted-foreground/60' aria-hidden={true} />}
				<span className='truncate whitespace-nowrap transition-[width,opacity] duration-300 ease-in-out overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0'>
					{title}
				</span>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
