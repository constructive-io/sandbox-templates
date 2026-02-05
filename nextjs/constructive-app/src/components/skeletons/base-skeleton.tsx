'use client';

import { cn } from '@/lib/utils';

/**
 * Enhanced skeleton with shimmer effect.
 * Uses a performant CSS-only shimmer animation that flows across elements.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton'
			className={cn(
				'relative overflow-hidden rounded-md',
				// Base color with subtle gradient
				'bg-gradient-to-r from-zinc-200/80 via-zinc-100/60 to-zinc-200/80',
				'dark:from-zinc-800/80 dark:via-zinc-700/40 dark:to-zinc-800/80',
				// Shimmer effect overlay
				'before:absolute before:inset-0 before:-translate-x-full',
				'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
				'dark:before:via-white/5',
				'before:animate-[shimmer-slide_2s_ease-in-out_infinite]',
				className
			)}
			{...props}
		/>
	);
}

/**
 * Skeleton block with pulse animation instead of shimmer.
 * Good for larger content areas where shimmer would be too busy.
 */
export function SkeletonPulse({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton-pulse'
			className={cn(
				'rounded-md animate-pulse',
				'bg-zinc-200/60 dark:bg-zinc-800/60',
				className
			)}
			{...props}
		/>
	);
}

/**
 * Skeleton text line - mimics text content with natural line-height.
 */
export function SkeletonText({
	className,
	width = 'w-full',
	...props
}: React.ComponentProps<'div'> & { width?: string }) {
	return (
		<Skeleton
			className={cn('h-3.5 rounded', width, className)}
			{...props}
		/>
	);
}

/**
 * Skeleton with fade-out transition for smooth content replacement.
 */
export function SkeletonContainer({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton-container'
			className={cn(
				'transition-opacity duration-200 ease-out',
				'motion-reduce:transition-none',
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
}

/**
 * Wrapper for content that fades in after skeleton.
 */
export function ContentFadeIn({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='content-fade-in'
			className={cn(
				'animate-in fade-in-0 duration-200 ease-out',
				'motion-reduce:animate-none',
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
}

/**
 * Icon skeleton - circular placeholder for icons/avatars.
 */
export function SkeletonIcon({
	className,
	size = 'md',
	...props
}: React.ComponentProps<'div'> & { size?: 'sm' | 'md' | 'lg' }) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-8 w-8',
	};
	return (
		<Skeleton
			className={cn('rounded-md', sizeClasses[size], className)}
			{...props}
		/>
	);
}

/**
 * Badge skeleton - pill-shaped placeholder.
 */
export function SkeletonBadge({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<Skeleton
			className={cn('h-5 w-14 rounded-full', className)}
			{...props}
		/>
	);
}

/**
 * Button skeleton - matches common button sizes.
 */
export function SkeletonButton({
	className,
	size = 'default',
	...props
}: React.ComponentProps<'div'> & { size?: 'sm' | 'default' | 'lg' }) {
	const sizeClasses = {
		sm: 'h-8 w-16',
		default: 'h-9 w-20',
		lg: 'h-10 w-24',
	};
	return (
		<Skeleton
			className={cn('rounded-md', sizeClasses[size], className)}
			{...props}
		/>
	);
}
