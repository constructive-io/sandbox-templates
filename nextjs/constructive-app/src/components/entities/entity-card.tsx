'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { RiArrowRightSLine, RiPauseCircleLine, RiInformationLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import { Badge } from '@constructive-io/ui/badge';

export interface EntityCardProps {
	/** Unique identifier */
	id: string;
	/** Entity name/title */
	name: string;
	/** Optional description or subtitle */
	description?: string;
	/** Optional status badge */
	status?: {
		label: string;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
		icon?: React.ReactNode;
	};
	/** Whether to render a divider above the status footer */
	statusDivider?: boolean;
	/** Optional tags/badges */
	tags?: Array<{
		label: string;
		variant?: 'default' | 'secondary' | 'outline';
	}>;
	/** Link to entity details */
	href: string;
	/** Additional class names */
	className?: string;
}

export function EntityCard({ id, name, description, status, statusDivider = true, tags, href, className }: EntityCardProps) {
	return (
		<Link
			href={href as Route}
			className={cn(
				'group relative flex flex-col rounded-lg border bg-card p-5',
				'transition-all duration-200',
				'hover:border-primary/50 hover:shadow-md',
				className
			)}
		>
			{/* Header with name and arrow */}
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0 flex-1'>
					<h3 className='text-base font-semibold text-foreground truncate'>{name}</h3>
					{description && (
						<p className='text-sm text-muted-foreground mt-0.5 truncate'>{description}</p>
					)}
				</div>
				<RiArrowRightSLine
					className='h-5 w-5 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary'
					aria-hidden='true'
				/>
			</div>

			{/* Tags */}
			{tags && tags.length > 0 && (
				<div className='flex flex-wrap gap-1.5 mt-3'>
					{tags.map((tag, index) => (
						<Badge key={index} variant={tag.variant ?? 'outline'} className='text-xs'>
							{tag.label}
						</Badge>
					))}
				</div>
			)}

			{/* Status footer */}
			{status && (
				<div
					className={cn(
						'flex items-center gap-2',
						statusDivider ? 'mt-auto pt-4 border-t border-border/50' : 'mt-3',
					)}
				>
					{status.icon ? (
						status.icon
					) : (
						<RiPauseCircleLine className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
					)}
					<span className='text-sm text-muted-foreground'>{status.label}</span>
					<RiInformationLine
						className='h-4 w-4 text-muted-foreground/50 ml-auto'
						aria-hidden='true'
					/>
				</div>
			)}
		</Link>
	);
}

export interface EntityCardGridProps {
	children: React.ReactNode;
	className?: string;
}

export function EntityCardGrid({ children, className }: EntityCardGridProps) {
	return (
		<div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
			{children}
		</div>
	);
}
