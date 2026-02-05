'use client';

import { cn } from '@/lib/utils';

import type { ColorTheme } from './diagram-themes';

/**
 * Diagram node - circular icon with label
 */
interface DiagramNodeProps {
	icon: React.ElementType;
	label: string;
	theme: ColorTheme;
	size?: 'sm' | 'md';
	stacked?: boolean;
}

export function DiagramNode({ icon: Icon, label, theme, size = 'md', stacked }: DiagramNodeProps) {
	const sizeClasses = size === 'sm' ? 'h-12 w-12' : 'h-14 w-14';
	const iconSize = size === 'sm' ? 20 : 24;

	return (
		<div className='flex flex-col items-center gap-2'>
			<div className='relative'>
				{stacked && (
					<>
						<div
							className={cn('absolute -top-1.5 -left-2 rounded-full border-2 bg-white', sizeClasses)}
							style={{ borderColor: theme.border }}
						/>
						<div
							className={cn('absolute -top-0.5 -left-1 rounded-full border-2 bg-white', sizeClasses)}
							style={{ borderColor: theme.border }}
						/>
					</>
				)}
				<div
					className={cn('relative flex items-center justify-center rounded-full border-2 shadow-sm', sizeClasses)}
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<Icon size={iconSize} style={{ color: theme.primary }} />
				</div>
			</div>
			<span className='text-center text-xs text-gray-600 dark:text-gray-300'>{label}</span>
		</div>
	);
}

/**
 * Simple horizontal connector line
 */
interface ConnectorProps {
	theme: ColorTheme;
	width?: number;
	label?: string;
	topLabel?: string;
	topLabelFilled?: boolean;
}

export function Connector({ theme, width = 50, label, topLabel, topLabelFilled }: ConnectorProps) {
	return (
		<div className='relative flex flex-col items-center justify-center'>
			{topLabel && (
				<div
					className={cn(
						`absolute -top-5 left-1/2 -translate-x-1/2 rounded border px-1.5 py-px text-[10px] leading-tight font-medium
						whitespace-nowrap`,
						topLabelFilled ? '' : 'border-dashed',
					)}
					style={{
						borderColor: topLabelFilled ? theme.primary : theme.border,
						backgroundColor: topLabelFilled ? theme.light : 'white',
						color: theme.primary,
					}}
				>
					{topLabel}
				</div>
			)}
			<svg width={width} height='40' viewBox={`0 0 ${width} 40`} fill='none'>
				<circle cx='6' cy='20' r='4' fill={theme.connector} />
				<line
					x1='10'
					y1='20'
					x2={width - 10}
					y2='20'
					stroke={theme.connectorLight}
					strokeWidth='2.5'
					strokeLinecap='round'
				/>
				<circle cx={width - 6} cy='20' r='4' fill={theme.connector} />
			</svg>
			{label && <span className='text-[10px] text-gray-500 dark:text-gray-400'>{label}</span>}
		</div>
	);
}

/**
 * Fan connector - single line splitting into three
 */
interface FanConnectorProps {
	theme: ColorTheme;
	topLabel?: string;
	topLabelFilled?: boolean;
}

export function FanConnector({ theme, topLabel, topLabelFilled }: FanConnectorProps) {
	const labelLength = topLabel?.length || 0;
	const flatWidth = Math.max(40, labelLength * 6 + 16);
	const totalWidth = flatWidth + 40;
	const fanStartX = flatWidth + 4;
	const fanMidX = fanStartX + 3;
	const fanEndX = totalWidth - 12;
	const fanTipX = totalWidth - 6;

	return (
		<div className='relative mr-1 flex flex-col items-center justify-center'>
			{topLabel && (
				<div
					className={cn(
						'absolute -top-1.5 rounded border px-1.5 py-px text-[10px] leading-tight font-medium whitespace-nowrap',
						topLabelFilled ? '' : 'border-dashed',
					)}
					style={{
						borderColor: topLabelFilled ? theme.primary : theme.border,
						backgroundColor: topLabelFilled ? theme.light : 'white',
						color: theme.primary,
						left: (flatWidth + 6) / 2,
						transform: 'translateX(-50%)',
					}}
				>
					{topLabel}
				</div>
			)}
			<svg width={totalWidth} height='40' viewBox={`0 0 ${totalWidth} 40`} fill='none'>
				<circle cx='6' cy='20' r='4' fill={theme.connector} />
				<line
					x1='10'
					y1='20'
					x2={fanStartX}
					y2='20'
					stroke={theme.connectorLight}
					strokeWidth='2.5'
					strokeLinecap='round'
				/>
				<circle cx={fanMidX} cy='20' r='3' fill={theme.connector} />
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='8'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='20'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='32'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<circle cx={fanTipX} cy='8' r='3' fill={theme.connector} />
				<circle cx={fanTipX} cy='20' r='3' fill={theme.connector} />
				<circle cx={fanTipX} cy='32' r='3' fill={theme.connector} />
			</svg>
		</div>
	);
}

/**
 * Scope container - rounded box with shield badge
 */
interface ScopeContainerProps {
	theme: ColorTheme;
	label: string;
	children: React.ReactNode;
}

export function ScopeContainer({ theme, label, children }: ScopeContainerProps) {
	return (
		<div className='relative flex flex-col items-center'>
			<div
				className='relative rounded-xl border-2 px-4 py-3'
				style={{ backgroundColor: theme.light, borderColor: theme.border }}
			>
				{children}
			</div>
			<span className='mt-1.5 text-xs font-medium' style={{ color: theme.primary }}>
				{label}
			</span>
		</div>
	);
}
