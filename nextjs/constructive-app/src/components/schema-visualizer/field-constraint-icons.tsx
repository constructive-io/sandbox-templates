'use client';

import { RiKey2Line, RiLinksLine } from '@remixicon/react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import type { TableField } from '@/lib/schema';

interface FieldConstraintIconsProps {
	field: TableField;
}

/**
 * Displays constraint icons for a table field.
 * Shows PK (key), FK (link), and unique (diamond) indicators.
 */
export function FieldConstraintIcons({ field }: FieldConstraintIconsProps) {
	const hasPrimary = field.isPrimary;
	const hasForeign = field.isForeign;
	const hasUnique = field.isUnique && !field.isPrimary; // PK implies unique, no need to show both

	// Don't render anything if no constraints
	if (!hasPrimary && !hasForeign && !hasUnique) {
		return null;
	}

	return (
		<div className='flex items-center gap-0.5 shrink-0'>
			{hasPrimary && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='flex items-center'>
							<RiKey2Line className='size-3 text-amber-500' />
						</span>
					</TooltipTrigger>
					<TooltipContent side='top' className='text-xs'>
						Primary Key
					</TooltipContent>
				</Tooltip>
			)}
			{hasForeign && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='flex items-center'>
							<RiLinksLine className='size-3 text-primary' />
						</span>
					</TooltipTrigger>
					<TooltipContent side='top' className='text-xs'>
						{field.foreignKey
							? `FK → ${field.foreignKey.targetTable}.${field.foreignKey.targetField}`
							: 'Foreign Key'}
					</TooltipContent>
				</Tooltip>
			)}
			{hasUnique && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className='text-violet-500/70 text-[10px] font-medium leading-none'>◇</span>
					</TooltipTrigger>
					<TooltipContent side='top' className='text-xs'>
						Unique
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
}

interface NullableIndicatorProps {
	field: TableField;
}

/**
 * Displays nullable/required indicator for a field.
 * Shows * for required fields, ? for nullable fields.
 */
export function NullableIndicator({ field }: NullableIndicatorProps) {
	// If nullable is explicitly false or field is primary key, show required
	if (field.isNullable === false || field.isPrimary) {
		return <span className='text-rose-500/50 text-[10px] leading-none'>*</span>;
	}

	// If nullable, show ?
	if (field.isNullable) {
		return <span className='text-muted-foreground/30 text-[10px] leading-none'>?</span>;
	}

	// Default: no indicator
	return null;
}
