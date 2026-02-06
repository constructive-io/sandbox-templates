'use client';

import { RiLink } from '@remixicon/react';

import { useDirectConnect } from '@/store/app-store';
import { Badge } from '@constructive-io/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';

interface DirectConnectIndicatorProps {
	/** Callback when the indicator is clicked */
	onClick?: () => void;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Visual indicator badge that appears when Direct Connect is enabled for the dashboard.
 *
 * Shows a prominent blue-colored badge with "DIRECT CONNECT" text.
 * Clicking opens the DirectConnectDialog (via onClick callback).
 *
 * Only renders when Direct Connect is enabled for the dashboard context.
 * This indicator is dashboard-specific and clearly communicates that
 * Direct Connect only affects the Dashboard/CRM, not the Schema Builder.
 */
export function DirectConnectIndicator({ onClick, className }: DirectConnectIndicatorProps) {
	const { isEnabled, endpoint, skipAuth } = useDirectConnect();

	// Don't render anything if Direct Connect is not enabled
	if (!isEnabled) {
		return null;
	}

	const authStatus = skipAuth ? 'No auth' : 'With auth';

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge
					variant='outline'
					onClick={onClick}
					className={`cursor-pointer border-blue-500/50 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400 ${className ?? ''}`}
				>
					<RiLink className='mr-1 h-3 w-3' />
					DIRECT CONNECT
				</Badge>
			</TooltipTrigger>
			<TooltipContent side='bottom' align='center'>
				<div className='space-y-1'>
					<p className='font-medium'>Direct Connect Active</p>
					{endpoint && <p className='text-muted-foreground max-w-xs truncate text-xs'>{endpoint}</p>}
					<p className='text-muted-foreground text-xs'>{authStatus}. Click to configure.</p>
					<p className='text-muted-foreground text-xs italic'>Schema Builder is unaffected.</p>
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
