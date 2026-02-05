'use client';

import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import {
	RiExpandUpDownLine,
	RiCheckLine,
	RiGlobalLine,
	RiLockLine,
	RiEarthLine,
} from '@remixicon/react';

import type { ApiOption, DashboardContextState } from '@/components/dashboard/dashboard-context-selector';
import { useDashboardContext } from '@/components/dashboard/dashboard-context-selector';
import { cn } from '@/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@constructive-io/ui/dropdown-menu';
import { ProgressiveBlur } from '@constructive-io/ui/progressive-blur';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';

const VIRTUALIZATION_THRESHOLD = 10;

interface ApiEntitySwitcherProps {
	size?: 'sm' | 'md';
	className?: string;
	context?: DashboardContextState;
}

function ApiIcon({ isPublic, className }: { isPublic: boolean | null; className?: string }) {
	if (isPublic) {
		return <RiEarthLine className={cn('text-emerald-500', className)} />;
	}
	return <RiLockLine className={cn('text-amber-500', className)} />;
}

interface ApiMenuItemProps {
	api: ApiOption;
	isSelected: boolean;
	onSelect: () => void;
}

function ApiMenuItem({ api, isSelected, onSelect }: ApiMenuItemProps) {
	return (
		<DropdownMenuItem onClick={onSelect} className='group gap-2 py-2 pr-2'>
			<ApiIcon isPublic={api.isPublic} className='h-4 w-4 shrink-0' />
			<div className='min-w-0 flex-1'>
				<Tooltip delayDuration={500}>
					<TooltipTrigger asChild>
						<span className='block truncate text-sm'>{api.name}</span>
					</TooltipTrigger>
					<TooltipContent side='top' align='start' className='max-w-xs'>
						<div className='space-y-1'>
							<p className='font-medium'>{api.name}</p>
							{api.url && <p className='font-mono text-xs opacity-70'>{api.url}</p>}
						</div>
					</TooltipContent>
				</Tooltip>
				{api.domain && (
					<span className='text-muted-foreground block truncate text-xs'>
						{api.subdomain ? `${api.subdomain}.` : ''}
						{api.domain}
					</span>
				)}
			</div>
			<div className='w-4 shrink-0'>
				{isSelected && <RiCheckLine className='text-primary h-4 w-4' aria-hidden='true' />}
			</div>
		</DropdownMenuItem>
	);
}

export function ApiEntitySwitcher({ size = 'sm', className, context }: ApiEntitySwitcherProps) {
	const defaultContext = useDashboardContext();
	const ctx = context ?? defaultContext;

	const {
		apiOptions,
		selectedApiId,
		selectApi,
		servicesLoading,
		servicesError,
		currentApi,
		noDatabaseSelected,
	} = ctx;

	const scrollRef = useRef<HTMLDivElement>(null);
	const [showBottomBlur, setShowBottomBlur] = useState(false);

	const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const el = event.currentTarget;
		const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
		setShowBottomBlur(!(atBottom || el.scrollHeight <= el.clientHeight));
	}, []);

	const shouldVirtualize = apiOptions.length >= VIRTUALIZATION_THRESHOLD;

	React.useEffect(() => {
		if (shouldVirtualize) {
			const el = scrollRef.current;
			if (el) {
				const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
				setShowBottomBlur(!(atBottom || el.scrollHeight <= el.clientHeight));
			}
		}
	}, [shouldVirtualize, apiOptions.length]);

	const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
	const isDisabled = noDatabaseSelected || servicesLoading;
	const hasApis = apiOptions.length > 0;

	// Determine display state
	const getDisplayContent = () => {
		if (noDatabaseSelected) {
			return { label: 'Select database first', icon: <RiGlobalLine className={cn('text-muted-foreground/50', sizeClasses)} /> };
		}
		if (servicesLoading) {
			return { label: 'Loading APIs...', icon: <RiGlobalLine className={cn('text-muted-foreground/50 animate-pulse', sizeClasses)} /> };
		}
		if (!hasApis) {
			return { label: 'No APIs available', icon: <RiGlobalLine className={cn('text-muted-foreground/50', sizeClasses)} /> };
		}
		if (currentApi) {
			return {
				label: currentApi.name,
				icon: <ApiIcon isPublic={currentApi.isPublic} className={sizeClasses} />,
			};
		}
		return { label: 'Select API', icon: <RiGlobalLine className={cn('text-muted-foreground', sizeClasses)} /> };
	};

	const display = getDisplayContent();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				disabled={isDisabled || !hasApis}
				className={cn(
					'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium',
					'transition-colors duration-200',
					'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
					'disabled:pointer-events-none disabled:opacity-50',
					size === 'sm' && 'text-xs px-1.5 py-1',
					className
				)}
			>
				{display.icon}
				<span className={cn('max-w-[100px] truncate', !hasApis && 'text-muted-foreground')}>
					{display.label}
				</span>
				{hasApis && (
					<RiExpandUpDownLine
						className={cn('text-muted-foreground/60 shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
						aria-hidden='true'
					/>
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent align='start' className='w-[280px]'>
				<DropdownMenuGroup>
					<DropdownMenuLabel className='text-muted-foreground/60 flex items-center justify-between text-xs uppercase'>
						<span>APIs</span>
						<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums'>
							{apiOptions.length}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				{servicesError && (
					<>
						<DropdownMenuItem className='text-destructive py-2' disabled>
							Error loading APIs
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}

				{shouldVirtualize ? (
					<div className='relative'>
						<ScrollArea
							ref={scrollRef}
							onScroll={handleScroll}
							className='scrollbar-neutral-thin max-h-[280px]'
						>
							<div className='space-y-0.5 py-1'>
								{apiOptions.map((api) => (
									<ApiMenuItem
										key={api.id}
										api={api}
										isSelected={api.id === selectedApiId}
										onSelect={() => selectApi(api.id)}
									/>
								))}
							</div>
						</ScrollArea>
						{showBottomBlur && <ProgressiveBlur position='bottom' height='18%' blurPx={6} />}
					</div>
				) : (
					apiOptions.map((api) => (
						<ApiMenuItem
							key={api.id}
							api={api}
							isSelected={api.id === selectedApiId}
							onSelect={() => selectApi(api.id)}
						/>
					))
				)}

				{currentApi?.url && (
					<>
						<DropdownMenuSeparator />
						<div className='px-2 py-2'>
							<p className='text-muted-foreground mb-1 text-[10px] font-medium uppercase tracking-wider'>
								Endpoint
							</p>
							<p className='text-muted-foreground truncate font-mono text-xs'>
								{currentApi.url}
							</p>
						</div>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
