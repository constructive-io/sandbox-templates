import { memo } from 'react';
import { RiMore2Fill } from '@remixicon/react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { TooltipProvider } from '@constructive-io/ui/tooltip';
import { type TableField, type TableNode as TableNodeType } from '@/lib/schema';
import { FieldConstraintIcons, NullableIndicator } from './field-constraint-icons';
import { InlineEditableName } from './inline-editable-name';

// Empty set for fallback when no connections are provided
const EMPTY_SET = new Set<string>();

function TableNodeComponent({ id, data }: NodeProps<TableNodeType>) {
  // Use pre-computed connections from parent (injected via node data)
  // This avoids calling useEdges() which would cause cascade re-renders
  const sourceConnections = data.connections?.source ?? EMPTY_SET;
  const targetConnections = data.connections?.target ?? EMPTY_SET;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          `bg-card dark:bg-muted w-72 rounded-xl font-mono
					shadow-[0_1px_1px_rgba(0,0,0,0.02),_0_2px_2px_rgba(0,0,0,0.02),_0_4px_4px_rgba(0,0,0,0.02),_0_8px_8px_rgba(0,0,0,0.02),_0_16px_16px_rgba(0,0,0,0.02),_0_32px_32px_rgba(0,0,0,0.02)]`,
          data.selected ? 'ring-primary ring-2 ring-offset-2' : '',
        )}
      >
        <div
          className='border-border/80 from-background/70 dark:from-background/30 flex items-center justify-between
						border-b bg-linear-to-t px-4 py-3'
        >
          <div className='text-[13px]'>
            <span className='text-muted-foreground/80'>/</span>
            <InlineEditableName tableId={id} tableName={data.label} />
          </div>
          <Button
            size='icon'
            variant='ghost'
            className='text-muted-foreground/60 hover:text-muted-foreground -my-2 -me-2 shadow-none hover:bg-transparent'
            aria-label='Open edit menu'
          >
            <RiMore2Fill className='size-5' aria-hidden='true' />
          </Button>
        </div>
        <div className='py-2 text-xs'>
          {data.fields.map((field: TableField) => {
            // Check if this field is involved in any edge connection
            // Source = this field is the origin of an edge (FK field pointing to another table)
            // Target = this field is the destination of an edge (PK field being referenced)
            const isSource = sourceConnections.has(field.name);
            const isTarget = targetConnections.has(field.name);

            // Show handles for all fields to enable drag-to-connect
            // Connected fields get solid handles, unconnected get transparent handles that show on hover
            const showSourceHandle = isSource || !isTarget; // Show source handle on right for non-target fields
            const showTargetHandle = isTarget || !isSource; // Show target handle on left for non-source fields

            return (
              <div key={field.name} className='group/field relative px-4'>
                <div className='flex items-center gap-1.5 border-dashed py-2 group-not-last:border-b'>
                  {/* Target handle: left side for incoming connections */}
                  {showTargetHandle && (
                    <Handle
                      type='target'
                      position={Position.Left}
                      id={field.name}
                      className={cn(
                        'size-2.5 rounded-full border-2 transition-all',
                        isTarget
                          ? 'bg-foreground! border-background'
                          : 'border-border bg-background opacity-0 group-hover/field:opacity-100 hover:bg-primary hover:border-primary',
                      )}
                    />
                  )}

                  {/* Constraint icons (PK, FK, Unique) */}
                  <FieldConstraintIcons field={field} />

                  {/* Field name */}
                  <span className='truncate font-medium min-w-0 flex-1'>{field.name}</span>

                  {/* Nullable indicator */}
                  <NullableIndicator field={field} />

                  {/* Type badge */}
                  <span className='text-muted-foreground/60 shrink-0 text-right'>{field.type}</span>

                  {/* Source handle: right side for outgoing connections */}
                  {showSourceHandle && (
                    <Handle
                      type='source'
                      position={Position.Right}
                      id={field.name}
                      className={cn(
                        'size-2.5 rounded-full border-2 transition-all',
                        isSource
                          ? 'bg-foreground! border-background'
                          : 'border-border bg-background opacity-0 group-hover/field:opacity-100 hover:bg-primary hover:border-primary',
                      )}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

export const TableNode = memo(TableNodeComponent);
