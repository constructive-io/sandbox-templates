import React, { useCallback, useRef, useState } from 'react';
import { RiCodeLine } from '@remixicon/react';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { ScrollArea } from '@constructive-io/ui/scroll-area';

interface RelationRecordTooltipProps {
	record: unknown;
}

/**
 * Renders a subtle code icon that shows record data on hover.
 * Matches the visual style used in related-records.tsx.
 */
export function RelationRecordTooltip({ record }: RelationRecordTooltipProps) {
	const [open, setOpen] = useState(false);
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	if (!record || typeof record !== 'object') {
		return null;
	}

	// Format record fields nicely
	const entries = Object.entries(record as Record<string, unknown>).filter(
		([, value]) => value !== null && value !== undefined
	);

	// Cancel any pending close timeout and open
	const handleMouseEnter = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current);
			closeTimeoutRef.current = null;
		}
		setOpen(true);
	};

	// Delay close to allow mouse to travel to popover
	const handleMouseLeave = () => {
		closeTimeoutRef.current = setTimeout(() => {
			setOpen(false);
		}, 100);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="text-muted-foreground/50 hover:text-muted-foreground relative flex shrink-0 cursor-help items-center justify-center rounded p-1 transition-colors before:absolute before:-inset-2 before:content-['']"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={(e) => e.stopPropagation()}
				>
					<RiCodeLine className="h-3.5 w-3.5" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				align="start"
				sideOffset={4}
				className="z-[10000] w-[300px] p-0 shadow-lg"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				{/* Header */}
				<div className="border-border/40 flex items-center gap-2 border-b px-3 py-2">
					<RiCodeLine className="text-muted-foreground h-4 w-4" />
					<span className="text-sm font-medium">Record Data</span>
					<span className="text-muted-foreground bg-muted/40 ml-auto rounded px-1.5 py-0.5 text-xs">
						{entries.length} fields
					</span>
				</div>

				{/* Content */}
				<ScrollArea className="max-h-[240px]">
					<div className="space-y-0">
						{entries.map(([key, value]) => (
							<div key={key} className="border-border/20 border-b px-3 py-2 last:border-b-0">
								<div className="text-muted-foreground text-xs">{key}</div>
								<div className={cn(
									"text-sm break-all",
									value === null || value === undefined ? "text-muted-foreground/50 italic" : "text-foreground"
								)}>
									{formatValue(value)}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}

function formatValue(value: unknown): string {
	if (value === null || value === undefined) return 'null';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}
