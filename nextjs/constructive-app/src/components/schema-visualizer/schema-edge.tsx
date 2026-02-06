import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position, type EdgeProps } from '@xyflow/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@constructive-io/ui/tooltip';
import {
	ForeignKeyActionLabels,
	RelationshipTypes,
	type ForeignKeyAction,
	type RelationshipType,
	type SchemaEdgeData,
} from '@/lib/schema';

/**
 * Get cardinality symbols based on relationship type.
 */
function getCardinalitySymbols(relationType?: RelationshipType): { source: string; target: string } {
	switch (relationType) {
		case RelationshipTypes.ONE_TO_ONE:
			return { source: '1', target: '1' };
		case RelationshipTypes.MANY_TO_MANY:
			return { source: '∞', target: '∞' };
		case RelationshipTypes.ONE_TO_MANY:
		default:
			return { source: '1', target: '∞' };
	}
}

/**
 * Format FK action for display.
 */
function formatFkAction(action: ForeignKeyAction): string {
	return ForeignKeyActionLabels[action] || action;
}

export function SchemaEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	data,
}: EdgeProps) {
	const [edgePath, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition: sourcePosition || Position.Bottom,
		targetX,
		targetY,
		targetPosition: targetPosition || Position.Top,
		borderRadius: 8,
	});

	const edgeData = data as SchemaEdgeData | undefined;
	const { source: sourceCard, target: targetCard } = getCardinalitySymbols(edgeData?.relationType);

	// Build FK action tooltip content
	const hasActions = edgeData?.onDelete || edgeData?.onUpdate;
	const actionLines: string[] = [];
	if (edgeData?.onDelete) {
		actionLines.push(`ON DELETE ${formatFkAction(edgeData.onDelete)}`);
	}
	if (edgeData?.onUpdate) {
		actionLines.push(`ON UPDATE ${formatFkAction(edgeData.onUpdate)}`);
	}

	return (
		<>
			<BaseEdge path={edgePath} style={style} markerEnd={markerEnd} />
			<EdgeLabelRenderer>
				<div
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						pointerEvents: 'all',
					}}
					className='nodrag nopan'
				>
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className='bg-background/90 border-border/50 text-muted-foreground flex cursor-default items-center
										gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] backdrop-blur-sm'
								>
									<span>{sourceCard}</span>
									<span className='text-border'>─</span>
									<span>{targetCard}</span>
								</div>
							</TooltipTrigger>
							{hasActions && (
								<TooltipContent side='top' className='text-xs'>
									{actionLines.map((line, i) => (
										<div key={i}>{line}</div>
									))}
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
