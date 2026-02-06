'use client';

import * as React from 'react';
import { RiAddLine, RiExpandUpDownLine } from '@remixicon/react';

import { useMounted } from '@/hooks/use-mounted';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@constructive-io/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@constructive-io/ui/tooltip';

export interface TeamItem {
	name: string;
	logo: string | React.ReactNode;
}

export interface TeamSwitcherProps {
	isExpanded?: boolean;
	teams: TeamItem[];
}

export function TeamSwitcher({ teams, isExpanded = false }: TeamSwitcherProps) {
	const mounted = useMounted();
	const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);

	const renderLogo = React.useCallback((logo: string | React.ReactNode, name: string, size: number = 36) => {
		if (typeof logo === 'string') {
			return <img src={logo} width={size} height={size} alt={name} className='h-full w-full object-contain' />;
		} else {
			return logo;
		}
	}, []);

	// Memoize the logo to prevent re-rendering
	const logoElement = React.useMemo(
		() => (
			<div
				className='text-sidebar-primary-foreground flex aspect-square size-8 flex-shrink-0 items-center justify-center
					overflow-hidden rounded-md bg-transparent'
			>
				{activeTeam && renderLogo(activeTeam.logo, activeTeam.name)}
			</div>
		),
		[activeTeam, renderLogo],
	);

	if (!teams.length) return null;

	// Render a placeholder during SSR to avoid hydration mismatch with Radix IDs
	if (!mounted) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size='lg'
						className='gap-3 transition-all duration-200 [&>svg]:size-auto'
					>
						{logoElement}
						<div
							className={`grid flex-1 text-left text-base leading-tight transition-all duration-200 ${
								isExpanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'
							}`}
						>
							<span className='truncate font-medium whitespace-nowrap'>{activeTeam?.name ?? 'Select a Team'}</span>
						</div>
						<RiExpandUpDownLine
							className={`text-muted-foreground/60 ms-auto transition-all duration-200 ${
								isExpanded ? 'w-5 opacity-100' : 'w-0 opacity-0'
							}`}
							size={20}
							aria-hidden='true'
						/>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	const sidebarMenuButton = (
		<SidebarMenuButton
			size='lg'
			className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3
				transition-all duration-200 [&>svg]:size-auto'
		>
			{logoElement}
			<div
				className={`grid flex-1 text-left text-base leading-tight transition-all duration-200 ${
					isExpanded ? 'w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'
				}`}
			>
				<span className='truncate font-medium whitespace-nowrap'>{activeTeam?.name ?? 'Select a Team'}</span>
			</div>
			<RiExpandUpDownLine
				className={`text-muted-foreground/60 ms-auto transition-all duration-200 ${
					isExpanded ? 'w-5 opacity-100' : 'w-0 opacity-0'
				}`}
				size={20}
				aria-hidden='true'
			/>
		</SidebarMenuButton>
	);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						{!isExpanded ? (
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>{sidebarMenuButton}</TooltipTrigger>
									<TooltipContent side='right' sideOffset={8}>
										<p>{activeTeam?.name ?? 'Select a Team'}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							sidebarMenuButton
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md'
						align='start'
						side='bottom'
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className='text-muted-foreground/60 text-xs uppercase'>Teams</DropdownMenuLabel>
						</DropdownMenuGroup>
						{teams.map((team, index) => (
							<DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className='gap-2 p-2'>
								<div className='flex size-6 items-center justify-center overflow-hidden rounded-md'>
									{renderLogo(team.logo, team.name)}
								</div>
								{team.name}
								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className='gap-2 p-2'>
							<RiAddLine className='opacity-60' size={16} aria-hidden='true' />
							<div className='font-medium'>Add team</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
