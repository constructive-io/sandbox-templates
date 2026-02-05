'use client';

import * as React from 'react';
import { RiSearchLine, RiFilterLine, RiGridFill, RiListUnordered, RiAddLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';

export interface EntityListHeaderProps {
	/** Page title */
	title: string;
	/** Search placeholder text */
	searchPlaceholder?: string;
	/** Search value */
	searchValue?: string;
	/** Search change handler */
	onSearchChange?: (value: string) => void;
	/** Current view mode */
	viewMode?: 'grid' | 'list';
	/** View mode change handler */
	onViewModeChange?: (mode: 'grid' | 'list') => void;
	/** Show view mode toggle */
	showViewToggle?: boolean;
	/** Create button label */
	createLabel?: string;
	/** Create button click handler */
	onCreate?: () => void;
	/** Additional class names */
	className?: string;
}

export function EntityListHeader({
	title,
	searchPlaceholder = 'Search...',
	searchValue = '',
	onSearchChange,
	viewMode = 'grid',
	onViewModeChange,
	showViewToggle = true,
	createLabel,
	onCreate,
	className,
}: EntityListHeaderProps) {
	return (
		<div className={cn('space-y-4', className)}>
			{/* Title */}
			<h1 className='text-2xl font-semibold'>{title}</h1>

			{/* Controls row */}
			<div className='flex items-center justify-between gap-4'>
				{/* Search and filter */}
				<div className='flex items-center gap-2'>
					<InputGroup className='w-64'>
						<InputGroupAddon>
							<RiSearchLine />
						</InputGroupAddon>
						<InputGroupInput
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(e) => onSearchChange?.(e.target.value)}
						/>
					</InputGroup>
					<Button variant='outline' size='icon' className='h-9 w-9'>
						<RiFilterLine className='h-4 w-4' />
					</Button>
				</div>

				{/* View toggle and create button */}
				<div className='flex items-center gap-2'>
					{showViewToggle && (
						<div className='flex items-center rounded-md border bg-background p-0.5'>
							<Button
								variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
								size='icon'
								className='h-7 w-7'
								onClick={() => onViewModeChange?.('grid')}
							>
								<RiGridFill className='h-4 w-4' />
							</Button>
							<Button
								variant={viewMode === 'list' ? 'secondary' : 'ghost'}
								size='icon'
								className='h-7 w-7'
								onClick={() => onViewModeChange?.('list')}
							>
								<RiListUnordered className='h-4 w-4' />
							</Button>
						</div>
					)}
					{onCreate && createLabel && (
						<Button onClick={onCreate} className='gap-1.5'>
							<RiAddLine className='h-4 w-4' />
							{createLabel}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
